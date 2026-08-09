import { Request, Response } from "express";
import { agentService } from "../services/agentService.js";

/**
 * POST /api/agent/init
 *
 * Initializes the autonomous agent.
 */
export const initAgent = (
  req: Request,
  res: Response
): Response => {
  try {
    const persona = req.body?.persona;

    // Validate request
    if (
      !persona ||
      typeof persona !== "object" ||
      typeof persona.name !== "string" ||
      typeof persona.domain !== "string" ||
      !persona.name.trim() ||
      !persona.domain.trim()
    ) {
      return res.status(400).json({
        error:
          "Invalid request payload. Expected { persona: { name: string, domain: string } }",
      });
    }

    // Initialize autonomous agent
    const agentId = agentService.initializeAgent({
      name: persona.name.trim(),
      domain: persona.domain.trim(),
    });

    // Required hackathon response
    return res.status(200).json({
      agentId,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to initialize autonomous agent";

    return res.status(500).json({
      error: message,
    });
  }
};

/**
 * GET /api/agent/feed?agentId=abc-123
 *
 * This is the only endpoint the evaluator calls
 * after initialization.
 */
export const getAgentFeed = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const rawAgentId = req.query.agentId;

    // If no agent ID is supplied, return the required empty shape.
    if (
      typeof rawAgentId !== "string" ||
      !rawAgentId.trim()
    ) {
      return res.status(200).json({
        posts: [],
      });
    }

    const agentId = rawAgentId.trim();

    // getAgentFeed is async because it can load
    // persisted posts from Supabase.
    const posts =
      await agentService.getAgentFeed(agentId);

    // Ensure newest posts appear first.
    const sortedPosts = [...posts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    // Required hackathon response shape.
    return res.status(200).json({
      posts: sortedPosts,
    });
  } catch (error: unknown) {
    console.error(
      "GET /api/agent/feed error:",
      error
    );

    return res.status(200).json({
      posts: [],
    });
  }
};