import { Request, Response } from 'express';
import { agentService } from '../services/agentService.js';

export const initAgent = (req: Request, res: Response) => {
  try {
    const { persona } = req.body;

    if (!persona || !persona.name || !persona.domain) {
      return res.status(400).json({
        error: 'Invalid request payload. Expected { persona: { name: string, domain: string } }'
      });
    }

    const agentId = agentService.initializeAgent({
      name: persona.name,
      domain: persona.domain
    });

    return res.status(200).json({
      agentId
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Failed to initialize autonomous agent'
    });
  }
};

export const getAgentFeed = (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId as string;

    if (!agentId) {
      return res.status(200).json({ posts: [] });
    }

    const posts = agentService.getAgentFeed(agentId);

    return res.status(200).json({
      posts
    });
  } catch (error: any) {
    return res.status(500).json({
      posts: []
    });
  }
};
