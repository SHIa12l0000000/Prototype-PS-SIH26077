import {
  NewsItem,
  AnalyticsData,
  ModelStatus,
  AutonomousStatus,
} from '../types';

// Railway backend URL
const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://techpulse-ai-production-4086.up.railway.app/api';

/**
 * Generic API helper
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `API request failed: ${response.status} ${response.statusText}${
        errorText ? ` - ${errorText}` : ''
      }`
    );
  }

  return (await response.json()) as T;
}

/**
 * Fetch news articles
 */
export const fetchNews = async (
  search: string = '',
  category: string = 'All'
): Promise<NewsItem[]> => {
  try {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.append('search', search.trim());
    }

    if (category && category !== 'All') {
      params.append('category', category);
    }

    const query = params.toString();

    const response = await apiRequest<{
      success: boolean;
      data: NewsItem[];
    }>(`/news${query ? `?${query}` : ''}`);

    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return [];
  }
};

/**
 * Fetch analytics
 */
export const fetchAnalytics =
  async (): Promise<AnalyticsData | null> => {
    try {
      const response = await apiRequest<{
        success: boolean;
        data: AnalyticsData;
      }>('/analytics');

      return response.data || null;
    } catch (error) {
      console.error(
        'Failed to fetch analytics:',
        error
      );

      return null;
    }
  };

/**
 * Fetch AI model statuses
 */
export const fetchModelStatuses =
  async (): Promise<ModelStatus[]> => {
    try {
      const response = await apiRequest<{
        success: boolean;
        data: ModelStatus[];
      }>('/models/status');

      return response.data || [];
    } catch (error) {
      console.error(
        'Failed to fetch model statuses:',
        error
      );

      return [];
    }
  };

/**
 * Fetch autonomous AI system status
 */
export const fetchAutonomousStatus =
  async (): Promise<AutonomousStatus | null> => {
    try {
      const response = await apiRequest<{
        success: boolean;
        data: AutonomousStatus;
      }>('/autonomous/status');

      return response.data || null;
    } catch (error) {
      console.error(
        'Failed to fetch autonomous status:',
        error
      );

      return null;
    }
  };

/**
 * Autonomous workflow job response
 *
 * AutonomousStatus.tsx expects:
 * response.job.logs
 */
export interface AutonomousJobResponse {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  logs: string[];
  payload?: NewsItem;
}

/**
 * Trigger autonomous workflow manually
 */
export const triggerAutonomousJob =
  async (): Promise<{
    success: boolean;
    job: AutonomousJobResponse;
  }> => {
    const response =
      await apiRequest<{
        success: boolean;
        job: AutonomousJobResponse;
      }>('/autonomous/trigger', {
        method: 'POST',
      });

    return response;
  };

/**
 * Upvote a news article
 */
export const upvoteNewsArticle = async (
  id: string
): Promise<NewsItem | null> => {
  try {
    const response = await apiRequest<{
      success: boolean;
      data: NewsItem;
    }>(
      `/news/${encodeURIComponent(id)}/upvote`,
      {
        method: 'POST',
      }
    );

    return response.data || null;
  } catch (error) {
    console.error(
      'Failed to upvote article:',
      error
    );

    return null;
  }
};

/**
 * Submit a new TechPulse article
 */
export const submitPulseArticle = async (
  payload: Partial<NewsItem>
): Promise<NewsItem> => {
  const response = await apiRequest<{
    success: boolean;
    data: NewsItem;
  }>('/news', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.data) {
    throw new Error(
      'Backend did not return the created article.'
    );
  }

  return response.data;
};