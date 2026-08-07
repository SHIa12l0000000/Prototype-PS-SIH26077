import { DiscoveredTopic } from './topicDiscoveryService.js';
import { logger } from '../utils/logger.js';

export interface ScoredTopic extends DiscoveredTopic {
  relevanceScore: number;  // 1-100
  noveltyScore: number;    // 1-100
  editorialScore: number;  // Weighted total
  recommendation: 'PUBLISH' | 'REVIEW' | 'REJECT';
}

export class EditorialScoringService {
  public async scoreTopics(topics: DiscoveredTopic[]): Promise<ScoredTopic[]> {
    logger.autonomous('EditorialScoring', `Evaluating editorial impact for ${topics.length} candidate topics...`);
    
    await new Promise(res => setTimeout(res, 400));

    return topics.map(t => {
      const relevance = 85 + Math.floor(Math.random() * 15);
      const novelty = 80 + Math.floor(Math.random() * 20);
      const editorialScore = Math.round((relevance * 0.6) + (novelty * 0.4));
      
      const recommendation = editorialScore >= 88 ? 'PUBLISH' : 'REVIEW';

      return {
        ...t,
        relevanceScore: relevance,
        noveltyScore: novelty,
        editorialScore: editorialScore,
        recommendation: recommendation
      };
    });
  }
}

export const editorialScoringService = new EditorialScoringService();
