import { Request, Response } from 'express';
import { getAnalyticsData } from '../services/analyticsService.js';

export const getAnalytics = (_req: Request, res: Response) => {
  try {
    const data = getAnalyticsData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
