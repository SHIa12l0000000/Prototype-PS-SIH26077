import React from 'react';
import { Server, Zap, CheckCircle2, AlertTriangle, Gauge } from 'lucide-react';
import { ModelStatus } from '../types';

interface ModelMonitorProps {
  models: ModelStatus[];
}

export const ModelMonitor: React.FC<ModelMonitorProps> = ({ models }) => {
  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <span>Frontier AI Model Status & Latency Monitor</span>
          </h2>
          <p className="text-xs text-slate-400">Real-time health, inference latency, and tokens/sec throughput</p>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {models.map((model) => {
          const isOperational = model.status === 'Operational';
          const isFast = model.latencyMs < 150;

          return (
            <div
              key={model.id}
              className="glass-panel glass-panel-hover p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">{model.provider}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Operational
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-1">{model.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono mb-4">{model.version}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                {/* Latency Metric */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> Latency
                    </span>
                    <span className={`font-bold font-mono ${isFast ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {model.latencyMs} ms
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isFast ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(100, (model.latencyMs / 300) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Throughput Metric */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-cyan-400" /> Speed
                  </span>
                  <span className="font-bold text-slate-200">{model.tokensPerSec} tok/s</span>
                </div>

                {/* Uptime Metric */}
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Uptime</span>
                  <span className="font-semibold text-slate-300">{model.uptimePercentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
