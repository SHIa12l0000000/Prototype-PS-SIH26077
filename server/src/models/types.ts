export type Category =
    | 'LLMs'
    | 'Hardware'
    | 'Multimodal'
    | 'Agents'
    | 'Ethics'
    | 'Research';


export interface NewsItem {

    id: string;

    title: string;

    summary: string;

    content: string;

    category: Category;

    author: string;

    source: string;

    url: string;

    publishedAt: string;

    readTime: string;

    upvotes: number;

    sentiment:
        | 'Bullish'
        | 'Neutral'
        | 'Cautious';

    impactScore: number; // 1-100

    aiGenerated: boolean;

    tags: string[];
}


export interface ModelStatus {

    id: string;

    name: string;

    provider: string;

    version: string;

    status:
        | 'Operational'
        | 'Degraded'
        | 'Maintenance'
        | 'Offline';

    latencyMs: number;

    uptimePercentage: number;

    tokensPerSec: number;

    lastUpdated: string;
}


export interface SentimentMetrics {

    bullishPercentage: number;

    neutralPercentage: number;

    cautiousPercentage: number;

    overallScore: number; // 0-100

    trendDirection:
        | 'Up'
        | 'Down'
        | 'Stable';

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

    topKeywords: {
        word: string;
        count: number;
        growth: string;
    }[];

    totalPulseCount: number;

    aiGeneratedRatio: number;
}


export interface AutonomousJob {

    id: string;

    type:
        | 'DISCOVERY'
        | 'SCORING'
        | 'GENERATION'
        | 'MEMORY_INDEXING';

    status:
        | 'QUEUED'
        | 'RUNNING'
        | 'COMPLETED'
        | 'FAILED';

    startedAt: string;

    completedAt?: string;

    logs: string[];

    payload?: any;
}