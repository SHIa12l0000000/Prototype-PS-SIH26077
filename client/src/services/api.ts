import { NewsItem, AnalyticsData, ModelStatus, AutonomousStatus } from '../types';

const API_BASE = '/api';

export const fetchNews = async (search: string = '', category: string = 'All'): Promise<NewsItem[]> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);

    const res = await fetch(`${API_BASE}/news?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.warn('API connection offline or failed, returning mock fallback news.', error);
    return getFallbackNews(search, category);
  }
};

export const fetchAnalytics = async (): Promise<AnalyticsData> => {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.warn('API connection offline or failed, returning mock fallback analytics.', error);
    return getFallbackAnalytics();
  }
};

export const fetchModelStatuses = async (): Promise<ModelStatus[]> => {
  try {
    const res = await fetch(`${API_BASE}/models/status`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.warn('API connection offline or failed, returning mock fallback model statuses.', error);
    return getFallbackModels();
  }
};

export const fetchAutonomousStatus = async (): Promise<AutonomousStatus> => {
  try {
    const res = await fetch(`${API_BASE}/autonomous/status`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.warn('API connection offline or failed, returning mock fallback autonomous status.', error);
    return getFallbackAutonomousStatus();
  }
};

export const triggerAutonomousJob = async (): Promise<any> => {
  const res = await fetch(`${API_BASE}/autonomous/trigger`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
};

export const upvoteNewsArticle = async (id: string): Promise<NewsItem | null> => {
  try {
    const res = await fetch(`${API_BASE}/news/${id}/upvote`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.warn('Upvote API failed', error);
    return null;
  }
};

export const submitPulseArticle = async (payload: any): Promise<NewsItem> => {
  const res = await fetch(`${API_BASE}/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.data;
};

// Fallbacks for initial offline rendering
function getFallbackNews(search: string, category: string): NewsItem[] {
  const all: NewsItem[] = [
    {
      id: 'pulse-1',
      title: 'DeepSeek R1 Architecture Unveils Next-Gen Reasoning Efficiency',
      summary: 'Open-weights reasoning model demonstrates breakthrough performance using pure reinforcement learning without extensive supervised fine-tuning.',
      category: 'LLMs',
      author: 'Elena Rostova',
      source: 'TechPulse Intelligence',
      url: 'https://arxiv.org',
      publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      readTime: '4 min read',
      upvotes: 342,
      sentiment: 'Bullish',
      impactScore: 98,
      aiGenerated: true,
      tags: ['Reasoning', 'RL', 'DeepSeek', 'Open Weights']
    },
    {
      id: 'pulse-2',
      title: 'Gemini 1.5 Flash 8B Benchmarks Show Sub-100ms Inference Latency',
      summary: 'Google DeepMind optimizes multimodal architecture for ultra-high speed and lower cost per token, unlocking real-time audio and vision agents.',
      category: 'Multimodal',
      author: 'Marcus Vance',
      source: 'DeepMind Research',
      url: 'https://deepmind.google',
      publishedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      readTime: '3 min read',
      upvotes: 219,
      sentiment: 'Bullish',
      impactScore: 91,
      aiGenerated: false,
      tags: ['Gemini', 'Multimodal', 'Latency', 'Realtime']
    },
    {
      id: 'pulse-3',
      title: 'Autonomous AI Agent Swarms Orchestrate End-to-End Microservice Refactoring',
      summary: 'Multi-agent system using standardized protocols autonomously identifies legacy codebase bottlenecks, writes unit tests, and executes zero-downtime PRs.',
      category: 'Agents',
      author: 'TechPulse Autonomous Engine',
      source: 'Autonomous AI Agent',
      url: 'https://github.com',
      publishedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
      readTime: '6 min read',
      upvotes: 488,
      sentiment: 'Bullish',
      impactScore: 95,
      aiGenerated: true,
      tags: ['Autonomous Agents', 'Software Engineering', 'Multi-Agent']
    }
  ];

  let filtered = all;
  if (category && category !== 'All') {
    filtered = filtered.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(i => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q));
  }
  return filtered;
}

function getFallbackAnalytics(): AnalyticsData {
  return {
    sentiment: {
      bullishPercentage: 68,
      neutralPercentage: 22,
      cautiousPercentage: 10,
      overallScore: 82,
      trendDirection: 'Up',
      keyDrivers: ['Breakthrough Open-Weights Reasoning', 'Sub-100ms Inference', 'Agent Swarm Workflows']
    },
    velocity: [
      { time: '00:00', llmVelocity: 45, agentsVelocity: 30, hardwareVelocity: 60, ethicsVelocity: 20 },
      { time: '04:00', llmVelocity: 55, agentsVelocity: 42, hardwareVelocity: 62, ethicsVelocity: 25 },
      { time: '08:00', llmVelocity: 78, agentsVelocity: 65, hardwareVelocity: 70, ethicsVelocity: 35 },
      { time: '12:00', llmVelocity: 92, agentsVelocity: 88, hardwareVelocity: 75, ethicsVelocity: 40 },
      { time: '16:00', llmVelocity: 88, agentsVelocity: 95, hardwareVelocity: 82, ethicsVelocity: 45 },
      { time: '20:00', llmVelocity: 96, agentsVelocity: 92, hardwareVelocity: 85, ethicsVelocity: 50 },
    ],
    topKeywords: [
      { word: 'DeepSeek Reasoning', count: 1420, growth: '+145%' },
      { word: 'Autonomous Agents', count: 1180, growth: '+92%' },
      { word: 'Gemini Multimodal', count: 980, growth: '+64%' },
      { word: 'Blackwell GPU', count: 850, growth: '+40%' }
    ],
    totalPulseCount: 384,
    aiGeneratedRatio: 64
  };
}

function getFallbackModels(): ModelStatus[] {
  return [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google DeepMind', version: '1.5-Pro', status: 'Operational', latencyMs: 142, uptimePercentage: 99.98, tokensPerSec: 125, lastUpdated: 'Just now' },
    { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek AI', version: 'R1-Reasoning', status: 'Operational', latencyMs: 185, uptimePercentage: 99.92, tokensPerSec: 88, lastUpdated: 'Just now' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', version: '3.5-v2', status: 'Operational', latencyMs: 165, uptimePercentage: 99.95, tokensPerSec: 105, lastUpdated: 'Just now' },
    { id: 'gpt-4o', name: 'GPT-4o Omnis', provider: 'OpenAI', version: '4o-2024-08', status: 'Operational', latencyMs: 155, uptimePercentage: 99.91, tokensPerSec: 110, lastUpdated: 'Just now' }
  ];
}

function getFallbackAutonomousStatus(): AutonomousStatus {
  return {
    scheduler: { autoRunEnabled: true, activeJobsCount: 0, completedJobsCount: 12, lastRunAt: new Date().toISOString() },
    memory: { vectorCount: 42, dimension: 1536, indexStatus: 'HEALTHY', lastSynced: new Date().toISOString() },
    discoveredTopicsCount: 3,
    discoveredTopics: [],
    jobs: []
  };
}
