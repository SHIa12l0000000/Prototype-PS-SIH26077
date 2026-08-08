import { geminiService } from './geminiService.js';
import { memoryService } from './memoryService.js';
import { ScoredTopic } from './editorialScoringService.js';
import { NewsItem, Category } from '../models/types.js';
import { addNewsItem } from './newsService.js';
import { logger } from '../utils/logger.js';

export class AIContentGenService {

    public async generatePulseArticle(
        topic: ScoredTopic
    ): Promise<NewsItem> {

        try {

            logger.autonomous(
                'ContentGenerator',
                `Generating article for "${topic.topic}"`
            );

            /*
             * ScoredTopic already contains all the information
             * required by GeminiService.
             *
             * IMPORTANT:
             * Do NOT create:
             * title
             * summary
             * url
             *
             * because they do not exist in ScoredTopic.
             */
            const generated =
                await geminiService.generatePostForPersona(
                    'TechPulse AI',
                    'Artificial Intelligence',
                    topic,
                    memoryService.getPreviousTopics()
                );

            /*
             * The local fallback generator does not require
             * an external source URL.
             *
             * Use a safe default for the NewsItem.
             */
            const sourceUrl =
                generated.sources.length > 0
                    ? generated.sources[0]
                    : 'https://news.google.com/';

            /*
             * Create the article using the actual NewsItem structure.
             */
            const newArticle: Omit<
                NewsItem,
                'id' | 'publishedAt' | 'upvotes'
            > = {

                title:
                    topic.topic,

                summary:
                    generated.rationale ||
                    'AI generated technology update',

                content:
                    generated.text,

                category:
                    (topic.category as Category) || 'LLMs',

                author:
                    'TechPulse AI',

                source:
                    sourceUrl,

                url:
                    sourceUrl,

                readTime:
                    '3 min read',

                sentiment:
                    'Bullish',

                impactScore:
                    topic.editorialScore,

                aiGenerated:
                    true,

                tags: [
                    ...(topic.keywords || []),
                    'AI',
                    'Autonomous'
                ]
            };

            /*
             * Save the article.
             */
            const article =
                await addNewsItem(newArticle);

            /*
             * Store topic information in memory.
             */
            await memoryService.indexArticleMemory(
                topic.topic,
                topic.category
            );

            logger.autonomous(
                'ContentGenerator',
                `Published article ${article.id}`
            );

            return article;

        } catch (error) {

            logger.autonomous(
                'ContentGenerator',
                `Failed generating article: ${
                    error instanceof Error
                        ? error.message
                        : 'Unknown error'
                }`
            );

            throw error;
        }
    }
}

export const aiContentGenService =
    new AIContentGenService();