import { Router } from 'express';
import { getAutonomousStatus, triggerAutonomousWorkflow, toggleAutonomousScheduler } from '../controllers/autonomousController.js';

const router = Router();

router.get('/autonomous/status', getAutonomousStatus);
router.post('/autonomous/trigger', triggerAutonomousWorkflow);
router.post('/autonomous/toggle', toggleAutonomousScheduler);

export default router;
