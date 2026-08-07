import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroMetrics } from '../components/HeroMetrics';
import { TrendAnalytics } from '../components/TrendAnalytics';
import { NewsFeed } from '../components/NewsFeed';
import { ModelMonitor } from '../components/ModelMonitor';
import { SentimentBreakdown } from '../components/SentimentBreakdown';
import { AutonomousStatus } from '../components/AutonomousStatus';
import { SubmitPulseModal } from '../components/SubmitPulseModal';
import { Footer } from '../components/Footer';
import { usePulseData } from '../hooks/usePulseData';

export const DashboardPage: React.FC = () => {
  const {
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    news,
    analytics,
    models,
    autonomousStatus,
    loading,
    refreshData
  } = usePulseData();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 selection:bg-purple-500/30">
      
      {/* Sticky Top Navbar */}
      <Navbar
        search={search}
        setSearch={setSearch}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onRefresh={refreshData}
        loading={loading}
        autoRunEnabled={autonomousStatus?.scheduler.autoRunEnabled}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        
        {/* Top KPI Metrics Cards */}
        <HeroMetrics analytics={analytics} totalNewsCount={news.length} />

        {/* Recharts Analytics Area Chart & Emerging Keywords */}
        <TrendAnalytics analytics={analytics} />

        {/* Autonomous AI Creator Control Panel */}
        <AutonomousStatus status={autonomousStatus} onJobExecuted={refreshData} />

        {/* Frontier AI Model Health & Latency Monitor */}
        <ModelMonitor models={models} />

        {/* Market Sentiment Gauges */}
        <SentimentBreakdown sentiment={analytics?.sentiment} />

        {/* Latest News Feed */}
        <NewsFeed
          news={news}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onNewsUpdated={refreshData}
        />

      </main>

      {/* Footer */}
      <Footer />

      {/* Submit Pulse Article Modal */}
      <SubmitPulseModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitted={refreshData}
      />

    </div>
  );
};
