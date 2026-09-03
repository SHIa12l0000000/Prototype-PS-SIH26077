import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';

import { OverviewPage } from './pages/OverviewPage';
import { MapPage } from './pages/MapPage';
import { WeatherIntelligencePage } from './pages/WeatherIntelligencePage';
import { AlertsPage } from './pages/AlertsPage';
import { XaiPage } from './pages/XaiPage';
import { SatellitePage } from './pages/SatellitePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { SystemStatusPage } from './pages/SystemStatusPage';

const Footer: React.FC = () => (
  <footer className="hidden md:block bg-white border-t border-gray-200 mt-6 text-xs text-[#878787]">
    {/* Bottom strip — Amazon-style */}
    <div className="bg-[#232f3e] text-white py-2 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 font-semibold text-xs">
        <span>SIH 26077</span>
        <span className="text-gray-500">·</span>
        <span>Ministry of Earth Sciences</span>
        <span className="text-gray-500">·</span>
        <span>NCMRWF</span>
        <span className="text-gray-500">·</span>
        <span>Theme: Disaster Management</span>
      </div>
      <div className="text-gray-400 text-xs">
        SKYSHIELD v1.0 PROTOTYPE — Not for operational use
      </div>
    </div>
  </footer>
);

const MainLayout: React.FC = () => {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':    return <OverviewPage />;
      case 'map':         return <MapPage />;
      case 'weather':     return <WeatherIntelligencePage />;
      case 'alerts':      return <AlertsPage />;
      case 'xai':         return <XaiPage />;
      case 'satellite':   return <SatellitePage />;
      case 'analytics':   return <AnalyticsPage />;
      case 'datasources': return <DataSourcesPage />;
      case 'status':      return <SystemStatusPage />;
      default:            return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-4 overflow-y-auto pb-20 md:pb-4" style={{ minHeight: 'calc(100vh - 110px)' }}>
          {renderPage()}
        </main>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
