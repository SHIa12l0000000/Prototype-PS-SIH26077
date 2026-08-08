import { NewsItem } from '../models/types.js';

let newsStore: NewsItem[] = [
  {
    id: 'pulse-1',
    title: 'DeepSeek R1 Architecture Unveils Next-Gen Reasoning Efficiency',
    summary:
      'Open-weights reasoning model demonstrates breakthrough performance using pure reinforcement learning without extensive supervised fine-tuning.',
    content:
      'The release of DeepSeek R1 has disrupted traditional LLM scaling paradigms by proving that high-level reasoning capabilities can emerge through targeted reinforcement learning. Benchmarks across MATH-500, AIME, and Codeforces rival state-of-the-art closed models.',
    category: 'LLMs',
    author: 'Elena Rostova',
    source: 'TechPulse Intelligence',
    url: 'https://arxiv.org/',
    publishedAt: new Date(
      Date.now() - 25 * 60 * 1000
    ).toISOString(),
    readTime: '4 min read',
    upvotes: 342,
    sentiment: 'Bullish',
    impactScore: 98,
    aiGenerated: true,
    tags: [
      'Reasoning',
      'RL',
      'DeepSeek',
      'Open Weights'
    ]
  },

  {
    id: 'pulse-2',
    title:
      'Gemini 1.5 Flash 8B Benchmarks Show Sub-100ms Inference Latency',
    summary:
      'Google DeepMind optimizes multimodal architecture for ultra-high speed and lower cost per token, unlocking real-time audio and vision agents.',
    content:
      'Gemini 1.5 Flash 8B achieves significant speedups through lightweight multi-query attention mechanisms and streamlined context caching, making it ideal for edge applications.',
    category: 'Multimodal',
    author: 'Marcus Vance',
    source: 'DeepMind Research',
    url: 'https://deepmind.google/',
    publishedAt: new Date(
      Date.now() - 110 * 60 * 1000
    ).toISOString(),
    readTime: '3 min read',
    upvotes: 219,
    sentiment: 'Bullish',
    impactScore: 91,
    aiGenerated: false,
    tags: [
      'Gemini',
      'Multimodal',
      'Latency',
      'Realtime'
    ]
  },

  {
    id: 'pulse-3',
    title:
      'Autonomous AI Agent Swarms Orchestrate End-to-End Microservice Refactoring',
    summary:
      'Multi-agent system using standardized protocols autonomously identifies legacy codebase bottlenecks, writes unit tests, and executes zero-downtime PRs.',
    content:
      'Engineering teams report 4x developer output acceleration when using autonomous agent orchestrators equipped with self-correcting feedback loops.',
    category: 'Agents',
    author: 'TechPulse Autonomous Engine',
    source: 'Autonomous AI Agent',
    url: 'https://github.com/',
    publishedAt: new Date(
      Date.now() - 240 * 60 * 1000
    ).toISOString(),
    readTime: '6 min read',
    upvotes: 488,
    sentiment: 'Bullish',
    impactScore: 95,
    aiGenerated: true,
    tags: [
      'Autonomous Agents',
      'Software Engineering',
      'Multi-Agent',
      'Orchestration'
    ]
  },

  {
    id: 'pulse-4',
    title:
      'NVIDIA Blackwell Ultra Chips Reach Production Yield Milestones',
    summary:
      'Next-generation NVLink switch architectures double inter-GPU communication bandwidth, reducing training bottlenecks for trillion-parameter models.',
    content:
      'TSMC advanced packaging yields for B200 and GB200 systems have stabilized, paving the way for massive enterprise data center deployments.',
    category: 'Hardware',
    author: 'Sarah Chen',
    source: 'Hardware Insights',
    url: 'https://www.nvidia.com/',
    publishedAt: new Date(
      Date.now() - 360 * 60 * 1000
    ).toISOString(),
    readTime: '5 min read',
    upvotes: 185,
    sentiment: 'Neutral',
    impactScore: 89,
    aiGenerated: false,
    tags: [
      'NVIDIA',
      'Blackwell',
      'Hardware',
      'Compute'
    ]
  },

  {
    id: 'pulse-5',
    title:
      'Global AI Safety Protocol Framework Drafted by International Tech Coalition',
    summary:
      'Leading frontier AI labs propose unified standards for autonomous capability evaluations, red-teaming benchmarks, and model watermarking.',
    content:
      'The coalition agreement includes strict reporting guidelines for training runs exceeding 10^26 FLOPs and mandatory safety guardrails for agentic tool access.',
    category: 'Ethics',
    author: 'David Thorne',
    source: 'AI Safety Watch',
    url: 'https://aisafety.org/',
    publishedAt: new Date(
      Date.now() - 480 * 60 * 1000
    ).toISOString(),
    readTime: '4 min read',
    upvotes: 142,
    sentiment: 'Cautious',
    impactScore: 84,
    aiGenerated: false,
    tags: [
      'Safety',
      'Governance',
      'Ethics',
      'Policy'
    ]
  }
];

/**
 * Get news articles.
 *
 * Supports:
 * - category filtering
 * - search filtering
 * - newest-first sorting
 */
export const getNewsItems = (
  search?: string,
  category?: string
): NewsItem[] => {
  let result = [...newsStore];

  // Category filter
  if (
    category &&
    category.trim() !== '' &&
    category.toLowerCase() !== 'all'
  ) {
    const normalizedCategory =
      category.trim().toLowerCase();

    result = result.filter(
      (item) =>
        item.category.toLowerCase() ===
        normalizedCategory
    );
  }

  // Search filter
  if (search && search.trim() !== '') {
    const query = search.trim().toLowerCase();

    result = result.filter((item) => {
      const titleMatch =
        item.title.toLowerCase().includes(query);

      const summaryMatch =
        item.summary.toLowerCase().includes(query);

      const contentMatch =
        item.content.toLowerCase().includes(query);

      const tagMatch =
        item.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );

      const authorMatch =
        item.author.toLowerCase().includes(query);

      return (
        titleMatch ||
        summaryMatch ||
        contentMatch ||
        tagMatch ||
        authorMatch
      );
    });
  }

  // Newest articles first
  return result.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() -
      new Date(a.publishedAt).getTime()
  );
};

/**
 * Add a newly generated news article.
 */
export const addNewsItem = (
  item: Omit<
    NewsItem,
    'id' | 'publishedAt' | 'upvotes'
  >
): NewsItem => {
  const newItem: NewsItem = {
    ...item,

    id: `pulse-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}`,

    publishedAt: new Date().toISOString(),

    upvotes: 1
  };

  newsStore.unshift(newItem);

  return newItem;
};

/**
 * Upvote an article.
 */
export const upvoteNewsItem = (
  id: string
): NewsItem | null => {
  const item = newsStore.find(
    (newsItem) => newsItem.id === id
  );

  if (!item) {
    return null;
  }

  item.upvotes += 1;

  return item;
};

/**
 * Get one article by ID.
 */
export const getNewsItemById = (
  id: string
): NewsItem | null => {
  return (
    newsStore.find(
      (item) => item.id === id
    ) ?? null
  );
};

/**
 * Get total number of articles.
 */
export const getNewsCount = (): number => {
  return newsStore.length;
};