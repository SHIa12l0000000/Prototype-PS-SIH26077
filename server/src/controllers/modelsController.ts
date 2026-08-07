import { Request, Response } from 'express';
import { getModelStatuses } from '../services/modelsService.js';

export const getModels = (_req: Request, res: Response) => {
  try {
    const statuses = getModelStatuses();
    res.json({ success: true, count: statuses.length, data: statuses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
