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



    constructor() {

        this.initScheduler();

    }



    private initScheduler(): void {


        logger.autonomous(
            'Scheduler',
            'Initializing Autonomous AI Creator scheduler (45s heartbeat)...'
        );



        this.timer = setInterval(() => {


            if (this.isAutoRunEnabled) {


                this.runAutonomousPulseWorkflow()
                    .catch(error => {


                        logger.error(
                            'Autonomous workflow error',
                            error
                        );


                    });


            }


        }, 45000);


    }




    public async runAutonomousPulseWorkflow(): Promise<AutonomousJob> {


        const jobId =
            `job-${Date.now()}`;



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




        try {


            // 1. Discover Topics

            const rawTopics =
                await topicDiscoveryService.scanTrendingTopics();



            job.logs.push(
                `Discovered ${rawTopics.length} topics`
            );



            if (rawTopics.length === 0) {

                throw new Error(
                    "No topics discovered"
                );

            }




            // 2. Score Topics

            job.type =
                'SCORING';



            const scoredTopics =
                await editorialScoringService.scoreTopics(
                    rawTopics
                );



            const topTopic =
                scoredTopics.find(
                    topic =>
                    topic.recommendation === 'PUBLISH'
                )
                ||
                scoredTopics[0];



            if (!topTopic) {

                throw new Error(
                    "No suitable topic found"
                );

            }



            job.logs.push(

                `Selected topic: ${topTopic.topic} (${topTopic.editorialScore}/100)`

            );





            // 3. Duplicate Check

            if (
                memoryService.hasTopic(
                    topTopic.topic
                )
            ) {



                job.logs.push(

                    `Skipped duplicate topic: ${topTopic.topic}`

                );



                job.status =
                    'COMPLETED';



                job.completedAt =
                    new Date().toISOString();



                return job;

            }





            // 4. Generate Article

            job.type =
                'GENERATION';



            const article =
                await aiContentGenService.generatePulseArticle(
                    topTopic
                );



            job.logs.push(

                'Article generated successfully'

            );





            // 5. Memory Index

            job.type =
                'MEMORY_INDEXING';



            await memoryService.indexArticleMemory(

                topTopic.topic,

                topTopic.category

            );



            job.logs.push(

                'Article indexed into memory'

            );





            // Complete

            job.status =
                'COMPLETED';



            job.completedAt =
                new Date().toISOString();



            job.payload =
                article;



            logger.autonomous(

                'Scheduler',

                `Workflow completed: ${jobId}`

            );



            return job;



        } catch(error) {



            job.status =
                'FAILED';



            job.completedAt =
                new Date().toISOString();



            job.logs.push(

                `Error: ${
                    error instanceof Error
                    ? error.message
                    : String(error)
                }`

            );



            logger.error(

                'Autonomous workflow failed',

                error

            );



            return job;

        }


    }





    public getJobs(): AutonomousJob[] {


        return this.activeJobs;


    }




    public toggleAutoRun(
        enable:boolean
    ): boolean {


        this.isAutoRunEnabled =
            enable;



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
                    job =>
                    job.status === 'RUNNING'
                ).length,



            completedJobsCount:
                this.activeJobs.filter(
                    job =>
                    job.status === 'COMPLETED'
                ).length,



            failedJobsCount:
                this.activeJobs.filter(
                    job =>
                    job.status === 'FAILED'
                ).length,



            lastRunAt:
                this.activeJobs[0]?.startedAt
                ||
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