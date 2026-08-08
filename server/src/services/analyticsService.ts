import {
  AnalyticsData,
  SentimentMetrics,
  VelocityMetric
} from '../models/types.js';

import {
  getNewsItems,
  getNewsCount
} from './newsService.js';

/**
 * Generate analytics dynamically from the current
 * TechPulse news store.
 */
export const getAnalyticsData = (): AnalyticsData => {
  const news = getNewsItems();

  // --------------------------------------------------
  // 1. SENTIMENT ANALYSIS
  // --------------------------------------------------

  const total = news.length;

  let bullishCount = 0;
  let neutralCount = 0;
  let cautiousCount = 0;

  for (const item of news) {
    if (item.sentiment === 'Bullish') {
      bullishCount++;
    } else if (item.sentiment === 'Neutral') {
      neutralCount++;
    } else if (item.sentiment === 'Cautious') {
      cautiousCount++;
    }
  }

  const bullishPercentage =
    total > 0
      ? Math.round((bullishCount / total) * 100)
      : 0;

  const neutralPercentage =
    total > 0
      ? Math.round((neutralCount / total) * 100)
      : 0;

  const cautiousPercentage =
    total > 0
      ? Math.round((cautiousCount / total) * 100)
      : 0;

  // Overall sentiment score based on article impact.
  const overallScore =
    total > 0
      ? Math.round(
          news.reduce(
            (sum, item) => sum + item.impactScore,
            0
          ) / total
        )
      : 0;

  const sentiment: SentimentMetrics = {
    bullishPercentage,
    neutralPercentage,
    cautiousPercentage,
    overallScore,
    trendDirection:
      bullishPercentage >= 50
        ? 'Up'
        : cautiousPercentage >= 50
        ? 'Down'
        : 'Stable',

    keyDrivers: getKeyDrivers(news)
  };

  // --------------------------------------------------
  // 2. AI GENERATED RATIO
  // --------------------------------------------------

  const aiGeneratedCount =
    news.filter(
      (item) => item.aiGenerated
    ).length;

  const aiGeneratedRatio =
    total > 0
      ? Math.round(
          (aiGeneratedCount / total) * 100
        )
      : 0;

  // --------------------------------------------------
  // 3. VELOCITY
  // --------------------------------------------------

  const velocity =
    generateVelocityMetrics(news);

  // --------------------------------------------------
  // 4. TOP KEYWORDS
  // --------------------------------------------------

  const topKeywords =
    generateTopKeywords(news);

  // --------------------------------------------------
  // 5. FINAL RESPONSE
  // --------------------------------------------------

  return {
    sentiment,
    velocity,
    topKeywords,
    totalPulseCount: getNewsCount(),
    aiGeneratedRatio
  };
};

/**
 * Find important topics based on article impact.
 */
function getKeyDrivers(
  news: ReturnType<typeof getNewsItems>
): string[] {
  if (news.length === 0) {
    return [
      'No current intelligence signals'
    ];
  }

  return [...news]
    .sort(
      (a, b) =>
        b.impactScore - a.impactScore
    )
    .slice(0, 4)
    .map((item) => item.title);
}

/**
 * Generate a simple 24-hour velocity matrix
 * from currently available articles.
 *
 * This is intentionally deterministic so the
 * dashboard remains stable between refreshes.
 */
function generateVelocityMetrics(
  news: ReturnType<typeof getNewsItems>
): VelocityMetric[] {
  const categories = {
    llm: news.filter(
      (item) => item.category === 'LLMs'
    ).length,

    agents: news.filter(
      (item) => item.category === 'Agents'
    ).length,

    hardware: news.filter(
      (item) => item.category === 'Hardware'
    ).length,

    ethics: news.filter(
      (item) => item.category === 'Ethics'
    ).length
  };

  const total =
    Math.max(news.length, 1);

  const baseLLM =
    Math.round(
      (categories.llm / total) * 100
    );

  const baseAgents =
    Math.round(
      (categories.agents / total) * 100
    );

  const baseHardware =
    Math.round(
      (categories.hardware / total) * 100
    );

  const baseEthics =
    Math.round(
      (categories.ethics / total) * 100
    );

  return [
    {
      time: '00:00',
      llmVelocity: scaleVelocity(baseLLM, 0.55),
      agentsVelocity: scaleVelocity(baseAgents, 0.50),
      hardwareVelocity: scaleVelocity(baseHardware, 0.60),
      ethicsVelocity: scaleVelocity(baseEthics, 0.45)
    },

    {
      time: '04:00',
      llmVelocity: scaleVelocity(baseLLM, 0.65),
      agentsVelocity: scaleVelocity(baseAgents, 0.60),
      hardwareVelocity: scaleVelocity(baseHardware, 0.68),
      ethicsVelocity: scaleVelocity(baseEthics, 0.55)
    },

    {
      time: '08:00',
      llmVelocity: scaleVelocity(baseLLM, 0.78),
      agentsVelocity: scaleVelocity(baseAgents, 0.72),
      hardwareVelocity: scaleVelocity(baseHardware, 0.76),
      ethicsVelocity: scaleVelocity(baseEthics, 0.65)
    },

    {
      time: '12:00',
      llmVelocity: scaleVelocity(baseLLM, 0.88),
      agentsVelocity: scaleVelocity(baseAgents, 0.86),
      hardwareVelocity: scaleVelocity(baseHardware, 0.82),
      ethicsVelocity: scaleVelocity(baseEthics, 0.72)
    },

    {
      time: '16:00',
      llmVelocity: scaleVelocity(baseLLM, 0.94),
      agentsVelocity: scaleVelocity(baseAgents, 0.92),
      hardwareVelocity: scaleVelocity(baseHardware, 0.90),
      ethicsVelocity: scaleVelocity(baseEthics, 0.80)
    },

    {
      time: '20:00',
      llmVelocity: scaleVelocity(baseLLM, 1.0),
      agentsVelocity: scaleVelocity(baseAgents, 1.0),
      hardwareVelocity: scaleVelocity(baseHardware, 0.96),
      ethicsVelocity: scaleVelocity(baseEthics, 0.88)
    }
  ];
}

/**
 * Scale velocity while keeping values between 0-100.
 */
function scaleVelocity(
  value: number,
  multiplier: number
): number {
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(value * multiplier)
    )
  );
}

/**
 * Extract the most frequently used tags
 * from current news articles.
 */
function generateTopKeywords(
  news: ReturnType<typeof getNewsItems>
): {
  word: string;
  count: number;
  growth: string;
}[] {
  const keywordMap =
    new Map<string, number>();

  for (const item of news) {
    for (const tag of item.tags) {
      const normalized =
        tag.trim();

      if (!normalized) {
        continue;
      }

      keywordMap.set(
        normalized,
        (keywordMap.get(normalized) ?? 0) + 1
      );
    }
  }

  const keywords =
    Array.from(keywordMap.entries())
      .sort(
        (a, b) => b[1] - a[1]
      )
      .slice(0, 6);

  return keywords.map(
    ([word, count], index) => {
      /*
       * Growth is currently derived from
       * keyword frequency.
       *
       * Later this can be replaced with
       * real Google Trends / RSS velocity.
       */
      const growth =
        Math.min(
          200,
          15 +
            count * 25 +
            Math.max(0, 5 - index) * 5
        );

      return {
        word,
        count: count * 100,
        growth: `+${growth}%`
      };
    }
  );
};