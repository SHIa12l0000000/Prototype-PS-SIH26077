import React, { useState } from 'react';
import {
  Bot,
  Play,
  Database,
  Sparkles,
  Terminal,
  CheckCircle2,
  Layers,
  Cpu,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { AutonomousStatus as AutonomousStatusType } from '../types';
import { triggerAutonomousJob } from '../services/api';

interface AutonomousStatusProps {
  status: AutonomousStatusType | null;
  onJobExecuted: () => Promise<void> | void;
}

export const AutonomousStatus: React.FC<AutonomousStatusProps> = ({
  status,
  onJobExecuted,
}) => {
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] =
    useState<'SERVICES' | 'TOPICS' | 'LOGS'>('SERVICES');

  const [lastJobLogs, setLastJobLogs] = useState<string[]>([]);
  const [triggerMessage, setTriggerMessage] = useState('');
  const [triggerError, setTriggerError] = useState('');

  const handleTriggerWorkflow = async () => {
    if (running) return;

    try {
      setRunning(true);
      setTriggerMessage('');
      setTriggerError('');

      const res = await triggerAutonomousJob();

      if (res.job?.logs) {
        setLastJobLogs(res.job.logs);
      }

      await onJobExecuted();

      if (res.success) {
        setTriggerMessage(
          'Autonomous cycle completed. Discovery data refreshed.'
        );
        setActiveTab('LOGS');
      } else {
        setTriggerError(
          res.message || 'Autonomous cycle completed with an unknown result.'
        );
        setActiveTab('LOGS');
      }
    } catch (err: unknown) {
      console.error('Trigger workflow failed:', err);

      setTriggerError(
        err instanceof Error
          ? err.message
          : 'Autonomous workflow failed.'
      );

      setActiveTab('LOGS');
    } finally {
      setRunning(false);
    }
  };

  const scheduler = status?.scheduler;
  const memory = status?.memory;
  const topics = status?.discoveredTopics || [];
  const latestJob = status?.jobs?.[0];

  const lastDiscoveryTime =
    topics.length > 0 && topics[0]?.discoveredAt
      ? new Date(topics[0].discoveredAt).toLocaleString()
      : 'Not available';

  return (
    <section className="relative overflow-hidden">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-purple-500/10 blur-[80px] pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Bot className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">
                  Autonomous AI Creator Engine
                </h3>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {scheduler?.autoRunEnabled
                    ? 'AUTONOMOUS SCHEDULER ACTIVE'
                    : 'SCHEDULER PAUSED'}
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Autonomous topic discovery, editorial scoring, AI synthesis
                &amp; vector memory indexing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTriggerWorkflow}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}

            <span>
              {running
                ? 'Running Autonomous Cycle...'
                : 'Trigger Autonomous AI Cycle'}
            </span>
          </button>
        </div>

        {/* Trigger Success */}
        {triggerMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{triggerMessage}</span>
          </div>
        )}

        {/* Trigger Error */}
        {triggerError && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{triggerError}</span>
          </div>
        )}

        {/* Discovery Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
              Current Discovery
            </div>

            <div className="text-xl font-bold text-white">
              {topics.length}
            </div>

            <div className="text-[11px] text-slate-400">
              topics discovered
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
              Latest Topic Time
            </div>

            <div className="text-sm font-semibold text-white">
              {lastDiscoveryTime}
            </div>

            <div className="text-[11px] text-slate-400">
              latest discovery
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
              Latest Job
            </div>

            <div className="text-sm font-semibold text-white">
              {latestJob?.status || 'No job'}
            </div>

            <div className="text-[11px] text-slate-400">
              {latestJob?.startedAt
                ? new Date(latestJob.startedAt).toLocaleString()
                : 'No execution yet'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('SERVICES')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'SERVICES'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Core AI Services (4)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TOPICS')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'TOPICS'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Discovered Topics ({topics.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'LOGS'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Execution Logs &amp; Vector Memory
          </button>
        </div>

        {/* SERVICES */}
        {activeTab === 'SERVICES' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Topic Discovery */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Topic Discovery
                </span>

                <span className="text-[10px] font-bold text-emerald-400">
                  READY
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Scans configured live RSS feeds for current AI and technology
                topics.
              </p>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Live RSS</span>
                <span>Auto-scan: 15m</span>
              </div>
            </div>

            {/* Editorial Scoring */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Editorial Scoring
                </span>

                <span className="text-[10px] font-bold text-emerald-400">
                  READY
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Evaluates discovered topics for relevance and publishing
                eligibility.
              </p>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Publish ≥ 75</span>
                <span>Weighted scoring</span>
              </div>
            </div>

            {/* AI Content */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  AI Content Gen
                </span>

                <span className="text-[10px] font-bold text-emerald-400">
                  READY
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Generates structured AI technology intelligence from selected
                topics.
              </p>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Format: Markdown</span>
                <span>Auto-publish</span>
              </div>
            </div>

            {/* Vector Memory */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Vector Memory
                </span>

                <span className="text-[10px] font-bold text-emerald-400">
                  {memory?.indexStatus || 'HEALTHY'}
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Stores {memory?.vectorCount ?? 0} vectors with{' '}
                {memory?.dimension ?? 1536}-dim embeddings.
              </p>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Similarity: Cosine</span>
                <span>Synced</span>
              </div>
            </div>
          </div>
        )}

        {/* TOPICS */}
        {activeTab === 'TOPICS' && (
          <div className="space-y-3">
            {topics.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-8 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-slate-600" />

                <p className="text-sm text-slate-400">
                  No topics discovered yet.
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Trigger an autonomous cycle to scan the configured feeds.
                </p>
              </div>
            ) : (
              topics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-white">
                        {topic.topic}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300">
                        {topic.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                      <span>
                        Source signal: {topic.sourceVolume}
                      </span>

                      <span>
                        Velocity:{' '}
                        <span className="text-emerald-400 font-bold">
                          {topic.velocityGrowth}
                        </span>
                      </span>

                      {topic.discoveredAt && (
                        <span>
                          Discovered:{' '}
                          {new Date(topic.discoveredAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500">
                      Keywords:{' '}
                      {topic.keywords?.length
                        ? topic.keywords.join(', ')
                        : 'None'}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg whitespace-nowrap">
                    Discovered
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* LOGS */}
        {activeTab === 'LOGS' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2 mb-3 text-slate-400 pb-2 border-b border-slate-800">
              <Terminal className="w-4 h-4 text-purple-400" />

              <span>Autonomous AI Execution Terminal Output</span>
            </div>

            {lastJobLogs.length > 0 ? (
              <div className="space-y-1">
                {lastJobLogs.map((log, index) => (
                  <div
                    key={`${log}-${index}`}
                    className="flex items-start gap-2 text-slate-300"
                  >
                    <span className="text-purple-400">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">
                No manual triggers in this session yet. Click "Trigger
                Autonomous AI Cycle" to observe the workflow.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};