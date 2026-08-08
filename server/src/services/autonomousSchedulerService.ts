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

    /**
     * Minimum score required for autonomous publishing.
     *
     * Topics below this score are intentionally rejected.
     */
    private readonly PUBLISH_THRESHOLD = 75;

    /**
     * Prevents multiple autonomous workflows from running
     * at the same time.
     */
    private isWorkflowRunning = false;

    /**
     * Main autonomous heartbeat.
     *
     * The agent continues operating without human input.
     */
    private readonly AUTONOMOUS_INTERVAL_MS =
        15 * 60 * 1000;

    constructor() {
        this.initScheduler();
    }

    private initScheduler(): void {
        logger.autonomous(
            'Scheduler',
            'Initializing Autonomous AI Creator scheduler (15-minute heartbeat)...'
        );

        this.timer = setInterval(() => {
            if (!this.isAutoRunEnabled) {
                return;
            }

            if (this.isWorkflowRunning) {
                logger.autonomous(
                    'Scheduler',
                    'Skipping scheduled cycle because another workflow is already running'
                );

                return;
            }

            this.runAutonomousPulseWorkflow().catch(
                (error) => {
                    logger.error(
                        'Autonomous workflow error',
                        error
                    );
                }
            );
        }, this.AUTONOMOUS_INTERVAL_MS);
    }

    /**
     * Executes one complete autonomous editorial cycle.
     *
     * DISCOVERY
     *    ↓
     * SCORING
     *    ↓
     * EDITORIAL FILTERING
     *    ↓
     * DUPLICATE CHECK
     *    ↓
     * SELECT BEST ELIGIBLE TOPIC
     *    ↓
     * AI GENERATION
     *    ↓
     * MEMORY
     */
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

            startedAt:
                new Date().toISOString(),

            logs: [
                'Job initialized',
                'Starting topic discovery'
            ]
        };

        this.activeJobs.unshift(job);

        if (this.activeJobs.length > 20) {
            this.activeJobs.pop();
        }

        if (this.isWorkflowRunning) {
            job.status = 'COMPLETED';

            job.completedAt =
                new Date().toISOString();

            job.logs.push(
                'Workflow skipped because another autonomous cycle is already running'
            );

            return job;
        }

        this.isWorkflowRunning = true;

        try {
            // =====================================================
            // 1. DISCOVER TOPICS
            // =====================================================

            const rawTopics =
                await topicDiscoveryService.scanTrendingTopics();

            job.logs.push(
                `Discovered ${rawTopics.length} topics`
            );

            if (rawTopics.length === 0) {
                throw new Error(
                    'No topics discovered'
                );
            }

            logger.autonomous(
                'TopicDiscovery',
                `Discovered ${rawTopics.length} live topics`
            );

            // =====================================================
            // 2. SCORE TOPICS
            // =====================================================

            job.type = 'SCORING';

            const scoredTopics =
                await editorialScoringService.scoreTopics(
                    rawTopics
                );

            job.logs.push(
                `Scored ${scoredTopics.length} topics`
            );

            if (scoredTopics.length === 0) {
                throw new Error(
                    'No topics were scored'
                );
            }

            // Highest score first.
            const rankedTopics =
                [...scoredTopics].sort(
                    (a, b) =>
                        b.editorialScore -
                        a.editorialScore
                );

            job.logs.push(
                `Ranked ${rankedTopics.length} topics by editorial score`
            );

            // =====================================================
            // 3. EDITORIAL DECISION
            // =====================================================

            let selectedTopic:
                (typeof rankedTopics)[number] | null =
                null;

            let rejectedCount = 0;

            for (
                const topic of rankedTopics
            ) {
                // ---------------------------------------------
                // Score threshold
                // ---------------------------------------------

                if (
                    topic.editorialScore <
                    this.PUBLISH_THRESHOLD
                ) {
                    rejectedCount++;

                    job.logs.push(
                        `Rejected topic: ${topic.topic} — score ${topic.editorialScore}/100 below threshold ${this.PUBLISH_THRESHOLD}`
                    );

                    continue;
                }

                // ---------------------------------------------
                // Editorial recommendation
                // ---------------------------------------------

                if (
                    topic.recommendation !==
                    'PUBLISH'
                ) {
                    rejectedCount++;

                    job.logs.push(
                        `Rejected topic: ${topic.topic} — recommendation ${topic.recommendation}`
                    );

                    continue;
                }

                // ---------------------------------------------
                // Duplicate / memory check
                // ---------------------------------------------

                if (
                    memoryService.hasTopic(
                        topic.topic
                    )
                ) {
                    rejectedCount++;

                    job.logs.push(
                        `Rejected duplicate topic: ${topic.topic}`
                    );

                    continue;
                }

                // ---------------------------------------------
                // First eligible topic wins
                // ---------------------------------------------

                selectedTopic = topic;

                job.logs.push(
                    `Selected topic: ${topic.topic} (${topic.editorialScore}/100)`
                );

                break;
            }

            job.logs.push(
                `Editorial decision complete: ${rejectedCount} topics rejected`
            );

            // =====================================================
            // 4. NO ELIGIBLE TOPIC
            // =====================================================

            if (!selectedTopic) {
                job.logs.push(
                    `No topic qualified for autonomous publishing`
                );

                job.logs.push(
                    `Publishing threshold: ${this.PUBLISH_THRESHOLD}/100`
                );

                job.status = 'COMPLETED';

                job.completedAt =
                    new Date().toISOString();

                logger.autonomous(
                    'Scheduler',
                    `No eligible topic found after evaluating ${rankedTopics.length} candidates`
                );

                return job;
            }

            // =====================================================
            // 5. LOG EDITORIAL SELECTION
            // =====================================================

            logger.autonomous(
                'EditorialScoring',
                `Selected topic: "${selectedTopic.topic}" (${selectedTopic.editorialScore}/100)`
            );

            job.logs.push(
                `Top eligible topic: ${selectedTopic.topic} (${selectedTopic.editorialScore}/100)`
            );

            // =====================================================
            // 6. GENERATE ARTICLE
            // =====================================================

            job.type = 'GENERATION';

            logger.autonomous(
                'ContentGenerator',
                `Generating article for "${selectedTopic.topic}"`
            );

            const article =
                await aiContentGenService.generatePulseArticle(
                    selectedTopic
                );

            job.logs.push(
                'Article generated successfully'
            );

            // =====================================================
            // 7. MEMORY
            // =====================================================

            /**
             * aiContentGenService already indexes the article
             * into memory after successful generation.
             *
             * Therefore we intentionally DO NOT call
             * memoryService.indexArticleMemory() again here.
             *
             * This prevents duplicate memory entries.
             */

            job.type = 'MEMORY_INDEXING';

            job.logs.push(
                'Article memory indexing completed by content generation service'
            );

            // =====================================================
            // 8. COMPLETE
            // =====================================================

            job.status = 'COMPLETED';

            job.completedAt =
                new Date().toISOString();

            job.payload = article;

            logger.autonomous(
                'Scheduler',
                `Workflow completed successfully: ${jobId}`
            );

            return job;
        } catch (error) {
            // =====================================================
            // ERROR
            // =====================================================

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
        } finally {
            this.isWorkflowRunning = false;
        }
    }

    /**
     * Returns recent autonomous jobs.
     */
    public getJobs(): AutonomousJob[] {
        return [...this.activeJobs];
    }

    /**
     * Enables/disables automatic execution.
     */
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

    /**
     * Returns scheduler status.
     */
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
                'Never',

            publishingThreshold:
                this.PUBLISH_THRESHOLD,

            heartbeatMinutes:
                this.AUTONOMOUS_INTERVAL_MS /
                60000
        };
    }

    /**
     * Stops the scheduler.
     */
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