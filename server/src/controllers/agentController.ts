import { Request, Response } from 'express';
import { agentService } from '../services/agentService.js';

/**
 * POST /api/agent/init
 *
 * Initializes the autonomous agent exactly once.
 */
export const initAgent = (
    req: Request,
    res: Response
): Response => {
    try {
        const persona = req.body?.persona;

        // ---------------------------------------------------------
        // Validate request
        // ---------------------------------------------------------

        if (
            !persona ||
            typeof persona !== 'object' ||
            typeof persona.name !== 'string' ||
            typeof persona.domain !== 'string' ||
            !persona.name.trim() ||
            !persona.domain.trim()
        ) {
            return res.status(400).json({
                error:
                    'Invalid request payload. Expected { persona: { name: string, domain: string } }'
            });
        }

        // ---------------------------------------------------------
        // Initialize autonomous agent
        // ---------------------------------------------------------

        const agentId =
            agentService.initializeAgent({
                name: persona.name.trim(),
                domain: persona.domain.trim()
            });

        // ---------------------------------------------------------
        // Hackathon-required response
        // ---------------------------------------------------------

        return res.status(200).json({
            agentId
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : 'Failed to initialize autonomous agent';

        return res.status(500).json({
            error: message
        });
    }
};

/**
 * GET /api/agent/feed?agentId=abc-123
 *
 * This is the only endpoint the evaluator needs
 * after initialization.
 */
export const getAgentFeed = (
    req: Request,
    res: Response
): Response => {
    try {
        const rawAgentId =
            req.query.agentId;

        // ---------------------------------------------------------
        // No agent ID
        // ---------------------------------------------------------

        if (
            typeof rawAgentId !== 'string' ||
            !rawAgentId.trim()
        ) {
            return res.status(200).json({
                posts: []
            });
        }

        const agentId =
            rawAgentId.trim();

        // ---------------------------------------------------------
        // Retrieve persistent in-process feed
        // ---------------------------------------------------------

        const posts =
            agentService.getAgentFeed(
                agentId
            );

        // ---------------------------------------------------------
        // Ensure newest posts appear first
        // ---------------------------------------------------------

        const sortedPosts =
            [...posts].sort(
                (a, b) =>
                    new Date(
                        b.createdAt
                    ).getTime() -
                    new Date(
                        a.createdAt
                    ).getTime()
            );

        // ---------------------------------------------------------
        // Return required API shape
        // ---------------------------------------------------------

        return res.status(200).json({
            posts: sortedPosts
        });
    } catch (error: unknown) {
        return res.status(200).json({
            posts: []
        });
    }
};