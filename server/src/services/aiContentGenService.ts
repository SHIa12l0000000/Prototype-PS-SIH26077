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

            const generated =
                await geminiService.generatePostForPersona(
                    'TechPulse AI',
                    'Artificial Intelligence',
                    topic,
                    memoryService.getPreviousTopics()
                );

            const sourceUrl =
                generated.sources && generated.sources.length > 0
                    ? generated.sources[0]
                    : 'https://news.google.com/';

            const newArticle: Omit<
                NewsItem,
                'id' | 'publishedAt' | 'upvotes'
            > = {
                title: topic.topic,

                summary:
                    generated.rationale ||
                    'AI generated technology update',

                content: generated.text,

                category:
                    (topic.category as Category) || 'LLMs',

                author: 'TechPulse AI',

                source: sourceUrl,

                url: sourceUrl,

                readTime: '3 min read',

                sentiment: 'Bullish',

                impactScore: topic.editorialScore,

                aiGenerated: true,

                tags: [
                    ...(topic.keywords || []),
                    'AI',
                    'Autonomous'
                ]
            };

            const article = await addNewsItem(newArticle);

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
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : String(error);

            logger.autonomous(
                'ContentGenerator',
                `Failed generating article: ${errorMessage}`
            );

            throw error;
        }
    }
}

export const aiContentGenService =
    new AIContentGenService();