export type Category = 'All' | 'LLMs' | 'Hardware' | 'Multimodal' | 'Agents' | 'Ethics' | 'Research';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  category: Category;
  author: string;
  source: string;
  url: string;
  publishedAt: string;
  readTime: string;
  upvotes: number;
  sentiment: 'Bullish' | 'Neutral' | 'Cautious';
  impactScore: number;
  aiGenerated?: boolean;
  tags: string[];
}

export interface ModelStatus {
  id: string;
  name: string;
  provider: string;
  version: string;
  status: 'Operational' | 'Degraded' | 'Maintenance' | 'Offline';
  latencyMs: number;
  uptimePercentage: number;
  tokensPerSec: number;
  lastUpdated: string;
}

export interface SentimentMetrics {
  bullishPercentage: number;
  neutralPercentage: number;
  cautiousPercentage: number;
  overallScore: number;
  trendDirection: 'Up' | 'Down' | 'Stable';
  keyDrivers: string[];
}

export interface VelocityMetric {
  time: string;
  llmVelocity: number;
  agentsVelocity: number;
  hardwareVelocity: number;
  ethicsVelocity: number;
}

export interface AnalyticsData {
  sentiment: SentimentMetrics;
  velocity: VelocityMetric[];
  topKeywords: { word: string; count: number; growth: string }[];
  totalPulseCount: number;
  aiGeneratedRatio: number;
}

export interface DiscoveredTopic {
  id: string;
  topic: string;
  category: string;
  sourceVolume: number;
  velocityGrowth: string;
  keywords: string[];
  discoveredAt: string;
}

export interface AutonomousJob {
  id: string;
  type: 'DISCOVERY' | 'SCORING' | 'GENERATION' | 'MEMORY_INDEXING';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  logs: string[];
  payload?: any;
}

export interface AutonomousStatus {
  scheduler: {
    autoRunEnabled: boolean;
    activeJobsCount: number;
    completedJobsCount: number;
    lastRunAt: string;
  };
  memory: {
    vectorCount: number;
    dimension: number;
    indexStatus: string;
    lastSynced: string;
  };
  discoveredTopicsCount: number;
  discoveredTopics: DiscoveredTopic[];
  jobs: AutonomousJob[];
}
