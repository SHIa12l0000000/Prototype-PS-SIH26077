import { logger } from '../utils/logger.js';
import { ScoredTopic } from './editorialScoringService.js';

export interface GeneratedPost {
  text: string;
  rationale: string;
  sources: string[];
}

export class GeminiService {

  constructor() {
    logger.info(
      'AI Content Service initialized in local fallback mode. Gemini is disabled.'
    );
  }

  /**
   * Generates a local AI-style post.
   *
   * No Google Gemini API is used.
   */
  public async generatePostForPersona(
    personaName: string,
    domain: string,
    topic: ScoredTopic,
    _previousPosts: string[] = []
  ): Promise<GeneratedPost> {

    logger.autonomous(
      'ContentGenerator',
      `Generating local AI-style post for topic: "${topic.topic}"`
    );

    return this.generateFallbackPost(
      personaName,
      domain,
      topic
    );
  }


  /**
   * Generates fallback content locally.
   */
  private generateFallbackPost(
    personaName: string,
    domain: string,
    topic: ScoredTopic
  ): GeneratedPost {

    const keywords =
      topic.keywords &&
      topic.keywords.length > 0
        ? topic.keywords
            .slice(0, 5)
            .join(', ')
        : 'artificial intelligence, technology';


    const text = [
      `🤖 ${personaName} — ${topic.topic}`,
      '',
      `The latest development in ${domain} highlights an important direction for the technology industry.`,
      '',
      `Why it matters: This development is connected to ${keywords} and could influence AI engineering, product development, and future technology decisions.`,
      '',
      `TechPulse AI Perspective: ${personaName} is tracking this development because it represents an important technology trend worth watching.`,
      '',
      'Editorial Assessment:',
      `• Relevance Score: ${topic.relevanceScore}/100`,
      `• Novelty Score: ${topic.noveltyScore}/100`,
      `• Editorial Score: ${topic.editorialScore}/100`,
      `• Recommendation: ${topic.recommendation}`
    ].join('\n');


    const rationale =
      `Selected because this topic is relevant to ${domain}, ` +
      `represents a current technology development, and has ` +
      `an editorial score of ${topic.editorialScore}/100.`;


    /*
     * DiscoveredTopic / ScoredTopic does not contain
     * a URL, so do not use topic.url here.
     *
     * The article service can use its own fallback source.
     */
    const sources: string[] = [];


    return {
      text,
      rationale,
      sources
    };
  }
}


export const geminiService =
  new GeminiService();