import React from 'react';
import { PieChart, Smile, Meh, Frown, CheckCircle } from 'lucide-react';
import { SentimentMetrics } from '../types';

interface SentimentBreakdownProps {
  sentiment: SentimentMetrics | undefined;
}

export const SentimentBreakdown: React.FC<SentimentBreakdownProps> = ({ sentiment }) => {
  const bullish = sentiment?.bullishPercentage ?? 68;
  const neutral = sentiment?.neutralPercentage ?? 22;
  const cautious = sentiment?.cautiousPercentage ?? 10;
  const drivers = sentiment?.keyDrivers || [];

  return (
    <section className="mb-12">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-lg font-bold text-white">AI Market Sentiment & Impact Drivers</h3>
            <p className="text-xs text-slate-400">Aggregated sentiment analysis across recent papers and developer pulses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Visual Progress Bar Gauges */}
          <div className="space-y-4">
            {/* Bullish */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-2 text-emerald-400">
                  <Smile className="w-4 h-4" /> Bullish (Market Optimism)
                </span>
                <span className="text-slate-200">{bullish}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${bullish}%` }}
                />
              </div>
            </div>

            {/* Neutral */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-2 text-slate-300">
                  <Meh className="w-4 h-4 text-cyan-400" /> Neutral / Observational
                </span>
                <span className="text-slate-200">{neutral}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${neutral}%` }}
                />
              </div>
            </div>

            {/* Cautious */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-2 text-amber-400">
                  <Frown className="w-4 h-4" /> Cautious / Regulatory Watch
                </span>
                <span className="text-slate-200">{cautious}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${cautious}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Drivers List */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Primary Sentiment Catalysts
            </h4>
            <ul className="space-y-2.5">
              {drivers.map((driver, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};
