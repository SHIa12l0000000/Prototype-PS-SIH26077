import Parser from "rss-parser";
import { logger } from "../utils/logger.js";
import { Category } from "../models/types.js";

export interface DiscoveredTopic {
  id: string;

  topic: string;

  category: Category;

  sourceVolume: number;

  velocityGrowth: string;

  keywords: string[];

  discoveredAt: string;

  // Real source information
  source: string;

  url: string;

  // Original RSS description/content
  summary: string;
}

interface FeedConfig {
  url: string;
  category: Category;
  source: string;
}

export class TopicDiscoveryService {
  private discoveredTopics: DiscoveredTopic[] = [];

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
  ];

  public async scanTrendingTopics(): Promise<DiscoveredTopic[]> {
    logger.autonomous(
      "TopicDiscovery",
      "Scanning live AI news sources..."
    );

    const parser = new Parser();

    const topics: DiscoveredTopic[] = [];

    for (const feedSource of this.feeds) {
      try {
        logger.autonomous(
          "TopicDiscovery",
          `Reading RSS feed: ${feedSource.source}`
        );

        const feed = await parser.parseURL(feedSource.url);

        const items = feed.items.slice(0, 10);

        for (let index = 0; index < items.length; index++) {
          const item = items[index];

          const title = item.title?.trim();

          if (!title) {
            continue;
          }

          /*
           * Prevent duplicate topics.
           *
           * Case-insensitive comparison allows:
           * "OpenAI launches X"
           * "openai launches x"
           *
           * to be treated as the same topic.
           */
          const normalizedTitle = title.toLowerCase();

          const exists = topics.some(
            (topic) =>
              topic.topic.toLowerCase() === normalizedTitle
          );

          if (exists) {
            continue;
          }

          /*
           * RSS feeds normally provide the original article URL.
           *
           * This is the important fix:
           * we preserve the REAL source URL instead of later
           * publishing everything as news.google.com.
           */
          const articleUrl =
            item.link?.trim() || feedSource.url;

          /*
           * Extract RSS categories/tags.
           */
          const rssKeywords =
            item.categories
              ?.map((category) => String(category).trim())
              .filter(Boolean) || [];

          /*
           * Always keep useful fallback keywords.
           */
          const keywords = Array.from(
            new Set([
              ...rssKeywords,
              "AI",
              "Artificial Intelligence",
              feedSource.source,
            ])
          ).slice(0, 8);

          /*
           * RSS does not provide a universal "volume" metric.
           *
           * Instead of using Math.random(), use a deterministic
           * signal based on feed position.
           *
           * Earlier RSS items are normally newer and therefore
           * receive a slightly stronger discovery signal.
           */
          const sourceVolume = Math.max(
            500,
            1500 - index * 100
          );

          /*
           * Deterministic velocity estimate.
           *
           * This is intentionally an ESTIMATE because RSS feeds
           * do not provide real search-volume velocity.
           *
           * Later we can replace this with Google Trends,
           * Reddit, GitHub, or another real signal.
           */
          const estimatedGrowth = Math.max(
            20,
            140 - index * 10
          );

          const summary =
            item.contentSnippet?.trim() ||
            item.content?.replace(/<[^>]*>/g, "").trim() ||
            item.summary?.replace(/<[^>]*>/g, "").trim() ||
            `Latest update from ${feedSource.source}.`;

          const discoveredAt =
            item.isoDate ||
            item.pubDate ||
            new Date().toISOString();

          /*
           * Create a stable-ish ID using the source and title.
           */
          const idSource =
            `${feedSource.source}-${title}-${articleUrl}`;

          const id = Buffer.from(idSource)
            .toString("base64")
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(0, 32);

          const topic: DiscoveredTopic = {
            id: `topic-${id}`,

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
            `Discovered: "${title}" from ${feedSource.source}`
          );
        }
      } catch (error) {
        logger.warn(
          `RSS failed: ${feedSource.url}`,
          error
        );
      }
    }

    /*
     * Newest topics first.
     */
    topics.sort(
      (a, b) =>
        new Date(b.discoveredAt).getTime() -
        new Date(a.discoveredAt).getTime()
    );

    /*
     * Keep the latest discovery result in memory.
     */
    this.discoveredTopics = topics;

    logger.autonomous(
      "TopicDiscovery",
      `Discovered ${topics.length} live topics`
    );

    return topics;
  }

  public getDiscoveredTopics(): DiscoveredTopic[] {
    return [...this.discoveredTopics];
  }
}

export const topicDiscoveryService =
  new TopicDiscoveryService();