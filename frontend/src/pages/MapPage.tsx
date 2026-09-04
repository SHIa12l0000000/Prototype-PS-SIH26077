import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useApp } from '../context/AppContext';
import { Layers, MapPin, Maximize2, Crosshair } from 'lucide-react';

export const MapPage: React.FC = () => {
  const { selectedLocation, riskPrediction, weather } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [activeLayer, setActiveLayer] = useState<'risk' | 'radar' | 'satellite' | 'terrain' | 'admin'>('risk');
  const MAPTILER_KEY = '1GQzgEX7j1lxGfoYh4hq';

  const getMapStyle = (layer: string) => {
    switch (layer) {
      case 'satellite': return `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`;
      case 'terrain':   return `https://api.maptiler.com/maps/topo-v2/style.json?key=${MAPTILER_KEY}`;
      case 'radar':     return `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`;
      case 'admin':     return `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`;
      default:          return `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapStyle(activeLayer),
        center: [selectedLocation.longitude, selectedLocation.latitude],
        zoom: 10
      });

      const markerNode = document.createElement('div');
      markerNode.innerHTML = `<div class="relative flex items-center justify-center w-5 h-5">
        <span class="absolute w-5 h-5 bg-[#2874f0]/30 rounded-full animate-ping"></span>
        <span class="w-3 h-3 bg-[#2874f0] border-2 border-white rounded-full shadow-md"></span>
      </div>`;

      new maplibregl.Marker({ element: markerNode })
        .setLngLat([selectedLocation.longitude, selectedLocation.latitude])
        .addTo(map);

      mapRef.current = map;

      return () => {
        map.remove();
      };
    } catch (err) {
      console.warn('Could not initialize map canvas in MapPage:', err);
    }
  }, [selectedLocation, activeLayer]);

  return (
    <div className="space-y-3 h-[calc(100vh-90px)] flex flex-col font-sans">
      {/* Top Map Layer Controls */}
      <div className="skyshield-card p-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 font-bold text-[#123a5a]">
          <Layers className="w-4 h-4 text-[#2d74da]" />
          <span>MAP LAYERS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-medium">
          {[
            { id: 'risk', label: 'RISK OVERLAY' },
            { id: 'radar', label: 'DOPPLER RADAR' },
            { id: 'satellite', label: 'SATELLITE' },
            { id: 'terrain', label: 'TERRAIN' },
            { id: 'admin', label: 'BOUNDARIES' }
          ].map(layer => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id as any)}
              className={`px-3 py-1 rounded border transition-colors ${
                activeLayer === layer.id
                  ? 'bg-[#2d74da] text-white border-[#2d74da] font-semibold'
                  : 'bg-[#f4f6f8] text-[#66717d] border-[#dde3e8] hover:text-[#17212b]'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container: Map (Left) + Risk Analysis Panel (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Map View (Occupies ~65% width) */}
        <div className="lg:col-span-2 skyshield-card p-2 relative overflow-hidden flex flex-col justify-between">
          <div ref={mapContainerRef} className="w-full h-full rounded border border-[#dde3e8]" />

          {/* Bottom GIS Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur border border-[#dde3e8] p-2.5 rounded text-xs shadow-sm flex items-center gap-3 font-mono text-[11px]">
            <span className="font-bold text-[#66717d]">LEGEND:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#2e8b68]"></span> LOW</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#d9912b]"></span> MODERATE</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#d9912b]"></span> ELEVATED</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#d65757]"></span> CRITICAL</span>
          </div>
        </div>

        {/* Right Risk Analysis Panel */}
        <div className="skyshield-card p-4 space-y-4 overflow-y-auto text-xs">
          <div className="border-b border-[#dde3e8] pb-2 space-y-0.5">
            <div className="text-[11px] font-bold text-[#66717d] uppercase tracking-wider">SELECTED LOCATION</div>
            <h2 className="text-base font-bold text-[#123a5a]">{selectedLocation.name}</h2>
            <div className="font-mono text-[11px] text-[#8a949e]">{selectedLocation.latitude.toFixed(2)}°N, {selectedLocation.longitude.toFixed(2)}°E</div>
          </div>

          {/* Current Risk */}
          <div className="space-y-2">
            <div className="font-bold text-[#123a5a] text-xs uppercase">CURRENT RISK SIGNALS</div>
            <div className="space-y-1.5">
              {[
                { label: 'Thunderstorm', score: riskPrediction?.thunderstorm_risk.risk_score ?? 68, sev: riskPrediction?.thunderstorm_risk.severity ?? 'Elevated' },
                { label: 'Cloudburst',   score: riskPrediction?.cloudburst_risk.risk_score   ?? 54, sev: riskPrediction?.cloudburst_risk.severity   ?? 'Moderate' },
                { label: 'Flash Flood',  score: riskPrediction?.flash_flood_risk.risk_score  ?? 41, sev: riskPrediction?.flash_flood_risk.severity   ?? 'Watch' },
              ].map(r => {
                const color = r.score >= 70 ? '#d65757' : r.score >= 50 ? '#d9912b' : '#2e8b68';
                return (
                  <div key={r.label} className="flex items-center justify-between bg-[#f4f6f8] p-2 rounded border border-[#dde3e8]">
                    <span>{r.label}</span>
                    <span className="font-bold" style={{ color }}>{r.score} ({r.sev})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Forecast Steps */}
          <div className="space-y-2">
            <div className="font-bold text-[#123a5a] text-xs uppercase">NOWCAST HORIZON</div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-[#f4f6f8] p-2 rounded border border-[#dde3e8]">
                <div className="text-[10px] text-[#66717d]">+2 HOURS</div>
                <div className="font-bold text-[#d9912b]">72</div>
              </div>
              <div className="bg-[#f4f6f8] p-2 rounded border border-[#dde3e8]">
                <div className="text-[10px] text-[#66717d]">+4 HOURS</div>
                <div className="font-bold text-[#d9912b]">65</div>
              </div>
              <div className="bg-[#f4f6f8] p-2 rounded border border-[#dde3e8]">
                <div className="text-[10px] text-[#66717d]">+6 HOURS</div>
                <div className="font-bold text-[#2e8b68]">52</div>
              </div>
            </div>
          </div>

          {/* Meteorological Triggers */}
          <div className="space-y-2">
            <div className="font-bold text-[#123a5a] text-xs uppercase">METEOROLOGICAL TRIGGERS</div>
            <div className="space-y-1 bg-[#f4f6f8] p-2.5 rounded border border-[#dde3e8] text-[11px]">
              <div className="flex items-center justify-between"><span>CAPE:</span> <span className="font-bold text-[#17212b]">1,420 J/kg</span></div>
              <div className="flex items-center justify-between"><span>CIN:</span> <span className="font-bold text-[#17212b]">−38 J/kg</span></div>
              <div className="flex items-center justify-between"><span>IWV:</span> <span className="font-bold text-[#17212b]">46.8 kg/m²</span></div>
              <div className="flex items-center justify-between"><span>CTT Trend:</span> <span className="font-bold text-[#d65757]">−4.2 °C/h</span></div>
              <div className="flex items-center justify-between"><span>Rain Rate:</span> <span className="font-bold text-[#2d74da]">12.8 mm/h</span></div>
              <div className="flex items-center justify-between"><span>Wind Shear:</span> <span className="font-bold text-[#17212b]">28 kts</span></div>
              <div className="flex items-center justify-between"><span>Runoff:</span> <span className="font-bold text-[#d9912b]">0.61</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
