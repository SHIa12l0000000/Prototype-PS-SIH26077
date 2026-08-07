import { topicDiscoveryService } from './topicDiscoveryService.js';
import { editorialScoringService } from './editorialScoringService.js';
import { aiContentGenService } from './aiContentGenService.js';
import { memoryService } from './memoryService.js';
import { AutonomousJob } from '../models/types.js';
import { logger } from '../utils/logger.js';

export class AutonomousSchedulerService {
  private activeJobs: AutonomousJob[] = [];
  private isAutoRunEnabled: boolean = true;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.initScheduler();
  }

  private initScheduler() {
    logger.autonomous('Scheduler', 'Initializing Autonomous AI Creator background scheduler (30s heartbeat)...');
    
    // Periodically run autonomous workflow check
    this.timer = setInterval(() => {
      if (this.isAutoRunEnabled) {
        this.runAutonomousPulseWorkflow().catch(err => {
          logger.error('Autonomous workflow error:', err);
        });
      }
    }, 45000);
  }

  public async runAutonomousPulseWorkflow(): Promise<AutonomousJob> {
    const jobId = `job-${Date.now()}`;
    logger.autonomous('Scheduler', `[Triggered] Starting autonomous pulse generation workflow execution: ${jobId}`);

    const job: AutonomousJob = {
      id: jobId,
      type: 'DISCOVERY',
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      logs: ['Job initialized.', 'Executing topic discovery scan...']
    };

    this.activeJobs.unshift(job);
    if (this.activeJobs.length > 20) this.activeJobs.pop();

    try {
      // 1. Topic Discovery
      const rawTopics = await topicDiscoveryService.scanTrendingTopics();
      job.logs.push(`Discovered ${rawTopics.length} trending topics.`);

      // 2. Editorial Scoring
      job.type = 'SCORING';
      const scoredTopics = await editorialScoringService.scoreTopics(rawTopics);
      const topTopic = scoredTopics.find(t => t.recommendation === 'PUBLISH') || scoredTopics[0];
      job.logs.push(`Top topic selected: "${topTopic.topic}" with Editorial Score ${topTopic.editorialScore}/100.`);

      // 3. AI Content Generation
      job.type = 'GENERATION';
      const createdArticle = await aiContentGenService.generatePulseArticle(topTopic);
      job.logs.push(`Article generated & published: "${createdArticle.title}" (ID: ${createdArticle.id}).`);

      // 4. Memory Indexing
      job.type = 'MEMORY_INDEXING';
      await memoryService.indexArticleMemory(topTopic.topic, topTopic.category);
      job.logs.push(`Indexed embedding vector into long-term memory store.`);

      job.status = 'COMPLETED';
      job.completedAt = new Date().toISOString();
      job.payload = createdArticle;
      logger.autonomous('Scheduler', `[Finished] Autonomous job ${jobId} completed successfully!`);

      return job;
    } catch (err: any) {
      job.status = 'FAILED';
      job.logs.push(`Error during workflow: ${err.message || err}`);
      throw err;
    }
  }

  public getJobs(): AutonomousJob[] {
    return this.activeJobs;
  }

  public toggleAutoRun(enable: boolean) {
    this.isAutoRunEnabled = enable;
    logger.autonomous('Scheduler', `Autonomous autorun set to ${enable}`);
    return this.isAutoRunEnabled;
  }

  public getStatus() {
    return {
      autoRunEnabled: this.isAutoRunEnabled,
      activeJobsCount: this.activeJobs.filter(j => j.status === 'RUNNING').length,
      completedJobsCount: this.activeJobs.filter(j => j.status === 'COMPLETED').length,
      lastRunAt: this.activeJobs[0]?.startedAt || 'Never'
    };
  }
}

export const autonomousSchedulerService = new AutonomousSchedulerService();
