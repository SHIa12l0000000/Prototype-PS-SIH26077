import { DiscoveredTopic } from './topicDiscoveryService.js';
import { logger } from '../utils/logger.js';


export interface ScoredTopic extends DiscoveredTopic {

    relevanceScore: number;

    noveltyScore: number;

    editorialScore: number;

    recommendation:
        | 'PUBLISH'
        | 'REVIEW'
        | 'REJECT';

}



export class EditorialScoringService {


    public async scoreTopics(
        topics: DiscoveredTopic[]
    ): Promise<ScoredTopic[]> {



        logger.autonomous(

            "EditorialScoring",

            `Evaluating ${topics.length} discovered topics...`

        );



        return topics.map(topic => {


            let relevance = 50;

            let novelty = 50;



            const title =
                topic.topic.toLowerCase();



            if (

                title.includes("openai") ||
                title.includes("google") ||
                title.includes("anthropic") ||
                title.includes("meta") ||
                title.includes("nvidia") ||
                title.includes("hugging face")

            ) {

                relevance += 25;

            }




            if (

                title.includes("model") ||
                title.includes("agent") ||
                title.includes("reasoning") ||
                title.includes("robot") ||
                title.includes("mcp") ||
                title.includes("llm") ||
                title.includes("diffusion")

            ) {

                novelty += 20;

            }




            if (topic.sourceVolume > 1000) {

                relevance += 15;

            }



            const growth = parseInt(

                topic.velocityGrowth
                    ?.replace("+", "")
                    .replace("%", "")
                || "0"

            );



            if (growth > 100) {

                novelty += 15;

            }




            relevance =
                Math.min(relevance,100);


            novelty =
                Math.min(novelty,100);




            const editorialScore =
                Math.round(
                    (relevance + novelty) / 2
                );



            let recommendation:
                "PUBLISH"
                | "REVIEW"
                | "REJECT";



            if (editorialScore >= 85) {

                recommendation = "PUBLISH";

            }

            else if (editorialScore >= 70) {

                recommendation = "REVIEW";

            }

            else {

                recommendation = "REJECT";

            }



            return {

                ...topic,

                relevanceScore:
                    relevance,

                noveltyScore:
                    novelty,

                editorialScore,

                recommendation

            };


        });


    }

}



export const editorialScoringService =
    new EditorialScoringService();