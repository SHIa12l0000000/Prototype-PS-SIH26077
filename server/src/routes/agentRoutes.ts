import { Router } from 'express';
import { initAgent, getAgentFeed } from '../controllers/agentController.js';

const router = Router();

// ABTalks Autonomous AI Creator Endpoints
router.post('/agent/init', initAgent);
router.get('/agent/feed', getAgentFeed);

export default router;
