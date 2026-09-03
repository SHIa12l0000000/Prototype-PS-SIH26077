import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight } from 'lucide-react';

export const XaiPage: React.FC = () => {
  const { selectedLocation } = useApp();

  const factors = [
    { rank: '01', factor: 'CAPE (Convective Energy)', contribution: 'HIGH', direction: '↑ Increasing', detail: 'CAPE of 1,420 J/kg well above severe threshold of 1,000 J/kg.' },
    { rank: '02', factor: 'IWV (Atmospheric Moisture)', contribution: 'HIGH', direction: '↑ Moisture Transport', detail: 'IWV 46.8 kg/m² supports sustained high rainfall rates.' },
    { rank: '03', factor: 'CIN (Convective Inhibition)', contribution: 'HIGH', direction: '↑ Triggering Convection', detail: 'CIN −38 J/kg — low enough for surface heating to break cap.' },
    { rank: '04', factor: 'Cloud-Top Cooling (CTT)', contribution: 'HIGH', direction: '↑ Rapid Cooling', detail: 'CTT dropping at −4.2°C/h indicating strengthening updraft.' },
    { rank: '05', factor: 'Surface Runoff Response', contribution: 'MODERATE', direction: '↑ Slope Accumulation', detail: 'Runoff index 0.61 on sloped terrain raises flash flood signal.' },
  ];

  const scores = [
    { label: 'Thunderstorm Signal', score: 68, level: 'ELEVATED', color: '#ff9f00' },
    { label: 'Cloudburst Signal',   score: 54, level: 'MODERATE', color: '#2874f0' },
    { label: 'Flash Flood Signal',  score: 41, level: 'WATCH',    color: '#ff6161' },
  ];

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-1.5 text-xs text-[#878787]">
        <span>SKYSHIELD</span><ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-[#212121]">AI Analysis</span>
      </div>

      <div className="sz-card sz-card-body flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#212121]">AI Analysis — Model Explainability</h1>
          <p className="text-xs text-[#878787] mt-0.5">Explainable severe-weather signal assessment · {selectedLocation.name}</p>
        </div>
        <div className="text-[10px] font-mono text-[#878787] bg-[#f7f7f7] border border-gray-200 px-3 py-1.5 rounded">
          MODEL: EXPLAINABLE HEURISTIC ENGINE
        </div>
      </div>

      {/* Score cards — like Amazon "Ratings" summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scores.map(s => (
          <div key={s.label} className="sz-card p-4 space-y-3">
            <div className="text-xs font-bold text-[#878787] uppercase">{s.label}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#212121]">{s.score}</span>
              <span className="text-sm text-[#878787]">/100</span>
            </div>
            {/* Bar */}
            <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${s.score}%`, background: s.color }} />
            </div>
            <span className={`badge-${s.level.toLowerCase()}`}>{s.level}</span>
          </div>
        ))}
      </div>

      {/* Explainability Table — Amazon product comparison table */}
      <div className="sz-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-[#212121]">Meteorological Factor Contribution</div>
            <div className="text-xs text-[#878787]">Explainability matrix — ranked by signal contribution</div>
          </div>
          <span className="text-[10px] font-mono text-[#878787] bg-[#f7f7f7] border border-gray-200 px-2 py-1 rounded">MODEL ATTRIBUTION</span>
        </div>

        <table className="sz-table">
          <thead>
            <tr>
              <th>RANK</th>
              <th>PARAMETER FACTOR</th>
              <th>CONTRIBUTION</th>
              <th>SIGNAL DIRECTION</th>
              <th>DETAIL</th>
            </tr>
          </thead>
          <tbody>
            {factors.map(f => (
              <tr key={f.rank}>
                <td className="font-mono font-bold text-[#2874f0]">{f.rank}</td>
                <td className="font-semibold text-[#212121]">{f.factor}</td>
                <td>
                  <span className={`badge-${f.contribution.toLowerCase()}`}>{f.contribution}</span>
                </td>
                <td className="font-mono font-semibold text-[#2874f0]">{f.direction}</td>
                <td className="text-[#878787] text-xs">{f.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sz-card sz-card-body text-xs font-mono text-[#878787] flex items-center justify-between">
        <span>⚠ PROTOTYPE SIGNAL — NOT AN OFFICIAL WARNING</span>
        <span className="text-[#388e3c] font-bold">● MODEL EVALUATION ACTIVE</span>
      </div>
    </div>
  );
};
