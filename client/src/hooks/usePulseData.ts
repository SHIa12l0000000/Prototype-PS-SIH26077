import { useState, useEffect, useCallback } from 'react';
import { NewsItem, AnalyticsData, ModelStatus, AutonomousStatus } from '../types';
import { fetchNews, fetchAnalytics, fetchModelStatuses, fetchAutonomousStatus } from '../services/api';

export function usePulseData() {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [models, setModels] = useState<ModelStatus[]>([]);
  const [autonomousStatus, setAutonomousStatus] = useState<AutonomousStatus | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [newsData, analyticsData, modelsData, autoData] = await Promise.all([
        fetchNews(search, selectedCategory),
        fetchAnalytics(),
        fetchModelStatuses(),
        fetchAutonomousStatus()
      ]);

      setNews(newsData);
      setAnalytics(analyticsData);
      setModels(modelsData);
      setAutonomousStatus(autoData);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('Error fetching dashboard pulse data:', err);
      setError('Failed to sync real-time intelligence data. Retrying...');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    loadAllData();

    // Auto-refresh pulse metrics every 15 seconds
    const interval = setInterval(() => {
      fetchNews(search, selectedCategory).then(setNews).catch(() => {});
      fetchModelStatuses().then(setModels).catch(() => {});
      fetchAutonomousStatus().then(setAutonomousStatus).catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, [loadAllData, search, selectedCategory]);

  return {
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    news,
    setNews,
    analytics,
    models,
    autonomousStatus,
    setAutonomousStatus,
    loading,
    error,
    lastRefreshed,
    refreshData: loadAllData
  };
}
