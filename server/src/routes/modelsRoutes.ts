import { Router } from 'express';
import { getModels } from '../controllers/modelsController.js';

const router = Router();

router.get('/models/status', getModels);

export default router;
