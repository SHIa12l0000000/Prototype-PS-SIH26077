import React, { useState } from 'react';
import { Bot, Play, Database, Sparkles, Terminal, CheckCircle2, Layers, Cpu } from 'lucide-react';
import { AutonomousStatus as AutonomousStatusType } from '../types';
import { triggerAutonomousJob } from '../services/api';

interface AutonomousStatusProps {
  status: AutonomousStatusType | null;
  onJobExecuted: () => void;
}

export const AutonomousStatus: React.FC<AutonomousStatusProps> = ({ status, onJobExecuted }) => {
  const [running, setRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'TOPICS' | 'LOGS'>('SERVICES');
  const [lastJobLogs, setLastJobLogs] = useState<string[]>([]);

  const handleTriggerWorkflow = async () => {
    try {
      setRunning(true);
      const res = await triggerAutonomousJob();
      if (res.job?.logs) {
        setLastJobLogs(res.job.logs);
      }
      onJobExecuted();
    } catch (err) {
      console.error('Trigger workflow failed', err);
    } finally {
      setRunning(false);
    }
  };

  const scheduler = status?.scheduler;
  const memory = status?.memory;
  const topics = status?.discoveredTopics || [];

  return (
    <section className="mb-12">
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-purple-500/10 blur-[80px] pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Bot className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Autonomous AI Creator Engine</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AUTONOMOUS SCHEDULER ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous topic discovery, editorial scoring, AI synthesis & vector memory indexing</p>
            </div>
          </div>

          <button
            onClick={handleTriggerWorkflow}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Executing Autonomous Agent Run...' : 'Trigger Autonomous AI Cycle'}</span>
          </button>
        </div>

        {/* Control Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'SERVICES'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Core AI Services (5)
          </button>
          <button
            onClick={() => setActiveTab('TOPICS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'TOPICS'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Discovered Topics ({topics.length})
          </button>
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'LOGS'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Execution Logs & Vector Memory
          </button>
        </div>

        {/* Tab 1: Core Services Grid */}
        {activeTab === 'SERVICES' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Service 1: Topic Discovery */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Topic Discovery
                </span>
                <span className="text-[10px] font-bold text-emerald-400">READY</span>
              </div>
              <p className="text-xs text-slate-400">Scans arXiv, RSS, & research papers for high-velocity signal.</p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Signal Threshold: 80%</span>
                <span>Auto-scan: 45s</span>
              </div>
            </div>

            {/* Service 2: Editorial Scoring */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Editorial Scoring
                </span>
                <span className="text-[10px] font-bold text-emerald-400">READY</span>
              </div>
              <p className="text-xs text-slate-400">Evaluates relevance & novelty metrics (0-100 scale).</p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Threshold: &gt;88</span>
                <span>Weighted LLM</span>
              </div>
            </div>

            {/* Service 3: AI Content Gen */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> AI Content Gen
                </span>
                <span className="text-[10px] font-bold text-emerald-400">READY</span>
              </div>
              <p className="text-xs text-slate-400">Synthesizes multi-source news summaries & structured tags.</p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Format: Markdown</span>
                <span>Auto-publish</span>
              </div>
            </div>

            {/* Service 4: Memory Vector Index */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" /> Vector Memory
                </span>
                <span className="text-[10px] font-bold text-emerald-400">{memory?.indexStatus || 'HEALTHY'}</span>
              </div>
              <p className="text-xs text-slate-400">Stores {memory?.vectorCount || 42} vectors with {memory?.dimension || 1536}-dim embeddings.</p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Similarity: Cosine</span>
                <span>Synced</span>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Discovered Topics List */}
        {activeTab === 'TOPICS' && (
          <div className="space-y-3">
            {topics.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{t.topic}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300">
                      {t.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Citations: {t.sourceVolume}</span>
                    <span>Velocity: <span className="text-emerald-400 font-bold">{t.velocityGrowth}</span></span>
                    <span>Keywords: {t.keywords.join(', ')}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg">
                  Scored
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Execution Logs */}
        {activeTab === 'LOGS' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2 mb-3 text-slate-400 pb-2 border-b border-slate-800">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Autonomous AI Execution Terminal Output</span>
            </div>
            {lastJobLogs.length > 0 ? (
              <div className="space-y-1">
                {lastJobLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-purple-400">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No manual triggers in this session yet. Click "Trigger Autonomous AI Cycle" above to observe live steps.</p>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
