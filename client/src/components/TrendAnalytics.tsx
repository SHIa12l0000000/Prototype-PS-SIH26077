import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Hash, Sparkles } from 'lucide-react';
import { AnalyticsData } from '../types';

interface TrendAnalyticsProps {
  analytics: AnalyticsData | null;
}

export const TrendAnalytics: React.FC<TrendAnalyticsProps> = ({ analytics }) => {
  const data = analytics?.velocity || [];
  const keywords = analytics?.topKeywords || [];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">AI Innovation Velocity Matrix</h2>
              </div>
              <p className="text-xs text-slate-400">24-hour acceleration volume across AI sectors</p>
            </div>
            
            {/* Category Legends */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-purple-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> LLMs
              </span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Agents
              </span>
              <span className="flex items-center gap-1.5 text-indigo-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Hardware
              </span>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLlm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAgents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorHardware" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="llmVelocity" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorLlm)" />
                <Area type="monotone" dataKey="agentsVelocity" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorAgents)" />
                <Area type="monotone" dataKey="hardwareVelocity" stroke="#6366F1" strokeWidth={1.5} fillOpacity={1} fill="url(#colorHardware)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Keywords / Emerging Topics List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Emerging AI Keywords</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Highest search & research citation spikes</p>

            <div className="space-y-3">
              {keywords.map((kw, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{kw.word}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {kw.growth}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{kw.count} mentions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Hash className="w-3.5 h-3.5 text-purple-400" /> Auto-indexed by Vector Memory Service
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
