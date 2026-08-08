import {
  Persona,
  AgentPost,
  AgentInstance
} from '../models/agentTypes.js';

import { geminiService } from './geminiService.js';
import { logger } from '../utils/logger.js';
import { ScoredTopic } from './editorialScoringService.js';

// In-memory store for active autonomous agents
const agentStore = new Map<string, AgentInstance>();

// Background schedulers for active agents
const agentSchedulers = new Map<string, NodeJS.Timeout>();

export class AgentService {
  /**
   * Initializes a new autonomous agent instance.
   */
  public initializeAgent(persona: Persona): string {
    const agentId = `agent_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    logger.autonomous(
      'AgentService',
      `Initializing new Autonomous Agent [${agentId}]`,
      {
        name: persona.name,
        domain: persona.domain
      }
    );

    const instance: AgentInstance = {
      agentId,

      persona: {
        name: persona.name || 'TechPulse AI',
        domain:
          persona.domain ||
          'Artificial Intelligence and Technology'
      },

      memory: {
        initializedAt: new Date().toISOString(),
        topicHistory: [],
        sourceIndex: []
      },

      posts: [],

      schedulerActive: true
    };

    agentStore.set(agentId, instance);

    // Generate the first post immediately.
    this.generateAutonomousPost(agentId).catch((err) => {
      logger.error(
        `Initial generation failed for agent ${agentId}:`,
        err
      );
    });

    // Generate another post every 30 seconds.
    const interval = setInterval(() => {
      const currentAgent = agentStore.get(agentId);

      // Agent was removed.
      if (!currentAgent) {
        clearInterval(interval);
        agentSchedulers.delete(agentId);
        return;
      }

      // Scheduler disabled.
      if (!currentAgent.schedulerActive) {
        return;
      }

      this.generateAutonomousPost(agentId).catch((err) => {
        logger.error(
          `Scheduled generation failed for agent ${agentId}:`,
          err
        );
      });
    }, 30000);

    agentSchedulers.set(agentId, interval);

    return agentId;
  }

  /**
   * Generates a new autonomous post.
   */
  public async generateAutonomousPost(
    agentId: string
  ): Promise<AgentPost | null> {
    const agent = agentStore.get(agentId);

    if (!agent) {
      logger.warn(
        `Attempted to generate post for non-existent agent: ${agentId}`
      );

      return null;
    }

    const postIndex = agent.posts.length + 1;
    const timestamp = new Date().toISOString();

    /*
     * Build a valid ScoredTopic.
     *
     * ScoredTopic requires:
     * id
     * topic
     * category
     * sourceVolume
     * velocityGrowth
     * keywords
     * discoveredAt
     * source
     * url
     * summary
     * relevanceScore
     * noveltyScore
     * editorialScore
     * recommendation
     */
    const topic: ScoredTopic = {
      id: `agent-topic-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`,

      topic: `Latest ${agent.persona.domain} Development`,

      category: 'LLMs',

      sourceVolume: 100,

      velocityGrowth: '+50%',

      keywords: [
        'AI',
        'Technology',
        'Innovation',
        agent.persona.domain
      ],

      discoveredAt: timestamp,

      source: 'TechPulse Autonomous Engine',

      url: 'https://arxiv.org/',

      summary:
        `Latest autonomous development in ${agent.persona.domain}.`,

      relevanceScore: 75,

      noveltyScore: 75,

      editorialScore: 75,

      recommendation: 'REVIEW'
    };

    /*
     * Generate content using the content generation service.
     */
    const content =
      await geminiService.generatePostForPersona(
        agent.persona.name,
        agent.persona.domain,
        topic,
        agent.memory.topicHistory
      );

    const newPost: AgentPost = {
      id: `post_${agentId}_${Date.now()}_${postIndex}`,

      createdAt: timestamp,

      text: content.text,

      rationale: content.rationale,

      sources: content.sources
    };

    // Store newest post first.
    agent.posts.unshift(newPost);

    // Store generated text in memory.
    agent.memory.topicHistory.push(newPost.text);

    // Store source URLs without duplicates.
    content.sources.forEach((source) => {
      if (
        source &&
        !agent.memory.sourceIndex.includes(source)
      ) {
        agent.memory.sourceIndex.push(source);
      }
    });

    logger.autonomous(
      'AgentService',
      `Agent [${agentId}] generated AI post #${postIndex}: "${newPost.id}"`
    );

    return newPost;
  }

  /**
   * Retrieves the posts feed for an agent,
   * sorted newest first.
   */
  public getAgentFeed(agentId: string): AgentPost[] {
    if (
      !agentId ||
      typeof agentId !== 'string'
    ) {
      return [];
    }

    const agent = agentStore.get(agentId);

    if (!agent) {
      return [];
    }

    return [...agent.posts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }

  /**
   * Gets details of an agent instance.
   */
  public getAgentDetails(
    agentId: string
  ): AgentInstance | undefined {
    return agentStore.get(agentId);
  }

  /**
   * Stops an agent scheduler.
   */
  public stopAgent(agentId: string): boolean {
    const agent = agentStore.get(agentId);

    if (!agent) {
      return false;
    }

    agent.schedulerActive = false;

    const scheduler = agentSchedulers.get(agentId);

    if (scheduler) {
      clearInterval(scheduler);
      agentSchedulers.delete(agentId);
    }

    logger.autonomous(
      'AgentService',
      `Stopped autonomous agent [${agentId}]`
    );

    return true;
  }

  /**
   * Removes an agent completely.
   */
  public removeAgent(agentId: string): boolean {
    const scheduler = agentSchedulers.get(agentId);

    if (scheduler) {
      clearInterval(scheduler);
      agentSchedulers.delete(agentId);
    }

    const deleted = agentStore.delete(agentId);

    if (deleted) {
      logger.autonomous(
        'AgentService',
        `Removed autonomous agent [${agentId}]`
      );
    }

    return deleted;
  }
}

export const agentService = new AgentService();