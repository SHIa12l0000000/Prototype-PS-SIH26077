import { geminiService } from './geminiService.js';
import { memoryService } from './memoryService.js';
import { ScoredTopic } from './editorialScoringService.js';
import {
    NewsItem,
    Category
} from '../models/types.js';
import { addNewsItem } from './newsService.js';
import { logger } from '../utils/logger.js';

export class AIContentGenService {
    /**
     * Generate and publish one autonomous TechPulse article.
     *
     * The service:
     *
     * 1. Reads previous memory
     * 2. Generates persona-consistent content
     * 3. Preserves source information
     * 4. Publishes the article
     * 5. Stores the topic in memory
     */
    public async generatePulseArticle(
        topic: ScoredTopic
    ): Promise<NewsItem> {
        try {
            logger.autonomous(
                'ContentGenerator',
                `Generating article for "${topic.topic}"`
            );

            // =====================================================
            // 1. READ MEMORY
            // =====================================================

            const previousTopics =
                memoryService.getPreviousTopics();

            logger.autonomous(
                'ContentGenerator',
                `Loaded ${previousTopics.length} previous topics from memory`
            );

            // =====================================================
            // 2. GENERATE CONTENT
            // =====================================================

            const generated =
                await geminiService.generatePostForPersona(
                    'TechPulse AI',
                    'Artificial Intelligence and Technology',
                    topic,
                    previousTopics
                );

            if (!generated) {
                throw new Error(
                    'Content generation returned no result'
                );
            }

            if (
                !generated.text ||
                !generated.text.trim()
            ) {
                throw new Error(
                    'Generated content is empty'
                );
            }

            // =====================================================
            // 3. VALIDATE SOURCES
            // =====================================================

            const sources =
                Array.isArray(
                    generated.sources
                )
                    ? generated.sources.filter(
                          (source) =>
                              typeof source ===
                                  'string' &&
                              source.trim().length > 0
                      )
                    : [];

            /**
             * A published autonomous article must have
             * traceable source information.
             *
             * We use the discovered topic URL when the
             * model does not return a source.
             */
            if (
                sources.length === 0 &&
                topic.url
            ) {
                sources.push(
                    topic.url
                );
            }

            /**
             * If absolutely no source URL exists,
             * do not invent one.
             */
            if (
                sources.length === 0
            ) {
                throw new Error(
                    `Cannot publish "${topic.topic}" because no source URL is available`
                );
            }

            // =====================================================
            // 4. BUILD PUBLISHING RATIONALE
            // =====================================================

            const rationale =
                this.buildPublishingRationale(
                    topic,
                    generated.rationale
                );

            // =====================================================
            // 5. PRIMARY SOURCE
            // =====================================================

            const primarySource =
                sources[0];

            // =====================================================
            // 6. BUILD NEWS ARTICLE
            // =====================================================

            const newArticle:
                Omit<
                    NewsItem,
                    'id' |
                    'publishedAt' |
                    'upvotes'
                > = {
                    title:
                        topic.topic,

                    summary:
                        this.createSummary(
                            generated.rationale,
                            topic
                        ),

                    content:
                        generated.text,

                    category:
                        (
                            topic.category as Category
                        ) || 'LLMs',

                    author:
                        'TechPulse AI',

                    source:
                        primarySource,

                    url:
                        primarySource,

                    readTime:
                        this.calculateReadTime(
                            generated.text
                        ),

                    sentiment:
                        this.calculateSentiment(
                            topic.editorialScore
                        ),

                    impactScore:
                        topic.editorialScore,

                    aiGenerated:
                        true,

                    tags:
                        this.buildTags(
                            topic
                        ),

                    /**
                     * The rationale is also included in the
                     * article metadata where supported by the
                     * existing model.
                     */
                    ...this.optionalRationale(
                        rationale
                    )
                };

            // =====================================================
            // 7. PUBLISH
            // =====================================================

            const article =
                await addNewsItem(
                    newArticle
                );

            // =====================================================
            // 8. INDEX MEMORY
            // =====================================================

            await memoryService.indexArticleMemory(
                topic.topic,
                topic.category
            );

            logger.autonomous(
                'ContentGenerator',
                `Published article ${article.id}: "${topic.topic}"`
            );

            logger.autonomous(
                'ContentGenerator',
                `Editorial rationale: ${rationale}`
            );

            logger.autonomous(
                'ContentGenerator',
                `Sources: ${sources.join(', ')}`
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

    /**
     * Build a transparent explanation of why the
     * autonomous system selected this topic.
     */
    private buildPublishingRationale(
        topic: ScoredTopic,
        generatedRationale?: string
    ): string {
        const modelReason =
            generatedRationale?.trim();

        const scoreExplanation =
            `The topic received an editorial score of ${topic.editorialScore}/100, with relevance at ${topic.relevanceScore}/100 and novelty at ${topic.noveltyScore}/100.`;

        const currentRelevance =
            `It was selected because it represents a current AI/technology development with sufficient editorial relevance and novelty.`;

        if (modelReason) {
            return `${scoreExplanation} ${currentRelevance} ${modelReason}`;
        }

        return `${scoreExplanation} ${currentRelevance}`;
    }

    /**
     * Create a concise article summary.
     */
    private createSummary(
        generatedRationale: string | undefined,
        topic: ScoredTopic
    ): string {
        if (
            generatedRationale &&
            generatedRationale.trim()
        ) {
            return generatedRationale
                .trim()
                .substring(
                    0,
                    500
                );
        }

        return `Autonomous TechPulse analysis of ${topic.topic}.`;
    }

    /**
     * Estimate reading time from generated content.
     */
    private calculateReadTime(
        text: string
    ): string {
        const words =
            text
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .length;

        const minutes =
            Math.max(
                1,
                Math.ceil(
                    words / 200
                )
            );

        return `${minutes} min read`;
    }

    /**
     * Keep sentiment deterministic enough for the
     * current TechPulse NewsItem model.
     */
    private calculateSentiment(
        editorialScore: number
    ):
        | 'Bullish'
        | 'Neutral'
        | 'Cautious' {
        if (
            editorialScore >= 85
        ) {
            return 'Bullish';
        }

        if (
            editorialScore >= 70
        ) {
            return 'Neutral';
        }

        return 'Cautious';
    }

    /**
     * Build stable tags from the discovered topic.
     */
    private buildTags(
        topic: ScoredTopic
    ): string[] {
        const tags = [
            ...(topic.keywords || []),
            topic.category,
            'AI',
            'Autonomous'
        ];

        return [
            ...new Set(
                tags
                    .filter(Boolean)
                    .map(
                        (tag) =>
                            String(tag).trim()
                    )
                    .filter(Boolean)
            )
        ];
    }

    /**
     * Add rationale only if the existing NewsItem model
     * supports it.
     *
     * This keeps the service compatible with projects
     * where rationale is not yet part of NewsItem.
     */
    private optionalRationale(
        rationale: string
    ): Partial<NewsItem> {
        /**
         * TypeScript-safe compatibility layer.
         *
         * If NewsItem later receives a `rationale` field,
         * this object will populate it automatically.
         */
        return {
            ...(rationale
                ? {
                      rationale
                  }
                : {})
        } as Partial<NewsItem>;
    }
}

export const aiContentGenService =
    new AIContentGenService();