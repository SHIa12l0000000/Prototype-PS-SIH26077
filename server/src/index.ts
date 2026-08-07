import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import modelsRoutes from './routes/modelsRoutes.js';
import autonomousRoutes from './routes/autonomousRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api', newsRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', modelsRoutes);
app.use('/api', autonomousRoutes);
app.use('/api', agentRoutes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to TechPulse AI Intelligence & Trend API',
    endpoints: {
      health: '/api/health',
      news: '/api/news',
      analytics: '/api/analytics',
      modelStatus: '/api/models/status',
      autonomous: '/api/autonomous/status'
    }
  });
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  logger.info(`⚡ TechPulse AI Express Server listening on http://localhost:${PORT}`);
});
