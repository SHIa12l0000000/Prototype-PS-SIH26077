import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { selectedLocation } = useApp();

  const daily = [
    { day: 'Mon', Thunderstorm: 42, Cloudburst: 30, FlashFlood: 25 },
    { day: 'Tue', Thunderstorm: 55, Cloudburst: 38, FlashFlood: 32 },
    { day: 'Wed', Thunderstorm: 68, Cloudburst: 54, FlashFlood: 41 },
    { day: 'Thu', Thunderstorm: 60, Cloudburst: 46, FlashFlood: 36 },
    { day: 'Fri', Thunderstorm: 48, Cloudburst: 35, FlashFlood: 28 },
    { day: 'Sat', Thunderstorm: 38, Cloudburst: 28, FlashFlood: 22 },
    { day: 'Sun', Thunderstorm: 30, Cloudburst: 20, FlashFlood: 18 },
  ];

  const regional = [
    { region: 'Delhi NCR', Score: 68 }, { region: 'Wayanad', Score: 88 },
    { region: 'Kedarnath', Score: 76 }, { region: 'Cherrapunji', Score: 84 },
    { region: 'Mumbai', Score: 72 },
  ];

  const stats = [
    { label: 'Nowcasts Run', value: '1,248', note: '7-day total', color: '#2874f0' },
    { label: 'Alerts Dispatched', value: '47', note: 'This week', color: '#ff6161' },
    { label: 'Avg Signal Score', value: '58.4', note: 'All hazards', color: '#ff9f00' },
    { label: 'Locations Covered', value: '23', note: 'Active nodes', color: '#388e3c' },
  ];

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-1.5 text-xs text-[#878787]">
        <span>SKYSHIELD</span><ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-[#212121]">Analytics</span>
      </div>

      <div className="sz-card sz-card-body flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#212121]">Historical Analytics & Model Performance</h1>
          <p className="text-xs text-[#878787] mt-0.5">Hazard frequency, model score trends, and regional comparisons · 7-Day window</p>
        </div>
      </div>

      {/* Summary Stats — Amazon-style metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="sz-card p-4 space-y-1">
            <div className="text-xs text-[#878787] font-medium">{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[#878787]">{s.note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="sz-card">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="font-bold text-sm text-[#212121]">Daily Severe Weather Signals</div>
            <span className="text-[10px] font-mono text-[#878787] bg-[#f7f7f7] border border-gray-200 px-2 py-0.5 rounded">7-DAY</span>
          </div>
          <div className="p-4" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#878787" fontSize={11} />
                <YAxis stroke="#878787" fontSize={11} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 4, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Thunderstorm" fill="#ff9f00" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Cloudburst"   fill="#2874f0" radius={[2, 2, 0, 0]} />
                <Bar dataKey="FlashFlood"   fill="#ff6161" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sz-card">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="font-bold text-sm text-[#212121]">Regional Risk Comparison</div>
            <span className="text-[10px] font-mono text-[#878787] bg-[#f7f7f7] border border-gray-200 px-2 py-0.5 rounded">BENCHMARK</span>
          </div>
          <div className="p-4 space-y-2.5">
            {regional.map(r => (
              <div key={r.region}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-[#212121]">{r.region}</span>
                  <span className="font-bold text-[#212121]">{r.Score}/100</span>
                </div>
                <div className="h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${r.Score}%`,
                      background: r.Score >= 80 ? '#ff6161' : r.Score >= 65 ? '#ff9f00' : '#2874f0'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
