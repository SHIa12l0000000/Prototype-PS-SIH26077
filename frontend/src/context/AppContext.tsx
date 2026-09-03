import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LocationResult, WeatherResponse, RiskPrediction, AlertItem, PageId } from '../types';
import { fetchWeather, fetchRiskPrediction, fetchAlerts, acknowledgeAlert } from '../services/api';
import { DEMO_LOCATION } from '../services/demoData';

interface AppContextType {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  selectedLocation: LocationResult;
  setSelectedLocation: (loc: LocationResult) => void;
  weather: WeatherResponse | null;
  riskPrediction: RiskPrediction | null;
  alerts: AlertItem[];
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  isLoading: boolean;
  lastUpdated: string;
  refreshData: () => Promise<void>;
  acknowledgeAlertById: (alertId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [selectedLocation, setSelectedLocation] = useState<LocationResult>(DEMO_LOCATION);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [riskPrediction, setRiskPrediction] = useState<RiskPrediction | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const loadData = useCallback(async (loc: LocationResult, demo: boolean) => {
    setIsLoading(true);
    try {
      const [weatherData, riskData, alertsData] = await Promise.all([
        fetchWeather(loc.latitude, loc.longitude, loc.name, demo),
        fetchRiskPrediction(loc.latitude, loc.longitude, loc.name, demo),
        fetchAlerts('ALL', demo)
      ]);
      setWeather(weatherData);
      setRiskPrediction(riskData);
      setAlerts(alertsData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error loading application state:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedLocation, isDemoMode);
  }, [selectedLocation, isDemoMode, loadData]);

  // Auto-refresh every 4 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(selectedLocation, isDemoMode);
    }, 240000);
    return () => clearInterval(interval);
  }, [selectedLocation, isDemoMode, loadData]);

  const refreshData = async () => {
    await loadData(selectedLocation, isDemoMode);
  };

  const acknowledgeAlertById = async (alertId: string) => {
    await acknowledgeAlert(alertId);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a));
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedLocation,
        setSelectedLocation,
        weather,
        riskPrediction,
        alerts,
        isDemoMode,
        setIsDemoMode,
        isLoading,
        lastUpdated,
        refreshData,
        acknowledgeAlertById
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
