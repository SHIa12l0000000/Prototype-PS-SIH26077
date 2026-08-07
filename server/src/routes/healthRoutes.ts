import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'TechPulse AI Backend API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime()
  });
});

export default router;
