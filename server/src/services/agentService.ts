import { Persona, AgentPost, AgentInstance } from '../models/agentTypes.js';
import { geminiService } from './geminiService.js';
import { logger } from '../utils/logger.js';

// In-memory store for active autonomous agents
const agentStore = new Map<string, AgentInstance>();
const agentSchedulers = new Map<string, NodeJS.Timeout>();

export class AgentService {
  /**
   * Initializes a new autonomous agent instance
   */
  public initializeAgent(persona: Persona): string {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    logger.autonomous('AgentService', `Initializing new Autonomous Agent [${agentId}]`, {
      name: persona.name,
      domain: persona.domain
    });

    const instance: AgentInstance = {
      agentId,
      persona: {
        name: persona.name || 'TechPulse AI',
        domain: persona.domain || 'Artificial Intelligence and Technology'
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

    // Immediately generate initial post asynchronously using Gemini AI
    this.generateAutonomousPost(agentId).catch(err => {
      logger.error(`Initial generation failed for agent ${agentId}:`, err);
    });

    // Start background publishing scheduler for this agent (every 30 seconds)
    const interval = setInterval(() => {
      this.generateAutonomousPost(agentId).catch(err => {
        logger.error(`Scheduled generation failed for agent ${agentId}:`, err);
      });
    }, 30000);

    agentSchedulers.set(agentId, interval);

    return agentId;
  }

  /**
   * Generates a new post autonomously for the given agent using Gemini AI
   */
  public async generateAutonomousPost(agentId: string): Promise<AgentPost | null> {
    const agent = agentStore.get(agentId);
    if (!agent) {
      logger.warn(`Attempted to generate post for non-existent agent: ${agentId}`);
      return null;
    }

    const postIndex = agent.posts.length + 1;
    const timestamp = new Date().toISOString();

    // Call Gemini AI generation service
    const content = await geminiService.generatePostForPersona(
      agent.persona.name,
      agent.persona.domain
    );

    const newPost: AgentPost = {
      id: `post_${agentId}_${Date.now()}_${postIndex}`,
      createdAt: timestamp,
      text: content.text,
      rationale: content.rationale,
      sources: content.sources
    };

    // Store post in agent memory
    agent.posts.unshift(newPost); // Newest first
    agent.memory.topicHistory.push(newPost.text);
    content.sources.forEach(s => agent.memory.sourceIndex.push(s));

    logger.autonomous('AgentService', `Agent [${agentId}] generated AI post #${postIndex}: "${newPost.id}"`);

    return newPost;
  }

  /**
   * Retrieves the posts feed for an agent sorted newest first
   */
  public getAgentFeed(agentId: string): AgentPost[] {
    if (!agentId || typeof agentId !== 'string') {
      return [];
    }

    const agent = agentStore.get(agentId);
    if (!agent) {
      return [];
    }

    // Return posts sorted by createdAt descending
    return [...agent.posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Gets details of an agent instance
   */
  public getAgentDetails(agentId: string): AgentInstance | undefined {
    return agentStore.get(agentId);
  }
}

export const agentService = new AgentService();
