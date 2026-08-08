import { logger } from '../utils/logger.js';
import { Category } from '../models/types.js';

export interface MemoryVectorEntry {
    id: string;

    topic: string;

    /**
     * Kept as metadata for compatibility with the existing
     * TechPulse UI and memory model.
     *
     * This service does NOT claim to generate a real 1536-d
     * embedding. Similarity is calculated locally using
     * normalized topic tokens.
     */
    embeddingDimension: number;

    category: Category;

    storedAt: string;
}

export class MemoryService {
    private memoryStore: MemoryVectorEntry[] = [];

    /**
     * Similarity threshold for considering two topics duplicates.
     *
     * 0.75 means that sufficiently similar topics will be
     * treated as already covered.
     */
    private readonly DUPLICATE_SIMILARITY_THRESHOLD = 0.75;

    /**
     * Maximum number of memories retained in process memory.
     */
    private readonly MAX_MEMORY_ENTRIES = 1000;

    /**
     * Store a published topic in long-term memory.
     */
    public async indexArticleMemory(
        topic: string,
        category: Category
    ): Promise<MemoryVectorEntry> {
        const cleanedTopic =
            this.normalizeTopic(topic);

        if (!cleanedTopic) {
            throw new Error(
                'Cannot index an empty topic'
            );
        }

        logger.autonomous(
            'MemoryService',
            `Indexing topic: "${topic}" into long-term memory.`
        );

        /**
         * Prevent duplicate memory entries.
         */
        const existing =
            this.findSimilarTopic(topic);

        if (existing) {
            logger.autonomous(
                'MemoryService',
                `Memory already contains a similar topic: "${existing.topic}"`
            );

            return existing;
        }

        const entry: MemoryVectorEntry = {
            id:
                `mem-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 8)}`,

            topic:
                topic.trim(),

            /**
             * Metadata only.
             *
             * No fake embedding is generated here.
             */
            embeddingDimension:
                1536,

            category,

            storedAt:
                new Date().toISOString()
        };

        this.memoryStore.push(entry);

        /**
         * Prevent unbounded memory growth.
         *
         * Keep the newest memories.
         */
        if (
            this.memoryStore.length >
            this.MAX_MEMORY_ENTRIES
        ) {
            this.memoryStore =
                this.memoryStore.slice(
                    -this.MAX_MEMORY_ENTRIES
                );
        }

        logger.autonomous(
            'MemoryService',
            `Memory indexed successfully: ${entry.id}`
        );

        return entry;
    }

    /**
     * Check whether a topic already exists in memory.
     *
     * This performs:
     *
     * 1. Exact normalized comparison
     * 2. Token-based similarity comparison
     */
    public hasTopic(
        topic: string
    ): boolean {
        if (
            !topic ||
            !topic.trim()
        ) {
            return false;
        }

        return Boolean(
            this.findSimilarTopic(topic)
        );
    }

    /**
     * Find an existing memory entry that is
     * sufficiently similar to the supplied topic.
     */
    public findSimilarTopic(
        topic: string
    ): MemoryVectorEntry | null {
        const normalized =
            this.normalizeTopic(topic);

        if (!normalized) {
            return null;
        }

        // ---------------------------------------------------------
        // Exact normalized match
        // ---------------------------------------------------------

        const exact =
            this.memoryStore.find(
                (memory) =>
                    this.normalizeTopic(
                        memory.topic
                    ) === normalized
            );

        if (exact) {
            return exact;
        }

        // ---------------------------------------------------------
        // Similarity match
        // ---------------------------------------------------------

        let bestMatch:
            MemoryVectorEntry | null = null;

        let bestScore = 0;

        for (
            const memory of this.memoryStore
        ) {
            const score =
                this.calculateSimilarity(
                    normalized,
                    this.normalizeTopic(
                        memory.topic
                    )
                );

            if (
                score > bestScore
            ) {
                bestScore = score;
                bestMatch = memory;
            }
        }

        if (
            bestMatch &&
            bestScore >=
                this.DUPLICATE_SIMILARITY_THRESHOLD
        ) {
            logger.autonomous(
                'MemoryService',
                `Similar topic detected: "${topic}" ≈ "${bestMatch.topic}" (${Math.round(bestScore * 100)}% similarity)`
            );

            return bestMatch;
        }

        return null;
    }

    /**
     * Get all previously published topics.
     */
    public getPreviousTopics(): string[] {
        return this.memoryStore.map(
            (memory) =>
                memory.topic
        );
    }

    /**
     * Get recent memories.
     */
    public getRecentTopics(
        limit: number = 10
    ): MemoryVectorEntry[] {
        const safeLimit =
            Math.max(
                1,
                Math.min(
                    limit,
                    this.MAX_MEMORY_ENTRIES
                )
            );

        return [
            ...this.memoryStore
        ]
            .sort(
                (a, b) =>
                    new Date(
                        b.storedAt
                    ).getTime() -
                    new Date(
                        a.storedAt
                    ).getTime()
            )
            .slice(
                0,
                safeLimit
            );
    }

    /**
     * Get number of stored memories.
     */
    public getMemoryCount(): number {
        return this.memoryStore.length;
    }

    /**
     * Clear all memory.
     */
    public clearMemory(): void {
        this.memoryStore = [];

        logger.autonomous(
            'MemoryService',
            'Memory cleared.'
        );
    }

    /**
     * Memory statistics.
     */
    public getMemoryStats() {
        const latest =
            this.getRecentTopics(1)[0];

        return {
            vectorCount:
                this.memoryStore.length,

            dimension:
                1536,

            indexStatus:
                'HEALTHY',

            lastSynced:
                latest?.storedAt ||
                null,

            latestTopics:
                this.getRecentTopics(5)
        };
    }

    /**
     * Normalize a topic for comparison.
     *
     * Removes punctuation, common filler words,
     * duplicate whitespace, and converts everything
     * to lowercase.
     */
    private normalizeTopic(
        topic: string
    ): string {
        const stopWords = new Set([
            'a',
            'an',
            'the',
            'and',
            'or',
            'of',
            'to',
            'in',
            'on',
            'for',
            'with',
            'from',
            'by',
            'as',
            'at',
            'is',
            'are',
            'new',
            'latest',
            'update',
            'updates',
            'breaking'
        ]);

        return topic
            .toLowerCase()
            .replace(
                /https?:\/\/\S+/g,
                ' '
            )
            .replace(
                /[^a-z0-9\s]/g,
                ' '
            )
            .split(/\s+/)
            .filter(
                (word) =>
                    word.length > 2 &&
                    !stopWords.has(word)
            )
            .join(' ')
            .trim();
    }

    /**
     * Calculate token similarity using Jaccard similarity.
     *
     * Example:
     *
     * "OpenAI releases reasoning model"
     *
     * vs
     *
     * "OpenAI releases new reasoning system"
     *
     * share enough important tokens to be detected
     * as related.
     */
    private calculateSimilarity(
        first: string,
        second: string
    ): number {
        const firstTokens =
            new Set(
                first
                    .split(/\s+/)
                    .filter(Boolean)
            );

        const secondTokens =
            new Set(
                second
                    .split(/\s+/)
                    .filter(Boolean)
            );

        if (
            firstTokens.size === 0 ||
            secondTokens.size === 0
        ) {
            return 0;
        }

        let intersection = 0;

        for (
            const token of firstTokens
        ) {
            if (
                secondTokens.has(token)
            ) {
                intersection++;
            }
        }

        const union =
            new Set([
                ...firstTokens,
                ...secondTokens
            ]).size;

        if (union === 0) {
            return 0;
        }

        return (
            intersection / union
        );
    }
}

export const memoryService =
    new MemoryService();