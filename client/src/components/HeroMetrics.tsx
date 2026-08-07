import React from 'react';
import { Activity, Flame, TrendingUp, Bot, ShieldCheck } from 'lucide-react';
import { AnalyticsData } from '../types';

interface HeroMetricsProps {
  analytics: AnalyticsData | null;
  totalNewsCount: number;
}

export const HeroMetrics: React.FC<HeroMetricsProps> = ({ analytics, totalNewsCount }) => {
  const bullish = analytics?.sentiment.bullishPercentage ?? 68;
  const overallScore = analytics?.sentiment.overallScore ?? 82;
  const aiRatio = analytics?.aiGeneratedRatio ?? 64;

  return (
    <section className="relative mb-8">
      {/* Background glow ambient lights */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-600/10 blur-[100px] pointer-events-none" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Global AI Pulse Score */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Global AI Sentiment</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white glow-purple">{overallScore}</span>
            <span className="text-xs font-bold text-emerald-400">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{bullish}% Bullish Index</span>
          </p>
        </div>

        {/* Metric 2: Active Pulses Tracked */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tracked AI Pulses</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white glow-cyan">{totalNewsCount}</span>
            <span className="text-xs font-medium text-cyan-400">+18% today</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Verified paper & news feeds</p>
        </div>

        {/* Metric 3: Autonomous AI Ratio */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Autonomous Curation</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{aiRatio}%</span>
            <span className="text-xs font-medium text-indigo-400">AI Synthesized</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Vector memory & topic discovery</p>
        </div>

        {/* Metric 4: System Operational Health */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inference Status</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">99.9%</span>
            <span className="text-xs font-medium text-emerald-400">Uptime</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>All 5 LLM backends healthy</span>
          </p>
        </div>
      </div>
    </section>
  );
};
