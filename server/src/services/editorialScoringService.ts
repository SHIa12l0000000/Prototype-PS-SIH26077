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
      'EditorialScoring',
      `Evaluating ${topics.length} discovered topics...`
    );

    return topics.map((topic) => {
      let relevance = 50;
      let novelty = 50;

      const title = topic.topic.toLowerCase();

      // ============================================================
      // RELEVANCE SIGNALS
      // ============================================================

      if (
        title.includes('openai') ||
        title.includes('google') ||
        title.includes('anthropic') ||
        title.includes('meta') ||
        title.includes('nvidia') ||
        title.includes('hugging face') ||
        title.includes('deepseek') ||
        title.includes('gemini') ||
        title.includes('microsoft')
      ) {
        relevance += 25;
      }

      // ============================================================
      // NOVELTY SIGNALS
      // ============================================================

      if (
        title.includes('model') ||
        title.includes('agent') ||
        title.includes('reasoning') ||
        title.includes('robot') ||
        title.includes('mcp') ||
        title.includes('llm') ||
        title.includes('diffusion') ||
        title.includes('multimodal') ||
        title.includes('inference') ||
        title.includes('ai')
      ) {
        novelty += 20;
      }

      // ============================================================
      // SOURCE VOLUME
      // ============================================================

      if (topic.sourceVolume > 1000) {
        relevance += 15;
      } else if (topic.sourceVolume > 500) {
        relevance += 10;
      } else if (topic.sourceVolume > 200) {
        relevance += 5;
      }

      // ============================================================
      // VELOCITY / TREND GROWTH
      // ============================================================

      const growth = parseInt(
        topic.velocityGrowth
          ?.replace('+', '')
          .replace('%', '') || '0',
        10
      );

      if (growth > 150) {
        novelty += 20;
      } else if (growth > 100) {
        novelty += 15;
      } else if (growth > 50) {
        novelty += 10;
      } else if (growth > 20) {
        novelty += 5;
      }

      // ============================================================
      // NORMALIZE SCORES
      // ============================================================

      relevance = Math.min(
        Math.max(relevance, 0),
        100
      );

      novelty = Math.min(
        Math.max(novelty, 0),
        100
      );

      // ============================================================
      // EDITORIAL SCORE
      // ============================================================

      const editorialScore = Math.round(
        (relevance + novelty) / 2
      );

      // ============================================================
      // RECOMMENDATION
      //
      // 60+  -> PUBLISH
      // 50-59 -> REVIEW
      // <50  -> REJECT
      // ============================================================

      let recommendation:
        | 'PUBLISH'
        | 'REVIEW'
        | 'REJECT';

      if (editorialScore >= 60) {
        recommendation = 'PUBLISH';
      } else if (editorialScore >= 50) {
        recommendation = 'REVIEW';
      } else {
        recommendation = 'REJECT';
      }

      logger.autonomous(
        'EditorialScoring',
        `Scored "${topic.topic}" -> ${editorialScore}/100 (${recommendation})`
      );

      return {
        ...topic,
        relevanceScore: relevance,
        noveltyScore: novelty,
        editorialScore,
        recommendation
      };
    });
  }
}

export const editorialScoringService =
  new EditorialScoringService();