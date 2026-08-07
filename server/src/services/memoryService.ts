import { logger } from '../utils/logger.js';
import { Category } from '../models/types.js';


export interface MemoryVectorEntry {

    id: string;

    topic: string;

    embeddingDimension: number;

    category: Category;

    storedAt: string;

}



export class MemoryService {


    private memoryStore: MemoryVectorEntry[] = [];



    /**
     * Store a published topic in memory
     */
    public async indexArticleMemory(

        topic: string,

        category: Category

    ): Promise<MemoryVectorEntry> {


        logger.autonomous(

            'MemoryService',

            `Indexing topic: "${topic}" into long-term memory.`

        );



        await new Promise(
            res => setTimeout(res, 300)
        );



        const entry: MemoryVectorEntry = {


            id:
                `mem-${Date.now()}`,


            topic,


            embeddingDimension:
                1536,


            category,


            storedAt:
                new Date().toISOString()

        };



        this.memoryStore.push(entry);



        return entry;

    }




    /**
     * Check whether this topic already exists
     */
    public hasTopic(
        topic: string
    ): boolean {


        return this.memoryStore.some(

            memory =>

                memory.topic
                .toLowerCase()
                .trim()
                ===

                topic
                .toLowerCase()
                .trim()

        );

    }




    /**
     * Get all previous topics
     */
    public getPreviousTopics(): string[] {


        return this.memoryStore.map(

            memory =>
                memory.topic

        );

    }




    /**
     * Get recent topics
     */
    public getRecentTopics(

        limit:number = 10

    ): MemoryVectorEntry[] {


        return [

            ...this.memoryStore

        ]

        .sort(

            (a,b)=>

            new Date(b.storedAt).getTime()
            -
            new Date(a.storedAt).getTime()

        )

        .slice(0,limit);


    }




    /**
     * Clear memory
     */
    public clearMemory(): void {


        this.memoryStore = [];


        logger.autonomous(

            'MemoryService',

            'Memory cleared.'

        );


    }




    /**
     * Memory statistics
     */
    public getMemoryStats(){


        return {


            vectorCount:
                this.memoryStore.length,


            dimension:
                1536,


            indexStatus:
                'HEALTHY',


            lastSynced:
                new Date().toISOString(),


            latestTopics:
                this.getRecentTopics(5)

        };


    }


}



export const memoryService =
    new MemoryService();