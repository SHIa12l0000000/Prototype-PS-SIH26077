import { topicDiscoveryService } from './topicDiscoveryService.js';
import { editorialScoringService } from './editorialScoringService.js';
import { aiContentGenService } from './aiContentGenService.js';
import { memoryService } from './memoryService.js';
import { AutonomousJob } from '../models/types.js';
import { logger } from '../utils/logger.js';

export class AutonomousSchedulerService {
    private activeJobs: AutonomousJob[] = [];

    private isAutoRunEnabled = true;

    private timer: NodeJS.Timeout | null = null;

    private readonly PUBLISH_THRESHOLD = 60;

    constructor() {
        this.initScheduler();
    }

    private initScheduler(): void {
        logger.autonomous(
            'Scheduler',
            'Initializing Autonomous AI Creator scheduler (45s heartbeat)...'
        );

        this.timer = setInterval(() => {
            if (!this.isAutoRunEnabled) {
                return;
            }

            this.runAutonomousPulseWorkflow().catch((error) => {
                logger.error(
                    'Autonomous workflow error',
                    error
                );
            });
        }, 45000);
    }

    public async runAutonomousPulseWorkflow(): Promise<AutonomousJob> {
        const jobId = `job-${Date.now()}`;

        logger.autonomous(
            'Scheduler',
            `Starting autonomous workflow: ${jobId}`
        );

        const job: AutonomousJob = {
            id: jobId,
            type: 'DISCOVERY',
            status: 'RUNNING',
            startedAt: new Date().toISOString(),
            logs: [
                'Job initialized',
                'Starting topic discovery'
            ]
        };

        this.activeJobs.unshift(job);

        if (this.activeJobs.length > 20) {
            this.activeJobs.pop();
        }

        try {
            // 1. DISCOVER TOPICS

            const rawTopics =
                await topicDiscoveryService.scanTrendingTopics();

            job.logs.push(
                `Discovered ${rawTopics.length} topics`
            );

            if (rawTopics.length === 0) {
                throw new Error('No topics discovered');
            }

            logger.autonomous(
                'TopicDiscovery',
                `Discovered ${rawTopics.length} live topics`
            );

            // 2. SCORE TOPICS

            job.type = 'SCORING';

            const scoredTopics =
                await editorialScoringService.scoreTopics(
                    rawTopics
                );

            job.logs.push(
                `Scored ${scoredTopics.length} topics`
            );

            if (scoredTopics.length === 0) {
                throw new Error('No topics were scored');
            }

            const rankedTopics = [...scoredTopics].sort(
                (a, b) =>
                    b.editorialScore -
                    a.editorialScore
            );

            const topTopic = rankedTopics[0];

            logger.autonomous(
                'EditorialScoring',
                `Top topic: "${topTopic.topic}" (${topTopic.editorialScore}/100)`
            );

            job.logs.push(
                `Top scored topic: ${topTopic.topic} (${topTopic.editorialScore}/100)`
            );

            // 3. PUBLISH THRESHOLD CHECK

            if (
                topTopic.editorialScore <
                this.PUBLISH_THRESHOLD
            ) {
                job.logs.push(
                    `No topic reached the auto-publish threshold of ${this.PUBLISH_THRESHOLD}/100`
                );

                job.logs.push(
                    `Highest score was ${topTopic.editorialScore}/100`
                );

                job.logs.push(
                    `Topic requires REVIEW: ${topTopic.topic}`
                );

                logger.autonomous(
                    'Scheduler',
                    `No topic qualified for auto-publishing. Highest score: ${topTopic.editorialScore}/100`
                );

                job.status = 'COMPLETED';
                job.completedAt =
                    new Date().toISOString();

                return job;
            }

            // 4. RECOMMENDATION CHECK

            if (
                topTopic.recommendation !==
                'PUBLISH'
            ) {
                job.logs.push(
                    `Topic reached ${topTopic.editorialScore}/100 but recommendation is ${topTopic.recommendation}`
                );

                job.logs.push(
                    `Topic requires editorial review: ${topTopic.topic}`
                );

                logger.autonomous(
                    'Scheduler',
                    `Topic requires review: "${topTopic.topic}" (${topTopic.editorialScore}/100, ${topTopic.recommendation})`
                );

                job.status = 'COMPLETED';
                job.completedAt =
                    new Date().toISOString();

                return job;
            }

            // 5. DUPLICATE CHECK

            if (
                memoryService.hasTopic(
                    topTopic.topic
                )
            ) {
                job.logs.push(
                    `Skipped duplicate topic: ${topTopic.topic}`
                );

                job.status = 'COMPLETED';
                job.completedAt =
                    new Date().toISOString();

                logger.autonomous(
                    'Scheduler',
                    `Skipped duplicate topic: ${topTopic.topic}`
                );

                return job;
            }

            // 6. GENERATE ARTICLE

            job.type = 'GENERATION';

            logger.autonomous(
                'ContentGenerator',
                `Generating article for "${topTopic.topic}"`
            );

            const article =
                await aiContentGenService.generatePulseArticle(
                    topTopic
                );

            job.logs.push(
                'Article generated successfully'
            );

            // 7. MEMORY INDEXING

            job.type = 'MEMORY_INDEXING';

            await memoryService.indexArticleMemory(
                topTopic.topic,
                topTopic.category
            );

            job.logs.push(
                'Article indexed into memory'
            );

            // 8. COMPLETE WORKFLOW

            job.status = 'COMPLETED';
            job.completedAt =
                new Date().toISOString();

            job.payload = article;

            logger.autonomous(
                'Scheduler',
                `Workflow completed: ${jobId}`
            );

            return job;
        } catch (error) {
            job.status = 'FAILED';

            job.completedAt =
                new Date().toISOString();

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : String(error);

            job.logs.push(
                `Error: ${errorMessage}`
            );

            logger.error(
                'Autonomous workflow failed',
                error
            );

            return job;
        }
    }

    public getJobs(): AutonomousJob[] {
        return [...this.activeJobs];
    }

    public toggleAutoRun(
        enable: boolean
    ): boolean {
        this.isAutoRunEnabled = enable;

        logger.autonomous(
            'Scheduler',
            `Autorun changed: ${enable}`
        );

        return this.isAutoRunEnabled;
    }

    public getStatus() {
        return {
            autoRunEnabled:
                this.isAutoRunEnabled,

            activeJobsCount:
                this.activeJobs.filter(
                    (job) =>
                        job.status === 'RUNNING'
                ).length,

            completedJobsCount:
                this.activeJobs.filter(
                    (job) =>
                        job.status === 'COMPLETED'
                ).length,

            failedJobsCount:
                this.activeJobs.filter(
                    (job) =>
                        job.status === 'FAILED'
                ).length,

            lastRunAt:
                this.activeJobs[0]?.startedAt ||
                'Never'
        };
    }

    public stopScheduler(): void {
        if (this.timer) {
            clearInterval(this.timer);

            this.timer = null;

            logger.autonomous(
                'Scheduler',
                'Scheduler stopped'
            );
        }
    }
}

export const autonomousSchedulerService =
    new AutonomousSchedulerService();