import Parser from "rss-parser";
import { logger } from "../utils/logger.js";
import { Category } from "../models/types.js";
import { supabase } from "../config/supabase.js";

export interface DiscoveredTopic {
  id: string;
  topic: string;
  category: Category;
  sourceVolume: number;
  velocityGrowth: string;
  keywords: string[];
  discoveredAt: string;
  source: string;
  url: string;
  summary: string;
}

interface FeedConfig {
  url: string;
  category: Category;
  source: string;
}

export class TopicDiscoveryService {
  private discoveredTopics: DiscoveredTopic[] = [];

  private readonly parser = new Parser({
    timeout: 10000,
  });

  /**
   * Live AI and technology sources.
   * These feeds are used for autonomous topic discovery.
   */
  private readonly feeds: FeedConfig[] = [
    {
      url: "https://openai.com/news/rss.xml",
      category: "LLMs",
      source: "OpenAI",
    },
    {
      url: "https://huggingface.co/blog/feed.xml",
      category: "Research",
      source: "Hugging Face",
    },
    {
      url: "https://blog.google/technology/ai/rss/",
      category: "Multimodal",
      source: "Google AI",
    },
    {
      url: "https://deepmind.google/blog/rss.xml",
      category: "Research",
      source: "Google DeepMind",
    },
    {
      url: "https://www.anthropic.com/news/rss.xml",
      category: "LLMs",
      source: "Anthropic",
    },
  ];

  /**
   * Discover live AI and technology topics.
   */
  public async scanTrendingTopics(): Promise<DiscoveredTopic[]> {
    logger.autonomous(
      "TopicDiscovery",
      "Scanning live AI and technology sources..."
    );

    const topics: DiscoveredTopic[] = [];

    for (const feedSource of this.feeds) {
      try {
        logger.autonomous(
          "TopicDiscovery",
          `Reading RSS feed: ${feedSource.source}`
        );

        const feed = await this.parser.parseURL(feedSource.url);

        const items = Array.isArray(feed.items)
          ? feed.items.slice(0, 15)
          : [];

        for (let index = 0; index < items.length; index++) {
          const item = items[index];

          const title = item.title?.trim();

          if (!title) {
            continue;
          }

          /**
           * Require the actual article URL.
           */
          const articleUrl = item.link?.trim();

          if (!articleUrl) {
            logger.autonomous(
              "TopicDiscovery",
              `Skipped "${title}" because no article URL was provided`
            );

            continue;
          }

          /**
           * Duplicate detection.
           */
          const normalizedTitle = this.normalizeText(title);

          const exists = topics.some(
            (topic) =>
              this.normalizeText(topic.topic) === normalizedTitle
          );

          if (exists) {
            logger.autonomous(
              "TopicDiscovery",
              `Skipped duplicate topic: "${title}"`
            );

            continue;
          }

          /**
           * RSS categories.
           */
          const rssKeywords = Array.isArray(item.categories)
            ? item.categories
                .map((category) => String(category).trim())
                .filter(Boolean)
            : [];

          /**
           * Detect AI/technology keywords.
           */
          const summary =
            this.cleanText(
              item.contentSnippet ||
                item.content ||
                item.summary ||
                ""
            ) || `Latest update from ${feedSource.source}.`;

          const detectedKeywords = this.detectKeywords(
            title,
            summary
          );

          const keywords = Array.from(
            new Set([
              ...rssKeywords,
              ...detectedKeywords,
              "AI",
              "Artificial Intelligence",
              feedSource.source,
            ])
          ).slice(0, 10);

          /**
           * Discovery strength signal.
           */
          const sourceVolume = Math.max(
            100,
            1000 - index * 50
          );

          /**
           * Estimated discovery velocity.
           */
          const estimatedGrowth = Math.max(
            10,
            100 - index * 7
          );

          /**
           * Use actual RSS publication date.
           */
          const discoveredAt = this.getValidDate(
            item.isoDate,
            item.pubDate
          );

          /**
           * Deterministic topic ID.
           */
          const id = this.createTopicId(
            feedSource.source,
            title,
            articleUrl
          );

          const topic: DiscoveredTopic = {
            id,
            topic: title,
            category: feedSource.category,
            sourceVolume,
            velocityGrowth: `+${estimatedGrowth}%`,
            keywords,
            discoveredAt,
            source: feedSource.source,
            url: articleUrl,
            summary,
          };

          topics.push(topic);

          logger.autonomous(
            "TopicDiscovery",
            `Discovered live topic: "${title}" from ${feedSource.source}`
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error);

        logger.warn(
          `RSS failed for ${feedSource.source}: ${errorMessage}`
        );
      }
    }

    /**
     * Newest topics first.
     */
    topics.sort(
      (a, b) =>
        new Date(b.discoveredAt).getTime() -
        new Date(a.discoveredAt).getTime()
    );

    /**
     * ============================================================
     * SAVE DISCOVERED TOPICS TO SUPABASE
     * ============================================================
     */
    if (topics.length > 0) {
      const topicRows = topics.map((topic) => ({
        id: topic.id,
        topic: topic.topic,
        category: topic.category,
        discovered_at: topic.discoveredAt,
      }));

      const { error } = await supabase
        .from("topics")
        .upsert(topicRows, {
          onConflict: "id",
        });

      if (error) {
        logger.error(
          `Failed to persist ${topics.length} topics to Supabase: ${error.message}`
        );
      } else {
        logger.autonomous(
          "TopicDiscovery",
          `Persisted ${topics.length} topics to Supabase`
        );
      }
    } else {
      logger.warn(
        "No topics discovered. Nothing to save to Supabase."
      );
    }

    /**
     * Keep latest discovery result in memory as well.
     */
    this.discoveredTopics = topics;

    logger.autonomous(
      "TopicDiscovery",
      `Live discovery completed: ${topics.length} unique topics`
    );

    return [...topics];
  }

  /**
   * Return the latest discovered topics.
   */
  public getDiscoveredTopics(): DiscoveredTopic[] {
    return [...this.discoveredTopics];
  }

  /**
   * Normalize text for duplicate detection.
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Clean RSS HTML/content.
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1200);
  }

  /**
   * Return a valid ISO UTC timestamp.
   */
  private getValidDate(
    isoDate?: string,
    pubDate?: string
  ): string {
    const candidates = [isoDate, pubDate];

    for (const candidate of candidates) {
      if (!candidate) {
        continue;
      }

      const date = new Date(candidate);

      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return new Date().toISOString();
  }

  /**
   * Detect useful AI/technology concepts.
   */
  private detectKeywords(
    title: string,
    summary: string
  ): string[] {
    const text = `${title} ${summary}`.toLowerCase();

    const keywordMap: Record<string, string> = {
      "large language model": "LLMs",
      llm: "LLMs",
      model: "AI Models",
      agent: "AI Agents",
      agents: "AI Agents",
      reasoning: "Reasoning",
      inference: "Inference",
      multimodal: "Multimodal",
      robotics: "Robotics",
      robot: "Robotics",
      gpu: "GPU",
      nvidia: "NVIDIA",
      openai: "OpenAI",
      anthropic: "Anthropic",
      gemini: "Gemini",
      deepseek: "DeepSeek",
      "hugging face": "Hugging Face",
      mcp: "MCP",
      "machine learning": "Machine Learning",
      "computer vision": "Computer Vision",
      security: "AI Security",
      safety: "AI Safety",
      benchmark: "Benchmarks",
      "open source": "Open Source",
      "open-source": "Open Source",
    };

    const matches: string[] = [];

    for (const [searchTerm, label] of Object.entries(
      keywordMap
    )) {
      if (text.includes(searchTerm)) {
        matches.push(label);
      }
    }

    return matches;
  }

  /**
   * Generate a deterministic ID from source + title + URL.
   */
  private createTopicId(
    source: string,
    title: string,
    url: string
  ): string {
    const raw = `${source}|${title}|${url}`;

    let hash = 0;

    for (let index = 0; index < raw.length; index++) {
      hash =
        (hash << 5) -
        hash +
        raw.charCodeAt(index);

      hash |= 0;
    }

    return `topic-${Math.abs(hash)}`;
  }
}

export const topicDiscoveryService =
  new TopicDiscoveryService();