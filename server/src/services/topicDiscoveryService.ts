import Parser from "rss-parser";
import { logger } from "../utils/logger.js";
import { Category } from "../models/types.js";


export interface DiscoveredTopic {

    id: string;

    topic: string;

    category: Category;

    sourceVolume: number;

    velocityGrowth: string;

    keywords: string[];

    discoveredAt: string;

}



export class TopicDiscoveryService {


    private discoveredTopics: DiscoveredTopic[] = [];



    public async scanTrendingTopics(): Promise<DiscoveredTopic[]> {


        logger.autonomous(
            "TopicDiscovery",
            "Scanning live AI news sources..."
        );


        const parser = new Parser();



        const feeds = [

            {
                url: "https://openai.com/news/rss.xml",
                category: "LLMs" as Category
            },

            {
                url: "https://huggingface.co/blog/feed.xml",
                category: "Research" as Category
            },

            {
                url: "https://blog.google/technology/ai/rss/",
                category: "Multimodal" as Category
            }

        ];



        const topics: DiscoveredTopic[] = [];



        for (const feedSource of feeds) {


            try {


                const feed =
                    await parser.parseURL(
                        feedSource.url
                    );



                feed.items
                    .slice(0, 3)
                    .forEach((item, index) => {



                    const title =
                        item.title ||
                        "Unknown AI News";



                    const exists =
                        topics.some(
                            topic =>
                            topic.topic === title
                        );



                    if (exists) {

                        return;

                    }



                    topics.push({


                        id:
                            `${Date.now()}-${index}`,


                        topic:
                            title,


                        category:
                            feedSource.category,


                        sourceVolume:
                            Math.floor(
                                Math.random() * 1000
                            ) + 500,



                        velocityGrowth:
                            `+${Math.floor(
                                Math.random() * 200
                            )}%`,



                        keywords:
                            item.categories
                            ?.map(String)
                            ||
                            [
                                "AI",
                                "Technology"
                            ],



                        discoveredAt:
                            item.pubDate
                            ||
                            new Date()
                            .toISOString()


                    });



                });



            }
            catch(error) {


                logger.warn(

                    `RSS failed: ${feedSource.url}`,

                    error

                );


            }


        }




        this.discoveredTopics =
            topics;



        logger.autonomous(

            "TopicDiscovery",

            `Discovered ${topics.length} live topics`

        );



        return topics;


    }




    public getDiscoveredTopics(): DiscoveredTopic[] {


        return this.discoveredTopics;


    }


}



export const topicDiscoveryService =
    new TopicDiscoveryService();