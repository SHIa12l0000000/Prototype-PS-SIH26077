import { Router } from 'express';
import { initAgent, getAgentFeed } from '../controllers/agentController.js';

const router = Router();

// Autonomous AI Creator endpoints
router.post('/init', initAgent);
router.get('/feed', getAgentFeed);

export default router;