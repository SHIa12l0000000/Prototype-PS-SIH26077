import { AnalyticsData, SentimentMetrics, VelocityMetric } from '../models/types.js';

export const getAnalyticsData = (): AnalyticsData => {
  const sentiment: SentimentMetrics = {
    bullishPercentage: 68,
    neutralPercentage: 22,
    cautiousPercentage: 10,
    overallScore: 82,
    trendDirection: 'Up',
    keyDrivers: [
      'Breakthrough Open-Weights Reasoning Models',
      'Sub-100ms Multimodal Inference Speed',
      'Autonomous Agent Swarm Workflows',
      'Next-Gen GPU Interconnect Yields'
    ]
  };

  const velocity: VelocityMetric[] = [
    { time: '00:00', llmVelocity: 45, agentsVelocity: 30, hardwareVelocity: 60, ethicsVelocity: 20 },
    { time: '04:00', llmVelocity: 55, agentsVelocity: 42, hardwareVelocity: 62, ethicsVelocity: 25 },
    { time: '08:00', llmVelocity: 78, agentsVelocity: 65, hardwareVelocity: 70, ethicsVelocity: 35 },
    { time: '12:00', llmVelocity: 92, agentsVelocity: 88, hardwareVelocity: 75, ethicsVelocity: 40 },
    { time: '16:00', llmVelocity: 88, agentsVelocity: 95, hardwareVelocity: 82, ethicsVelocity: 45 },
    { time: '20:00', llmVelocity: 96, agentsVelocity: 92, hardwareVelocity: 85, ethicsVelocity: 50 },
  ];

  const topKeywords = [
    { word: 'DeepSeek Reasoning', count: 1420, growth: '+145%' },
    { word: 'Autonomous Agents', count: 1180, growth: '+92%' },
    { word: 'Gemini Multimodal', count: 980, growth: '+64%' },
    { word: 'Blackwell GPU', count: 850, growth: '+40%' },
    { word: 'Context Caching', count: 720, growth: '+55%' },
    { word: 'AI Governance', count: 540, growth: '+18%' }
  ];

  return {
    sentiment,
    velocity,
    topKeywords,
    totalPulseCount: 384,
    aiGeneratedRatio: 64
  };
};
