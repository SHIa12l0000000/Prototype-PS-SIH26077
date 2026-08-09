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
    /**
     * Score every discovered topic independently.
     *
     * Editorial model:
     *
     * Relevance       30%
     * Novelty         25%
     * Recency/Velocity 20%
     * Source Signal   15%
     * Tech Impact     10%
     *
     * The final score is intentionally stricter than the
     * previous keyword-only implementation.
     */
    public async scoreTopics(
        topics: DiscoveredTopic[]
    ): Promise<ScoredTopic[]> {
        logger.autonomous(
            'EditorialScoring',
            `Evaluating ${topics.length} discovered topics...`
        );

        const scoredTopics =
            topics.map((topic) =>
                this.scoreTopic(topic)
            );

        scoredTopics.sort(
            (a, b) =>
                b.editorialScore -
                a.editorialScore
        );

        logger.autonomous(
            'EditorialScoring',
            `Completed editorial evaluation of ${scoredTopics.length} topics`
        );

        return scoredTopics;
    }

    /**
     * Score one topic.
     */
    private scoreTopic(
        topic: DiscoveredTopic
    ): ScoredTopic {
        const title =
            topic.topic
                .toLowerCase()
                .trim();

        const summary =
            topic.summary
                ?.toLowerCase()
                .trim() || '';

        const combinedText =
            `${title} ${summary}`;

        // =========================================================
        // 1. RELEVANCE
        // =========================================================

        let relevance = 35;

        const majorAIOrganizations = [
            'openai',
            'google',
            'deepmind',
            'anthropic',
            'meta',
            'nvidia',
            'hugging face',
            'deepseek',
            'microsoft',
            'mistral',
            'xai',
            'amazon',
            'aws',
            'apple'
        ];

        const aiTechnologyTerms = [
            'artificial intelligence',
            'ai',
            'machine learning',
            'llm',
            'language model',
            'foundation model',
            'reasoning',
            'inference',
            'agent',
            'agents',
            'robotics',
            'multimodal',
            'computer vision',
            'generative',
            'diffusion',
            'gpu',
            'transformer',
            'reinforcement learning',
            'open source',
            'developer',
            'mcp',
            'model context protocol',
        'cybersecurity',
        'cyber security',
        'safety',
        'safeguards',
        'evaluation',
        'evaluations',
        'forecasting',
        'climate',
        'model',
        'models',
        'chatgpt',
        'gemini',
        'enterprise',
        'productivity',
        'computer use',
        'voice ai',
        'video generation',
        'code generation'
    ];

        const organizationMatches =
            this.countMatches(
                combinedText,
                majorAIOrganizations
            );

        const technologyMatches =
            this.countMatches(
                combinedText,
                aiTechnologyTerms
            );

        relevance +=
            Math.min(
                organizationMatches * 8,
                20
            );

        relevance +=
            Math.min(
                technologyMatches * 4,
                25
            );

        // =========================================================
        // 2. NOVELTY
        // =========================================================

        let novelty = 35;

        const noveltySignals = [
            'launch',
            'launched',
            'release',
            'released',
            'introduces',
            'introduced',
            'unveils',
            'unveiled',
            'new',
            'breakthrough',
            'first',
            'research',
            'paper',
            'benchmark',
            'open source',
            'open-weight',
            'open weights',
            'reasoning',
            'inference',
            'architecture',
            'agent',
            'robot',
            'mcp'
        ];

        const noveltyMatches =
            this.countMatches(
                combinedText,
                noveltySignals
            );

        novelty +=
            Math.min(
                noveltyMatches * 6,
                35
            );

        // =========================================================
        // 3. VELOCITY / RECENCY
        // =========================================================

        const velocityScore =
            this.calculateVelocityScore(
                topic.velocityGrowth
            );

        // =========================================================
        // 4. SOURCE SIGNAL
        // =========================================================

        const sourceScore =
            this.calculateSourceScore(
                topic.source,
                topic.url
            );

        // =========================================================
        // 5. TECHNOLOGY IMPACT
        // =========================================================

        const impactScore =
            this.calculateImpactScore(
                combinedText
            );

        // =========================================================
        // NORMALIZE INDIVIDUAL SCORES
        // =========================================================

        relevance =
            this.clamp(
                relevance,
                0,
                100
            );

        novelty =
            this.clamp(
                novelty,
                0,
                100
            );

        // =========================================================
        // FINAL EDITORIAL SCORE
        // =========================================================

        const editorialScore =
            Math.round(
                relevance * 0.30 +
                novelty * 0.25 +
                velocityScore * 0.15 +
                sourceScore * 0.15 +
                impactScore * 0.15
            );

        // =========================================================
        // EDITORIAL DECISION
        // =========================================================

        let recommendation:
            | 'PUBLISH'
            | 'REVIEW'
            | 'REJECT';

        if (
            editorialScore >= 65 &&
            relevance >= 55 &&
            novelty >= 50
        ) {
            recommendation =
                'PUBLISH';
        } else if (
            editorialScore >= 55
        ) {
            recommendation =
                'REVIEW';
        } else {
            recommendation =
                'REJECT';
        }

        logger.autonomous(
            'EditorialScoring',
            `Scored "${topic.topic}" -> ${editorialScore}/100 (${recommendation})`
        );

        logger.autonomous(
            'EditorialScoring',
            `Breakdown: relevance=${relevance}, novelty=${novelty}, velocity=${velocityScore}, source=${sourceScore}, impact=${impactScore}`
        );

        return {
            ...topic,

            relevanceScore:
                relevance,

            noveltyScore:
                novelty,

            editorialScore,

            recommendation
        };
    }

    /**
     * Calculate relevance/keyword matches.
     */
    private countMatches(
        text: string,
        terms: string[]
    ): number {
        return terms.reduce(
            (
                count,
                term
            ) =>
                text.includes(term)
                    ? count + 1
                    : count,
            0
        );
    }

    /**
     * Convert discovery velocity into a 0-100 score.
     */
    private calculateVelocityScore(
        velocityGrowth?: string
    ): number {
        const growth =
            Number.parseInt(
                velocityGrowth
                    ?.replace(
                        '+',
                        ''
                    )
                    .replace(
                        '%',
                        ''
                    ) || '0',
                10
            );

        if (
            Number.isNaN(growth) ||
            growth <= 0
        ) {
            return 20;
        }

        if (growth >= 200) {
            return 100;
        }

        if (growth >= 150) {
            return 90;
        }

        if (growth >= 100) {
            return 80;
        }

        if (growth >= 75) {
            return 70;
        }

        if (growth >= 50) {
            return 60;
        }

        if (growth >= 25) {
            return 45;
        }

        if (growth >= 10) {
            return 30;
        }

        return 20;
    }

    /**
     * Estimate source quality from the discovery source.
     *
     * This is intentionally conservative.
     */
    private calculateSourceScore(
        source?: string,
        url?: string
    ): number {
        const sourceText =
            `${source || ''} ${url || ''}`
                .toLowerCase();

        if (
            sourceText.includes(
                'arxiv.org'
            )
        ) {
            return 100;
        }

        if (
            sourceText.includes(
                'huggingface.co'
            )
        ) {
            return 95;
        }

        if (
            sourceText.includes(
                'deepmind.google'
            )
        ) {
            return 95;
        }

        if (
            sourceText.includes(
                'openai.com'
            )
        ) {
            return 95;
        }

        if (
            sourceText.includes(
                'anthropic.com'
            )
        ) {
            return 95;
        }

        if (
            sourceText.includes(
                'microsoft.com'
            )
        ) {
            return 90;
        }

        if (
            sourceText.includes(
                'nvidia.com'
            )
        ) {
            return 90;
        }

        if (
            sourceText.includes(
                'google.com'
            )
        ) {
            return 90;
        }

        if (
            sourceText.includes(
                'github.com'
            )
        ) {
            return 85;
        }

        if (
            sourceText.includes(
                'techcrunch.com'
            )
        ) {
            return 75;
        }

        /**
         * Unknown sources still receive a reasonable
         * score because discovery itself provides signal.
         */
        return 60;
    }

    /**
     * Estimate technology impact.
     */
    private calculateImpactScore(
        text: string
    ): number {
        const highImpactTerms = [
            'breakthrough',
            'reasoning',
            'frontier',
            'foundation model',
            'architecture',
            'benchmark',
            'inference',
            'agent',
            'agents',
            'robotics',
            'gpu',
            'training',
            'open source',
            'open-weight',
            'multimodal',
            'security',
            'safety',
        'cybersecurity',
        'cyber security',
        'evaluation',
        'evaluations',
        'forecasting',
        'climate',
        'model',
        'models',
        'chatgpt',
        'gemini',
        'computer use',
        'voice ai',
        'video generation',
        'code generation',
        'productivity',
        'enterprise',
        'safeguards'
    ];

        const mediumImpactTerms = [
            'update',
            'feature',
            'tool',
            'api',
            'developer',
            'platform',
            'integration'
        ];

        const highMatches =
            this.countMatches(
                text,
                highImpactTerms
            );

        const mediumMatches =
            this.countMatches(
                text,
                mediumImpactTerms
            );

        let score = 35;

        score +=
            Math.min(
                highMatches * 9,
                45
            );

        score +=
            Math.min(
                mediumMatches * 4,
                20
            );

        return this.clamp(
            score,
            0,
            100
        );
    }

    /**
     * Keep a value within a range.
     */
    private clamp(
        value: number,
        min: number,
        max: number
    ): number {
        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );
    }
}

export const editorialScoringService =
    new EditorialScoringService();


