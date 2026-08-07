import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';


export interface GeneratedPostContent {

    text: string;

    rationale: string;

    sources: string[];

}


export class GeminiService {

    private genAI: GoogleGenerativeAI | null = null;

    private apiKey: string | null = null;


    constructor() {

        this.apiKey =
            process.env.GEMINI_API_KEY ||
            process.env.GOOGLE_GENAI_API_KEY ||
            null;


        if (this.apiKey) {

            this.genAI =
                new GoogleGenerativeAI(this.apiKey);


            logger.info(
                'Gemini AI Service initialized.'
            );

        } else {

            logger.warn(
                'Gemini API key missing. Using fallback mode.'
            );

        }

    }



    public async generatePostForPersona(

        personaName: string,

        domain: string,

        topic: {
            title: string;
            summary: string;
            url: string;
        },

        previousPosts: string[] = []

    ): Promise<GeneratedPostContent> {



        if (this.genAI && this.apiKey) {


            try {


                const model =
                    this.genAI.getGenerativeModel({

                        model: 'gemini-1.5-flash',

                        generationConfig: {

                            responseMimeType:
                                'application/json'

                        }

                    });



                const prompt = `

You are ${personaName}.

Role:
Senior AI Product Analyst

Domain:
${domain}

Topic:
${topic.title}

Summary:
${topic.summary}

Source:
${topic.url}

Previous topics:
${previousPosts.join("\n")}


Return JSON only:

{
"text":"",
"rationale":"",
"sources":[]
}

`;



                const result =
                    await model.generateContent(prompt);



                const responseText =
                    result.response.text();



                const parsed =
                    JSON.parse(responseText);



                if (

                    parsed.text &&
                    parsed.rationale &&
                    Array.isArray(parsed.sources)

                ) {


                    return {

                        text:
                            `${personaName} Insight: ${parsed.text}`,

                        rationale:
                            parsed.rationale,

                        sources:
                            parsed.sources

                    };

                }



            } catch(error) {


                logger.error(
                    'Gemini generation failed',
                    error
                );

            }


        }



        return this.generateFallbackPost(
            personaName,
            domain,
            topic
        );

    }




    private generateFallbackPost(

        personaName: string,

        domain: string,

        topic: {
            title: string;
            summary: string;
            url: string;
        }

    ): GeneratedPostContent {


        return {


            text:
`${topic.title}

${topic.summary}

This development may significantly influence ${domain} and future engineering decisions.`,


            rationale:
`Selected because it aligns with ${personaName} editorial strategy and represents a high-impact technology update.`,


            sources:
            [
                topic.url
            ]

        };


    }


}



export const geminiService =
    new GeminiService();