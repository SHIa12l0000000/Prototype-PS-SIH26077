import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useApp } from '../context/AppContext';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, Maximize2,
  MapPin, ChevronRight, AlertTriangle, Zap, Droplets, Wind
} from 'lucide-react';

/* ── Small star renderer ── */
const Stars: React.FC<{ score: number }> = ({ score }) => {
  const filled = Math.round((score / 100) * 5);
  return (
    <span className="text-[#f0c14b] text-sm">
      {'★'.repeat(filled)}{'☆'.repeat(5 - filled)}
    </span>
  );
};

export const OverviewPage: React.FC = () => {
  const { selectedLocation, riskPrediction, weather, alerts, setCurrentPage } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [mapMode, setMapMode] = useState<'risk' | 'radar'>('risk');

  /* ── MapLibre Init (Defensively wrapped against WebGL / Electron WebView failures) ── */
  useEffect(() => {
    if (!mapRef.current) return;
    try {
      const MAPTILER_KEY = '1GQzgEX7j1lxGfoYh4hq';
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
        center: [selectedLocation.longitude, selectedLocation.latitude],
        zoom: 9
      });
      const el = document.createElement('div');
      el.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;"><span style="position:absolute;width:20px;height:20px;border-radius:50%;background:#2874f033;animation:ping 1.5s infinite"></span><span style="width:10px;height:10px;border-radius:50%;background:#2874f0;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)"></span></span>`;
      new maplibregl.Marker({ element: el }).setLngLat([selectedLocation.longitude, selectedLocation.latitude]).addTo(map);
      mapInstance.current = map;
      return () => map.remove();
    } catch (err) {
      console.warn('Could not initialize map canvas:', err);
    }
  }, [selectedLocation]);

  const outlookData = [
    { t: '19:30', TS: 58, CB: 42, FF: 35 }, { t: '20:00', TS: 64, CB: 48, FF: 38 },
    { t: '20:30', TS: 68, CB: 54, FF: 41 }, { t: '21:00', TS: 72, CB: 56, FF: 45 },
    { t: '21:30', TS: 65, CB: 50, FF: 44 }, { t: '22:00', TS: 52, CB: 40, FF: 38 },
  ];

  /* ── Dynamic Hazard Card configuration from live API / Risk Engine ── */
  const tsScore = riskPrediction?.thunderstorm_risk?.risk_score ?? 68;
  const cbScore = riskPrediction?.cloudburst_risk?.risk_score ?? 54;
  const ffScore = riskPrediction?.flash_flood_risk?.risk_score ?? 41;

  const tsSev = riskPrediction?.thunderstorm_risk?.severity ?? 'ELEVATED';
  const cbSev = riskPrediction?.cloudburst_risk?.severity ?? 'MODERATE';
  const ffSev = riskPrediction?.flash_flood_risk?.severity ?? 'WATCH';

  const tsTrend = riskPrediction?.thunderstorm_risk?.trend === 'INCREASING' ? 'up' : 'stable';
  const cbTrend = riskPrediction?.cloudburst_risk?.trend === 'INCREASING' ? 'up' : 'stable';
  const ffTrend = riskPrediction?.flash_flood_risk?.trend === 'INCREASING' ? 'up' : 'stable';

  const hazards = [
    { name: 'Thunderstorm', score: tsScore, level: tsSev, icon: Zap,         color: '#ff9f00', bg: '#fff8e1', trend: tsTrend },
    { name: 'Cloudburst',   score: cbScore, level: cbSev, icon: Droplets,    color: '#2874f0', bg: '#e8f0fe', trend: cbTrend },
    { name: 'Flash Flood',  score: ffScore, level: ffSev, icon: AlertTriangle,color: '#ff6161', bg: '#ffeaea', trend: ffTrend },
  ];

  const atmoParams = [
    { label: 'CAPE',       value: '1,420', unit: 'J/kg',  note: 'Elevated',    color: '#ff9f00' },
    { label: 'CIN',        value: '−38',   unit: 'J/kg',  note: 'Low Inhibition', color: '#388e3c' },
    { label: 'IWV',        value: '46.8',  unit: 'kg/m²', note: 'Moist Column', color: '#2874f0' },
    { label: 'Cloud Cover',value: String(weather?.current?.cloud_cover_pct ?? 92), unit: '%', note: 'Dense Overcast', color: '#878787' },
    { label: 'Wind Gust',  value: String(weather?.current?.wind_gusts_kmh ?? 38), unit: 'km/h', note: 'Gusty Surface', color: '#ff9f00' },
    { label: 'Rain Intensity', value: String(weather?.current?.precipitation_mm ?? 12.8), unit: 'mm/h', note: (weather?.current?.precipitation_mm ?? 0) > 0 ? 'Active Rain' : 'Normal', color: '#ff6161' },
  ];

  return (
    <div className="space-y-4 pb-6">

      {/* ── PAGE BREADCRUMB (Amazon-style) ── */}
      <div className="flex items-center gap-1.5 text-xs text-[#878787]">
        <span>SKYSHIELD</span>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-[#212121]">Command Center</span>
        <span className="ml-2 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#2874f0]" />
          <span className="text-[#2874f0] font-semibold">{selectedLocation.name}</span>
        </span>
      </div>

      {/* ── ROW 1: Hazard Scorecards (Amazon product-card style) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hazards.map(h => {
          const Icon = h.icon;
          return (
            <div key={h.name} className="product-card">
              {/* Coloured top strip */}
              <div className="h-1" style={{ background: h.color }} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-bold text-[#878787] uppercase tracking-wider mb-1">HAZARD TYPE</div>
                    <h3 className="text-base font-bold text-[#212121]">{h.name}</h3>
                  </div>
                  <div className="p-2 rounded-full" style={{ background: h.bg }}>
                    <Icon className="w-5 h-5" style={{ color: h.color }} />
                  </div>
                </div>

                {/* Score — styled like an e-commerce price */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-[#212121]">{h.score}</span>
                  <span className="text-sm text-[#878787]">/100</span>
                  <span className={`badge-${h.level.toLowerCase()}`}>{h.level}</span>
                </div>

                <Stars score={h.score} />
                <div className="text-xs text-[#878787] mt-1 font-mono">PROTOTYPE RISK SCORE</div>

                <hr className="my-3 border-gray-100" />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#878787]">Signal Trend</span>
                  <span className={`flex items-center gap-1 font-semibold ${h.trend === 'up' ? 'text-[#ff6161]' : 'text-[#388e3c]'}`}>
                    {h.trend === 'up'
                      ? <><TrendingUp className="w-3.5 h-3.5" /> Increasing</>
                      : <><Minus className="w-3.5 h-3.5" /> Stable</>}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ROW 2: Map (65%) + Atmosphere Panel (35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Map Block */}
        <div className="lg:col-span-2 sz-card">
          {/* Card Header — Amazon listing header style */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <div className="section-title text-base">HYPER-LOCAL RISK MAP</div>
              <div className="text-xs text-[#878787] mt-0.5">2–6 hour severe weather signal · 1 km target grid</div>
            </div>
            <div className="flex items-center gap-1 bg-[#f7f7f7] rounded p-1 border border-gray-200">
              {['risk', 'radar'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode as any)}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${
                    mapMode === mode ? 'bg-[#2874f0] text-white' : 'text-[#878787] hover:text-[#212121]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Map Canvas */}
          <div className="relative" style={{ height: 340 }}>
            <div ref={mapRef} className="w-full h-full" />

            {/* Legend pill */}
            <div className="absolute bottom-3 left-3 bg-white/95 rounded shadow border border-gray-200 px-3 py-1.5 text-xs flex items-center gap-3">
              <span className="font-bold text-[#878787]">LEGEND:</span>
              {[['#388e3c','LOW'],['#ff9f00','MODERATE'],['#ff9f00','ELEVATED'],['#ff6161','CRITICAL']].map(([c,l]) => (
                <span key={l} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }}></span>
                  <span className="text-[#212121] font-medium">{l}</span>
                </span>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage('map')}
              className="absolute top-3 right-3 bg-white hover:bg-[#f7f7f7] border border-gray-200 rounded p-1.5 shadow"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-[#212121]" />
            </button>
          </div>
        </div>

        {/* Atmosphere Parameter Panel — like Amazon product specs table */}
        <div className="sz-card">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="section-title text-base">WEATHER INTELLIGENCE</div>
            <div className="text-xs text-[#878787]">Atmospheric parameters</div>
          </div>

          <div className="p-3 grid grid-cols-2 gap-2">
            {atmoParams.map(p => (
              <div key={p.label} className="bg-[#f7f7f7] rounded p-2.5 border border-gray-100">
                <div className="text-[10px] text-[#878787] font-bold uppercase">{p.label}</div>
                <div className="text-lg font-bold text-[#212121] mt-0.5">
                  {p.value}
                  {p.unit && <span className="text-xs font-normal text-[#878787] ml-1">{p.unit}</span>}
                </div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: p.color }}>{p.note}</div>
              </div>
            ))}
          </div>

          <div className="px-3 pb-3">
            <button
              onClick={() => setCurrentPage('weather')}
              className="w-full btn-secondary text-sm py-2 rounded"
            >
              Full Atmospheric Report →
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Outlook Chart + Alerts Table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Outlook Chart */}
        <div className="sz-card">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="section-title text-base">2–6 HOUR OUTLOOK</div>
              <div className="text-xs text-[#878787]">Signal intensity forecast (0–100)</div>
            </div>
            <span className="text-[10px] font-mono text-[#878787] bg-[#f7f7f7] border border-gray-200 px-2 py-0.5 rounded">NOWCAST</span>
          </div>

          <div className="p-4" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={outlookData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="t" stroke="#878787" fontSize={11} />
                <YAxis stroke="#878787" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 4, fontSize: 12 }} />
                <Line type="monotone" dataKey="TS" stroke="#ff9f00" strokeWidth={2} dot={{ r: 3 }} name="Thunderstorm" />
                <Line type="monotone" dataKey="CB" stroke="#2874f0" strokeWidth={2} dot={{ r: 3 }} name="Cloudburst" />
                <Line type="monotone" dataKey="FF" stroke="#ff6161" strokeWidth={2} dot={{ r: 3 }} name="Flash Flood" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Table — Amazon order list style */}
        <div className="sz-card">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="section-title text-base">PRIORITY ALERTS</div>
              <div className="text-xs text-[#878787]">Active dispatch queue</div>
            </div>
            <button onClick={() => setCurrentPage('alerts')} className="text-xs font-semibold text-[#2874f0] hover:underline">
              View All →
            </button>
          </div>

          <table className="sz-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>HAZARD</th>
                <th>LOCATION</th>
                <th>SEVERITY</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '19:38', hazard: 'Thunderstorm', loc: 'East Delhi', sev: 'ELEVATED' },
                { time: '19:26', hazard: 'Cloudburst',   loc: 'Ghaziabad', sev: 'WATCH' },
                { time: '19:11', hazard: 'Flash Flood',  loc: 'Noida',     sev: 'MONITOR' },
              ].map((r, i) => (
                <tr key={i}>
                  <td className="font-mono text-[#878787]">{r.time}</td>
                  <td className="font-semibold text-[#212121]">{r.hazard}</td>
                  <td className="text-[#878787]">{r.loc}</td>
                  <td><span className={`badge-${r.sev.toLowerCase()}`}>{r.sev}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ROW 4: AI Analysis — Amazon "Product Features" box style ── */}
      <div className="sz-card">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="section-title text-base">AI ANALYSIS — EXPLAINABLE TRIGGERS</div>
            <div className="text-xs text-[#878787]">Meteorological evidence driving the nowcast signal</div>
          </div>
          <button onClick={() => setCurrentPage('xai')} className="text-xs font-semibold text-[#2874f0] hover:underline">
            Full Explainability →
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { rank: '01', title: 'RAPID CLOUD-TOP COOLING', evidence: 'CTT trend indicates strengthening convection.', level: 'CRITICAL' },
            { rank: '02', title: 'HIGH MOISTURE AVAILABILITY', evidence: 'IWV 46.8 kg/m² supports rapid rain rate.', level: 'ELEVATED' },
            { rank: '03', title: 'STRONG CONVECTIVE POTENTIAL', evidence: 'CAPE 1,420 J/kg with low CIN inhibition.', level: 'ELEVATED' },
            { rank: '04', title: 'INCREASING RUNOFF RESPONSE', evidence: 'Surface runoff signal rising on low terrain.', level: 'WATCH' },
          ].map(f => (
            <div key={f.rank} className="bg-[#f7f7f7] rounded border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#878787]">FACTOR {f.rank}</span>
                <span className={`badge-${f.level.toLowerCase()}`}>{f.level}</span>
              </div>
              <div className="font-bold text-xs text-[#212121] leading-tight">{f.title}</div>
              <p className="text-xs text-[#878787] leading-relaxed">{f.evidence}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer footer — like Amazon's legal note */}
        <div className="px-4 py-2 bg-[#f7f7f7] border-t border-gray-100 text-xs text-[#878787] font-mono">
          ⚠ PROTOTYPE SIGNAL — NOT AN OFFICIAL WARNING. For research and demonstration purposes only. SIH 26077 · MoES / NCMRWF
        </div>
      </div>
    </div>
  );
};
