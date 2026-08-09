import {
  Persona,
  AgentPost,
  AgentInstance,
} from "../models/agentTypes.js";

import { geminiService } from "./geminiService.js";
import { logger } from "../utils/logger.js";

import {
  ScoredTopic,
  editorialScoringService,
} from "./editorialScoringService.js";

import { topicDiscoveryService } from "./topicDiscoveryService.js";
import { memoryService } from "./memoryService.js";

import { supabase } from "../config/supabase.js";

/**
 * ============================================================
 * AUTONOMOUS AGENT STORE
 * ============================================================
 *
 * Runtime agent state is kept in memory.
 *
 * Published posts are ALSO persisted to Supabase so the feed
 * can survive application restarts.
 */
const agentStore = new Map<string, AgentInstance>();

/**
 * Background scheduler for each agent.
 */
const agentSchedulers = new Map<string, NodeJS.Timeout>();

/**
 * Prevent overlapping autonomous cycles.
 */
const runningAgents = new Set<string>();

/**
 * Publish approximately every 15 minutes.
 *
 * This means:
 *
 * Initialization
 *      ↓
 * Immediate autonomous cycle
 *      ↓
 * 15 minutes
 *      ↓
 * Autonomous cycle
 *      ↓
 * 15 minutes
 *      ↓
 * Autonomous cycle
 */
const AGENT_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Minimum editorial score required for publishing.
 */
const AGENT_PUBLISH_THRESHOLD = 75;

export class AgentService {
  /**
   * ============================================================
   * INITIALIZE AGENT
   * ============================================================
   *
   * POST /api/agent/init
   *
   * The evaluator calls this exactly once.
   */
  public initializeAgent(persona: Persona): string {
    const agentId =
      `agent_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

    const normalizedPersona: Persona = {
      name:
        typeof persona?.name === "string" &&
        persona.name.trim()
          ? persona.name.trim()
          : "TechPulse AI",

      domain:
        typeof persona?.domain === "string" &&
        persona.domain.trim()
          ? persona.domain.trim()
          : "Artificial Intelligence and Technology",
    };

    const instance: AgentInstance = {
      agentId,

      persona: normalizedPersona,

      memory: {
        initializedAt: new Date().toISOString(),

        topicHistory: [],

        sourceIndex: [],
      },

      posts: [],

      schedulerActive: true,
    };

    agentStore.set(agentId, instance);

    logger.autonomous(
      "AgentService",
      `Initialized autonomous agent [${agentId}]`,
      {
        name: normalizedPersona.name,
        domain: normalizedPersona.domain,
      }
    );

    /**
     * ==========================================================
     * IMMEDIATE AUTONOMOUS CYCLE
     * ==========================================================
     *
     * Important for hackathon evaluation.
     *
     * The evaluator can initialize the agent and then immediately
     * call /feed without needing another human prompt.
     */
    void this.generateAutonomousPost(agentId).catch((error) => {
      logger.error(
        `Initial autonomous cycle failed for ${agentId}`,
        error
      );
    });

    /**
     * ==========================================================
     * AUTONOMOUS SCHEDULER
     * ==========================================================
     *
     * No further API call is required.
     */
    const interval = setInterval(() => {
      const currentAgent = agentStore.get(agentId);

      if (!currentAgent) {
        clearInterval(interval);

        agentSchedulers.delete(agentId);

        return;
      }

      if (!currentAgent.schedulerActive) {
        return;
      }

      void this.generateAutonomousPost(agentId).catch((error) => {
        logger.error(
          `Scheduled autonomous cycle failed for ${agentId}`,
          error
        );
      });
    }, AGENT_INTERVAL_MS);

    agentSchedulers.set(agentId, interval);

    logger.autonomous(
      "AgentService",
      `Autonomous scheduler started for [${agentId}]`,
      {
        intervalMinutes: AGENT_INTERVAL_MS / 60000,
      }
    );

    return agentId;
  }

  /**
   * ============================================================
   * AUTONOMOUS PUBLISHING CYCLE
   * ============================================================
   *
   * LIVE DISCOVERY
   *       ↓
   * EDITORIAL SCORING
   *       ↓
   * REJECTION
   *       ↓
   * MEMORY CHECK
   *       ↓
   * PERSONA GENERATION
   *       ↓
   * RATIONALE + SOURCES
   *       ↓
   * SUPABASE
   *       ↓
   * FEED
   */
  public async generateAutonomousPost(
    agentId: string
  ): Promise<AgentPost | null> {
    const agent = agentStore.get(agentId);

    if (!agent) {
      logger.warn(
        `Attempted autonomous generation for unknown agent: ${agentId}`
      );

      return null;
    }

    /**
     * Prevent two autonomous cycles from running simultaneously.
     */
    if (runningAgents.has(agentId)) {
      logger.autonomous(
        "AgentService",
        `Skipping overlapping cycle for [${agentId}]`
      );

      return null;
    }

    runningAgents.add(agentId);

    try {
      logger.autonomous(
        "AgentService",
        `Starting autonomous cycle for [${agentId}]`
      );

      /**
       * ========================================================
       * 1. LIVE TOPIC DISCOVERY
       * ========================================================
       */
      const discoveredTopics =
        await topicDiscoveryService.scanTrendingTopics();

      if (
        !discoveredTopics ||
        discoveredTopics.length === 0
      ) {
        logger.autonomous(
          "TopicDiscovery",
          `No live topics discovered for [${agentId}]`
        );

        return null;
      }

      logger.autonomous(
        "TopicDiscovery",
        `Discovered ${discoveredTopics.length} live topics for [${agentId}]`
      );

      /**
       * ========================================================
       * 2. EDITORIAL SCORING
       * ========================================================
       */
      const scoredTopics =
        await editorialScoringService.scoreTopics(
          discoveredTopics
        );

      if (
        !scoredTopics ||
        scoredTopics.length === 0
      ) {
        logger.autonomous(
          "EditorialScoring",
          `No topics could be scored for [${agentId}]`
        );

        return null;
      }

      /**
       * Highest scoring topics first.
       */
      const rankedTopics = [...scoredTopics].sort(
        (a, b) =>
          b.editorialScore -
          a.editorialScore
      );

      logger.autonomous(
        "EditorialScoring",
        `Scored ${rankedTopics.length} topics for [${agentId}]`
      );

      /**
       * ========================================================
       * 3. EDITORIAL DECISION
       * ========================================================
       */
      let selectedTopic: ScoredTopic | null = null;

      for (const candidate of rankedTopics) {
        /**
         * Reject low-quality topics.
         */
        if (
          candidate.editorialScore <
          AGENT_PUBLISH_THRESHOLD
        ) {
          logger.autonomous(
            "EditorialDecision",
            `REJECTED "${candidate.topic}" — score ${candidate.editorialScore}/100`
          );

          continue;
        }

        /**
         * Respect editorial model recommendation.
         */
        if (
          candidate.recommendation !==
          "PUBLISH"
        ) {
          logger.autonomous(
            "EditorialDecision",
            `REJECTED "${candidate.topic}" — recommendation=${candidate.recommendation}`
          );

          continue;
        }

        /**
         * Global memory duplicate check.
         */
        if (
          memoryService.hasTopic(
            candidate.topic
          )
        ) {
          logger.autonomous(
            "EditorialDecision",
            `REJECTED duplicate "${candidate.topic}" — global memory already contains it`
          );

          continue;
        }

        /**
         * Agent-specific memory duplicate check.
         */
        const normalizedCandidate =
          this.normalizeTopic(
            candidate.topic
          );

        const previouslyCovered =
          agent.memory.topicHistory.some(
            (previousTopic) =>
              this.normalizeTopic(
                previousTopic
              ) === normalizedCandidate
          );

        if (previouslyCovered) {
          logger.autonomous(
            "EditorialDecision",
            `REJECTED duplicate "${candidate.topic}" — agent already covered it`
          );

          continue;
        }

        /**
         * Prevent repeatedly using exactly the same source.
         */
        if (
          candidate.url &&
          agent.memory.sourceIndex.includes(
            candidate.url
          )
        ) {
          logger.autonomous(
            "EditorialDecision",
            `REJECTED "${candidate.topic}" — source already used`
          );

          continue;
        }

        /**
         * Topic accepted.
         */
        selectedTopic = candidate;

        break;
      }

      /**
       * ========================================================
       * 4. NO TOPIC QUALIFIED
       * ========================================================
       */
      if (!selectedTopic) {
        logger.autonomous(
          "EditorialDecision",
          `No publishable topic found after evaluating ${rankedTopics.length} candidates`
        );

        return null;
      }

      logger.autonomous(
        "EditorialDecision",
        `SELECTED "${selectedTopic.topic}" (${selectedTopic.editorialScore}/100)`
      );

      /**
       * ========================================================
       * 5. LOAD MEMORY
       * ========================================================
       */
      const previousTopics = [
        ...agent.memory.topicHistory,
        ...memoryService.getPreviousTopics(),
      ]
        .filter(Boolean)
        .slice(-30);

      /**
       * ========================================================
       * 6. GENERATE PERSONA-CONSISTENT CONTENT
       * ========================================================
       */
      const generated =
        await geminiService.generatePostForPersona(
          agent.persona.name,
          agent.persona.domain,
          selectedTopic,
          previousTopics
        );

      if (
        !generated ||
        typeof generated.text !== "string" ||
        !generated.text.trim()
      ) {
        logger.warn(
          `AI generation returned empty content for [${agentId}]`
        );

        return null;
      }

      /**
       * ========================================================
       * 7. VALIDATE SOURCES
       * ========================================================
       */
      const generatedSources =
        Array.isArray(generated.sources)
          ? generated.sources.filter(
              (
                source
              ): source is string =>
                typeof source === "string" &&
                source.trim().length > 0
            )
          : [];

      /**
       * Always preserve the source discovered by the
       * live topic discovery system.
       */
      const sources = Array.from(
        new Set(
          [
            ...generatedSources,
            selectedTopic.url,
          ].filter(
            (
              source
            ): source is string =>
              typeof source === "string" &&
              source.trim().length > 0
          )
        )
      );

      /**
       * Hackathon requires sources.
       */
      if (sources.length === 0) {
        logger.warn(
          `Rejected generated post because no valid source exists: "${selectedTopic.topic}"`
        );

        return null;
      }

      /**
       * ========================================================
       * 8. BUILD TRANSPARENT RATIONALE
       * ========================================================
       */
      const rationale =
        this.buildRationale(
          selectedTopic,
          generated.rationale,
          rankedTopics
        );

      /**
       * ========================================================
       * 9. CREATE FEED POST
       * ========================================================
       */
      const postNumber =
        agent.posts.length + 1;

      const newPost: AgentPost = {
        id:
          `post_${agentId}_${Date.now()}_${postNumber}`,

        createdAt:
          new Date().toISOString(),

        text:
          generated.text.trim(),

        rationale,

        sources,
      };

      /**
       * ========================================================
       * 10. SAVE TO SUPABASE
       * ========================================================
       */
      logger.autonomous(
        "AgentService",
        `Saving autonomous post to Supabase: "${selectedTopic.topic}"`
      );

      const {
        error: postError,
      } = await supabase
        .from("posts")
        .insert({
          id: newPost.id,
          created_at: newPost.createdAt,
          text: newPost.text,
          rationale: newPost.rationale,
          sources: newPost.sources,
        });

      if (postError) {
        logger.error(
          `Failed to persist autonomous post ${newPost.id}: ${postError.message}`,
          postError
        );

        /**
         * Do not claim the post was published when
         * permanent storage failed.
         */
        return null;
      }

      logger.autonomous(
        "AgentService",
        `Persisted autonomous post ${newPost.id} to Supabase`
      );

      /**
       * ========================================================
       * 11. STORE IN AGENT MEMORY
       * ========================================================
       */
      agent.posts.unshift(newPost);

      if (agent.posts.length > 1000) {
        agent.posts.length = 1000;
      }

      /**
       * ========================================================
       * 12. UPDATE AGENT MEMORY
       * ========================================================
       */
      agent.memory.topicHistory.push(
        selectedTopic.topic
      );

      if (
        agent.memory.topicHistory.length >
        500
      ) {
        agent.memory.topicHistory =
          agent.memory.topicHistory.slice(-500);
      }

      for (const source of sources) {
        if (
          !agent.memory.sourceIndex.includes(
            source
          )
        ) {
          agent.memory.sourceIndex.push(
            source
          );
        }
      }

      if (
        agent.memory.sourceIndex.length >
        500
      ) {
        agent.memory.sourceIndex =
          agent.memory.sourceIndex.slice(-500);
      }

      /**
       * ========================================================
       * 13. GLOBAL MEMORY INDEX
       * ========================================================
       */
      if (
        !memoryService.hasTopic(
          selectedTopic.topic
        )
      ) {
        await memoryService.indexArticleMemory(
          selectedTopic.topic,
          selectedTopic.category
        );
      }

      /**
       * ========================================================
       * 14. SUCCESS
       * ========================================================
       */
      logger.autonomous(
        "AgentService",
        `Agent [${agentId}] published autonomous post #${postNumber}`,
        {
          topic:
            selectedTopic.topic,

          score:
            selectedTopic.editorialScore,

          category:
            selectedTopic.category,

          sourceCount:
            sources.length,
        }
      );

      return newPost;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      logger.error(
        `Autonomous agent cycle failed for ${agentId}: ${errorMessage}`,
        error
      );

      return null;
    } finally {
      runningAgents.delete(agentId);
    }
  }

  /**
   * ============================================================
   * GET AGENT FEED
   * ============================================================
   *
   * GET /api/agent/feed?agentId=abc-123
   *
   * Newest posts first.
   */
  public async getAgentFeed(
    agentId: string
  ): Promise<AgentPost[]> {
    if (
      !agentId ||
      typeof agentId !== "string"
    ) {
      return [];
    }

    const agent =
      agentStore.get(agentId);

    /**
     * First return runtime posts when available.
     */
    if (agent && agent.posts.length > 0) {
      return [...agent.posts].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );
    }

    /**
     * ==========================================================
     * FALLBACK TO SUPABASE
     * ==========================================================
     *
     * This protects the feed from empty results after a process
     * restart, provided the posts table contains the records.
     */
    try {
      const {
        data,
        error,
      } = await supabase
        .from("posts")
        .select(
          "id, created_at, text, rationale, sources"
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {
        logger.error(
          `Failed to load feed from Supabase: ${error.message}`,
          error
        );

        return [];
      }

      if (!data) {
        return [];
      }

      return data.map(
        (post): AgentPost => ({
          id: String(post.id),

          createdAt:
            String(post.created_at),

          text:
            String(post.text ?? ""),

          rationale:
            String(post.rationale ?? ""),

          sources:
            Array.isArray(post.sources)
              ? post.sources.filter(
                  (
                    source
                  ): source is string =>
                    typeof source ===
                    "string"
                )
              : [],
        })
      );
    } catch (error) {
      logger.error(
        "Unexpected error while loading feed",
        error
      );

      return [];
    }
  }

  /**
   * ============================================================
   * GET AGENT DETAILS
   * ============================================================
   */
  public getAgentDetails(
    agentId: string
  ): AgentInstance | undefined {
    return agentStore.get(agentId);
  }

  /**
   * ============================================================
   * STOP AGENT
   * ============================================================
   */
  public stopAgent(
    agentId: string
  ): boolean {
    const agent =
      agentStore.get(agentId);

    if (!agent) {
      return false;
    }

    agent.schedulerActive = false;

    const scheduler =
      agentSchedulers.get(agentId);

    if (scheduler) {
      clearInterval(scheduler);

      agentSchedulers.delete(agentId);
    }

    logger.autonomous(
      "AgentService",
      `Stopped autonomous agent [${agentId}]`
    );

    return true;
  }

  /**
   * ============================================================
   * REMOVE AGENT
   * ============================================================
   */
  public removeAgent(
    agentId: string
  ): boolean {
    const scheduler =
      agentSchedulers.get(agentId);

    if (scheduler) {
      clearInterval(scheduler);

      agentSchedulers.delete(agentId);
    }

    runningAgents.delete(agentId);

    const deleted =
      agentStore.delete(agentId);

    if (deleted) {
      logger.autonomous(
        "AgentService",
        `Removed autonomous agent [${agentId}]`
      );
    }

    return deleted;
  }

  /**
   * ============================================================
   * NORMALIZE TOPIC
   * ============================================================
   */
  private normalizeTopic(
    topic: string
  ): string {
    return topic
      .toLowerCase()
      .replace(
        /[^a-z0-9\s]/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  }

  /**
   * ============================================================
   * BUILD PUBLISHING RATIONALE
   * ============================================================
   *
   * The hackathon requires:
   *
   * 1. Why selected
   * 2. Why relevant now
   * 3. Why selected over alternatives
   */
  private buildRationale(
    selectedTopic: ScoredTopic,
    generatedRationale:
      | string
      | undefined,
    rankedTopics: ScoredTopic[]
  ): string {
    const alternatives =
      rankedTopics
        .filter(
          (topic) =>
            topic.id !==
            selectedTopic.id
        )
        .slice(0, 3)
        .map(
          (topic) =>
            `${topic.topic} (${topic.editorialScore}/100)`
        )
        .join("; ");

    const modelReason =
      generatedRationale?.trim() ||
      "The topic was selected by the autonomous editorial engine.";

    const selectionReason =
      `It achieved an editorial score of ${selectedTopic.editorialScore}/100, combining relevance (${selectedTopic.relevanceScore}/100) and novelty (${selectedTopic.noveltyScore}/100).`;

    const currentReason =
      `It is relevant now because it was discovered from a live source during the autonomous discovery cycle at ${selectedTopic.discoveredAt}.`;

    const comparisonReason =
      alternatives
        ? `It was preferred over other candidates including: ${alternatives}.`
        : "No higher-quality eligible candidate was available.";

    return [
      modelReason,
      selectionReason,
      currentReason,
      comparisonReason,
    ].join(" ");
  }
}

export const agentService =
  new AgentService();