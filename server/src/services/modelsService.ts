import { ModelStatus } from '../models/types.js';

let models: ModelStatus[] = [
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google DeepMind',
    version: '1.5-2024-09',
    status: 'Operational',
    latencyMs: 142,
    uptimePercentage: 99.98,
    tokensPerSec: 125,
    lastUpdated: 'Just now'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek AI',
    version: 'R1-Reasoning',
    status: 'Operational',
    latencyMs: 185,
    uptimePercentage: 99.92,
    tokensPerSec: 88,
    lastUpdated: '2 mins ago'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    version: '3.5-v2',
    status: 'Operational',
    latencyMs: 165,
    uptimePercentage: 99.95,
    tokensPerSec: 105,
    lastUpdated: '1 min ago'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o Omnis',
    provider: 'OpenAI',
    version: '4o-2024-08',
    status: 'Operational',
    latencyMs: 155,
    uptimePercentage: 99.91,
    tokensPerSec: 110,
    lastUpdated: 'Just now'
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Meta AI',
    version: '3.3-Instruct',
    status: 'Operational',
    latencyMs: 95,
    uptimePercentage: 100.0,
    tokensPerSec: 160,
    lastUpdated: '3 mins ago'
  }
];

export const getModelStatuses = (): ModelStatus[] => {
  // Simulate subtle real-time latency fluctuations
  return models.map(m => ({
    ...m,
    latencyMs: Math.max(70, m.latencyMs + Math.floor(Math.random() * 11) - 5),
    lastUpdated: 'Just now'
  }));
};
