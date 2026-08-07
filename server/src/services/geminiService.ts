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
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || null;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      logger.info('Gemini AI Service initialized with configured environment API key.');
    } else {
      logger.warn('GEMINI_API_KEY not set in environment variables. GeminiService will run in fallback simulation mode.');
    }
  }

  /**
   * Generates professional tech post, rationale, and sources using Gemini AI
   */
  public async generatePostForPersona(
    personaName: string,
    domain: string,
    topicContext?: string
  ): Promise<GeneratedPostContent> {
    if (this.genAI && this.apiKey) {
      try {
        logger.autonomous('GeminiAI', `Calling Gemini API for persona "${personaName}" on domain "${domain}"...`);
        const model = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });

        const prompt = `
You are an autonomous AI creator named "${personaName}" specializing in "${domain}".
Generate a professional, high-impact technology post and publish rationale.

Requirements:
1. "text": Write a concise, insightful technical analysis (1-3 sentences) on a major breakthrough in ${domain}. Maintain an authoritative, forward-looking TechPulse AI tone.
2. "rationale": Explain in 1-2 sentences why this topic was selected and why it is critical right now.
3. "sources": Provide 2 authoritative URL strings (e.g. arxiv.org, github.com, deepmind.google, etc.).

Return ONLY a JSON object with keys: "text", "rationale", "sources".
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        if (parsed.text && parsed.rationale && Array.isArray(parsed.sources)) {
          return {
            text: `${personaName} Insight: ${parsed.text}`,
            rationale: parsed.rationale,
            sources: parsed.sources
          };
        }
      } catch (err: any) {
        logger.error('Gemini API generation error, reverting to resilient fallback generator:', err.message || err);
      }
    }

    // High-quality fallback generator when API key is missing or call fails
    return this.generateFallbackPost(personaName, domain, topicContext);
  }

  private generateFallbackPost(
    personaName: string,
    domain: string,
    _topicContext?: string
  ): GeneratedPostContent {
    const fallbackTopics = [
      {
        text: `DeepSeek R1 open-weights reasoning architecture proves reinforcement learning without extensive supervised fine-tuning achieves state-of-the-art results across AIME and MATH-500 benchmarks in ${domain}.`,
        rationale: `Selected due to a 145% acceleration in research citations and a fundamental paradigm shift in open-weights reasoning cost efficiency.`,
        sources: ['https://arxiv.org/abs/2501.12948', 'https://github.com/deepseek-ai/DeepSeek-R1']
      },
      {
        text: `Sub-100ms multimodal inference context caching enables real-time streaming vision and audio agents, reducing latency by 4x for interactive applications.`,
        rationale: `Critical now as enterprise architectures transition from static text models to zero-latency interactive agentic workflows.`,
        sources: ['https://deepmind.google/technologies/gemini', 'https://ai.google.dev']
      },
      {
        text: `Autonomous multi-agent orchestration frameworks using standardized context protocols execute end-to-end codebase refactoring and unit test generation.`,
        rationale: `Adopted by leading software engineering teams to multiply developer productivity and eliminate legacy code technical debt.`,
        sources: ['https://modelcontextprotocol.io', 'https://github.com/features/copilot']
      }
    ];

    const selected = fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)];

    return {
      text: `${personaName} Analysis: ${selected.text}`,
      rationale: selected.rationale,
      sources: selected.sources
    };
  }
}

export const geminiService = new GeminiService();
