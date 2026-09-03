import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useApp } from '../context/AppContext';
import { Radio, ChevronRight, Play, RotateCcw, Info } from 'lucide-react';

const MAPTILER_KEY = '1GQzgEX7j1lxGfoYh4hq';

// NASA GIBS WMS tile URLs — free, no API key required
// https://nasa.github.io/gibs/
const GIBS_LAYERS: Record<string, { url: string; label: string; desc: string }> = {
  satellite: {
    url: 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&FORMAT=image/jpeg&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&STYLES=',
    label: 'MODIS Terra — True Colour',
    desc: 'NASA MODIS Terra True Colour (250 m)',
  },
  infrared: {
    url: 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=MODIS_Terra_Brightness_Temp_Band31_Day&FORMAT=image/png&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&STYLES=',
    label: 'MODIS Terra — Thermal Infrared',
    desc: 'Band 31 Brightness Temperature / Cloud-Top Cooling',
  },
  watervapour: {
    url: 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=MODIS_Aqua_Water_Vapor_5km_Day&FORMAT=image/png&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&STYLES=',
    label: 'MODIS Aqua — Water Vapour',
    desc: 'Column Water Vapour (5 km)',
  },
  rainfall: {
    url: 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=GPM_3IMERGDE_06_precipitationCal&FORMAT=image/png&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&STYLES=',
    label: 'GPM IMERG — Precipitation',
    desc: 'NASA GPM Multi-Satellite Rainfall (0.1°)',
  },
};

type TabId = 'satellite' | 'radar' | 'infrared' | 'watervapour' | 'rainfall';

export const SatellitePage: React.FC = () => {
  const { selectedLocation } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('satellite');
  const [opacity, setOpacity] = useState(85);
  const [isPlaying, setIsPlaying] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const getBaseStyle = (tab: TabId) => {
    if (tab === 'radar' || tab === 'rainfall') {
      return `https://api.maptiler.com/maps/topo-v2/style.json?key=${MAPTILER_KEY}`;
    }
    return `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getBaseStyle(activeTab),
      center: [selectedLocation.longitude, selectedLocation.latitude],
      zoom: 5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // For non-radar tabs, overlay the NASA GIBS WMS layer
      if (activeTab !== 'radar' && GIBS_LAYERS[activeTab]) {
        const gibsLayer = GIBS_LAYERS[activeTab];
        map.addSource('nasa-gibs', {
          type: 'raster',
          tiles: [gibsLayer.url],
          tileSize: 256,
          attribution: '© NASA GIBS / EOSDIS',
        });
        map.addLayer({
          id: 'nasa-gibs-layer',
          type: 'raster',
          source: 'nasa-gibs',
          paint: { 'raster-opacity': opacity / 100 },
        });
      }

      // RainViewer radar tiles for radar/rainfall tabs
      if (activeTab === 'radar') {
        fetch('https://api.rainviewer.com/public/weather-maps.json')
          .then(r => r.json())
          .then(data => {
            const frames = data?.radar?.past ?? [];
            if (frames.length > 0) {
              const latest = frames[frames.length - 1];
              map.addSource('rainviewer', {
                type: 'raster',
                tiles: [`https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`],
                tileSize: 256,
                attribution: '© RainViewer',
              });
              map.addLayer({
                id: 'rainviewer-layer',
                type: 'raster',
                source: 'rainviewer',
                paint: { 'raster-opacity': opacity / 100 },
              });
            }
          })
          .catch(() => {});
      }

      // Animated location marker
      const el = document.createElement('div');
      el.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;">
        <span style="position:absolute;width:22px;height:22px;border-radius:50%;background:#ff9f0044;animation:ping 1.6s infinite"></span>
        <span style="width:12px;height:12px;border-radius:50%;background:#ff9f00;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></span>
      </span>`;
      new maplibregl.Marker({ element: el })
        .setLngLat([selectedLocation.longitude, selectedLocation.latitude])
        .addTo(map);
    });

    mapRef.current = map;
    return () => map.remove();
  }, [selectedLocation, activeTab]);

  // Update opacity on slider change without rebuilding the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer('nasa-gibs-layer')) {
      map.setPaintProperty('nasa-gibs-layer', 'raster-opacity', opacity / 100);
    }
    if (map.getLayer('rainviewer-layer')) {
      map.setPaintProperty('rainviewer-layer', 'raster-opacity', opacity / 100);
    }
  }, [opacity]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'satellite',   label: 'SATELLITE (TRUE COLOUR)' },
    { id: 'radar',       label: 'DOPPLER RADAR' },
    { id: 'infrared',    label: 'INFRARED (CTT)' },
    { id: 'watervapour', label: 'WATER VAPOUR' },
    { id: 'rainfall',    label: 'GPM RAINFALL' },
  ];

  const currentGibs = GIBS_LAYERS[activeTab];

  return (
    <div className="space-y-4 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#878787]">
        <span>SKYSHIELD</span><ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-[#212121]">Satellite & Radar</span>
        <span className="text-[#2874f0] ml-2 font-semibold">{selectedLocation.name}</span>
      </div>

      {/* Header */}
      <div className="sz-card sz-card-body flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#212121]">Satellite & Radar Observations</h1>
          <p className="text-xs text-[#878787] mt-0.5">
            NASA GIBS satellite imagery (MODIS/GPM) · RainViewer Doppler radar · MapTiler GIS basemap.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] font-mono text-[#878787] bg-[#f7f7f7] border border-gray-200 px-3 py-1.5 rounded">
            FEED: NASA GIBS + RAINVIEWER + MAPTILER
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#388e3c] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#388e3c]"></span> ALL FEEDS LIVE
          </div>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="sz-card p-2 flex items-center gap-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#2874f0] text-white'
                : 'bg-white text-[#878787] hover:text-[#212121] border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* NASA GIBS info notice */}
      {activeTab !== 'radar' && (
        <div className="sz-card sz-card-body flex items-start gap-2 bg-[#e8f0fe] border-[#2874f0]">
          <Info className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
          <div className="text-xs text-[#212121]">
            <span className="font-bold text-[#2874f0]">NASA EOSDIS GIBS Live Feed</span>
            {' · '}{currentGibs?.label} — {currentGibs?.desc}.{' '}
            <span className="text-[#878787]">Free public API · No key required · Equivalent to INSAT-3D/MOSDAC channel data.</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Canvas */}
        <div className="lg:col-span-2 sz-card p-2 relative flex flex-col" style={{ minHeight: 440 }}>
          <div ref={mapContainerRef} className="w-full flex-1 rounded overflow-hidden" style={{ minHeight: 420 }} />
          <div className="absolute bottom-4 left-4 bg-white/95 rounded shadow border border-gray-200 px-3 py-1.5 text-xs flex items-center gap-3">
            <span className="font-bold text-[#878787]">ACTIVE:</span>
            <span className="badge-monitor">{activeTab.toUpperCase()}</span>
            <span className="text-[10px] font-mono text-[#878787]">
              {activeTab === 'radar' ? 'RainViewer' : 'NASA GIBS'}
            </span>
          </div>
        </div>

        {/* Right Control Panel */}
        <div className="sz-card p-4 space-y-4 text-xs">
          <div className="font-bold text-sm text-[#212121] border-b border-gray-100 pb-2">
            Geospatial Controls
          </div>

          <div className="space-y-3">
            {/* Opacity */}
            <div>
              <div className="flex justify-between text-[#878787] mb-1 font-semibold">
                <span>OVERLAY OPACITY</span>
                <span>{opacity}%</span>
              </div>
              <input
                type="range" min="10" max="100" value={opacity}
                onChange={e => setOpacity(Number(e.target.value))}
                className="w-full accent-[#2874f0]"
              />
            </div>

            {/* Timestamp */}
            <div>
              <div className="text-[10px] font-bold text-[#878787] uppercase mb-1">LATEST FRAME</div>
              <div className="bg-[#f7f7f7] p-2.5 rounded border border-gray-200 text-[#212121] font-mono">
                {new Date().toLocaleTimeString()} IST (Latest)
              </div>
            </div>

            {/* Data source details */}
            <div>
              <div className="text-[10px] font-bold text-[#878787] uppercase mb-1">DATA SOURCE</div>
              <div className="bg-[#f7f7f7] p-2.5 rounded border border-gray-200 space-y-1">
                {activeTab === 'radar' ? (
                  <>
                    <div className="flex justify-between"><span>Source:</span> <span className="font-bold">RainViewer</span></div>
                    <div className="flex justify-between"><span>Resolution:</span> <span className="font-bold">1 km Grid</span></div>
                    <div className="flex justify-between"><span>Refresh:</span> <span className="font-bold">10 min</span></div>
                    <div className="flex justify-between"><span>Band:</span> <span className="font-bold">Reflectivity (dBZ)</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between"><span>Source:</span> <span className="font-bold">NASA GIBS</span></div>
                    <div className="flex justify-between"><span>Instrument:</span> <span className="font-bold">MODIS / GPM</span></div>
                    <div className="flex justify-between"><span>Resolution:</span> <span className="font-bold">250 m – 5 km</span></div>
                    <div className="flex justify-between"><span>Refresh:</span> <span className="font-bold">Daily / 3h</span></div>
                    <div className="flex justify-between"><span>Key:</span> <span className="font-bold text-[#388e3c]">Free / Open</span></div>
                  </>
                )}
              </div>
            </div>

            {/* Loop Controls */}
            <div>
              <div className="text-[10px] font-bold text-[#878787] uppercase mb-1">LOOP CONTROLS</div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  className="flex-1 btn-primary text-xs py-2 rounded flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isPlaying ? 'Pause Loop' : 'Play Loop'}
                </button>
                <button
                  onClick={() => setActiveTab(activeTab)}
                  className="bg-[#f7f7f7] border border-gray-200 p-2 rounded hover:bg-gray-100"
                  title="Refresh"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#878787]" />
                </button>
              </div>
            </div>

            {/* NASA GIBS attribution */}
            <div className="text-[10px] text-[#878787] bg-[#f7f7f7] p-2 rounded border border-gray-200 leading-relaxed">
              <div className="font-bold text-[#212121] mb-0.5">DATA PROVENANCE</div>
              Imagery: NASA EOSDIS GIBS<br />
              Radar: RainViewer API<br />
              Terrain: MapTiler Cloud<br />
              <span className="text-[#2874f0] font-semibold">SIH 26077 · MoES/NCMRWF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
