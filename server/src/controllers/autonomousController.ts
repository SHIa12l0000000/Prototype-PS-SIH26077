import { Request, Response } from 'express';
import { autonomousSchedulerService } from '../services/autonomousSchedulerService.js';
import { topicDiscoveryService } from '../services/topicDiscoveryService.js';
import { memoryService } from '../services/memoryService.js';

export const getAutonomousStatus = (_req: Request, res: Response) => {
  try {
    const status = autonomousSchedulerService.getStatus();
    const memoryStats = memoryService.getMemoryStats();
    const recentJobs = autonomousSchedulerService.getJobs();
    const discoveredTopics = topicDiscoveryService.getDiscoveredTopics();

    res.json({
      success: true,
      data: {
        scheduler: status,
        memory: memoryStats,
        discoveredTopicsCount: discoveredTopics.length,
        discoveredTopics,
        jobs: recentJobs
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const triggerAutonomousWorkflow = async (_req: Request, res: Response) => {
  try {
    const job = await autonomousSchedulerService.runAutonomousPulseWorkflow();
    res.json({ success: true, message: 'Autonomous workflow executed successfully.', job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleAutonomousScheduler = (req: Request, res: Response) => {
  try {
    const { enable } = req.body;
    const currentState = autonomousSchedulerService.toggleAutoRun(Boolean(enable));
    res.json({ success: true, autoRunEnabled: currentState });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
