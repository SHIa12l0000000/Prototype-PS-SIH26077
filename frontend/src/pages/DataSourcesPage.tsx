import React from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';

interface DataSource {
  name: string;
  type: string;
  status: 'Connected' | 'Integration Ready' | 'Pending Auth';
  lastUpdate: string;
  resolution: string;
  coverage: string;
  note?: string;
  link?: string;
}

export const DataSourcesPage: React.FC = () => {
  const sources: DataSource[] = [
    {
      name: "Tomorrow.io Realtime & Nowcast API",
      type: "0–6h Hyper-Local Precipitation & Convection",
      status: "Connected",
      lastUpdate: "Real-time Telemetry",
      resolution: "1 km High-Resolution Grid",
      coverage: "Pan-India & Global",
      link: "https://www.tomorrow.io",
    },
    {
      name: "MapTiler Cloud GIS API",
      type: "Satellite Hybrid & 3D Topo Terrain Basemap",
      status: "Connected",
      lastUpdate: "Live Vector & Raster Tiles",
      resolution: "Up to 30 cm Satellite / 30 m DEM",
      coverage: "Global / Indian Subcontinent",
      link: "https://www.maptiler.com",
    },
    {
      name: "OpenWeatherMap Live Telemetry",
      type: "Surface Meteorological Observations",
      status: "Connected",
      lastUpdate: "Real-time Sync",
      resolution: "Point & Station Observations",
      coverage: "Global / India Grid",
      link: "https://openweathermap.org",
    },
    {
      name: "Twilio Emergency SMS Gateway",
      type: "Early Warning Telephony & SMS Dispatch",
      status: "Connected",
      lastUpdate: "Active · +17372508034",
      resolution: "Carrier GSM/LTE Delivery",
      coverage: "+91 9601121603 (India)",
      link: "https://www.twilio.com",
    },
    {
      name: "Open-Meteo Reanalysis Telemetry",
      type: "CAPE, CIN, IWV, IMDAA-equivalent Atmospheric Grids",
      status: "Connected",
      lastUpdate: "Hourly ERA5/IFS Sync",
      resolution: "0.1° (~11 km) — IMDAA-Class Quality",
      coverage: "Global / Pan-India",
      note: "Equivalent quality to NCMRWF IMDAA reanalysis. Free & open access.",
      link: "https://open-meteo.com",
    },
    {
      name: "RainViewer Doppler Radar Mosaic",
      type: "Real-time Radar Reflectivity Composite",
      status: "Connected",
      lastUpdate: "10-Minute Tile Refresh",
      resolution: "1 km Tile Grid",
      coverage: "Global Radar Domain",
      link: "https://www.rainviewer.com",
    },
    {
      name: "NASA GIBS / EOSDIS Satellite Imagery",
      type: "MODIS True Colour, Thermal IR, Water Vapour, GPM Rainfall",
      status: "Connected",
      lastUpdate: "Daily / 3-Hour Composite",
      resolution: "250 m – 5 km (MODIS / GPM IMERG)",
      coverage: "Indian Ocean & Subcontinent",
      note: "Free NASA open-data feed. Equivalent to INSAT-3D/MOSDAC optical & IR channels. No API key required.",
      link: "https://nasa.github.io/gibs/",
    },
    {
      name: "MOSDAC / INSAT-3D (ISRO SAC)",
      type: "Geostationary Imagery — WV / CTT / Rainfall",
      status: "Pending Auth",
      lastUpdate: "mdapi Client Configured",
      resolution: "4 km Channel Grid",
      coverage: "Indian Ocean & Subcontinent",
      note: "Requires institutional registration at mosdac.gov.in. NASA GIBS feed is active as equivalent substitute.",
      link: "https://mosdac.gov.in",
    },
    {
      name: "NCMRWF IMDAA Reanalysis (MoES)",
      type: "High-Resolution Atmospheric Reanalysis Grids",
      status: "Pending Auth",
      lastUpdate: "OPeNDAP NetCDF Pipeline Configured",
      resolution: "12 km Grid",
      coverage: "Indian Subcontinent Domain",
      note: "Requires NCMRWF institutional access. Open-Meteo ERA5 feed is active as equivalent substitute.",
      link: "https://ncmrwf.gov.in",
    },
  ];

  const connected = sources.filter(s => s.status === 'Connected').length;
  const pending   = sources.filter(s => s.status === 'Pending Auth').length;

  return (
    <div className="space-y-4 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#878787]">
        <span>SKYSHIELD</span><ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-[#212121]">Data Sources</span>
      </div>

      {/* Header */}
      <div className="sz-card sz-card-body flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#212121]">Data Source Monitoring & Registry</h1>
          <p className="text-xs text-[#878787] mt-0.5">
            Provenance, integration status, and resolution telemetry across all meteorological and GIS data streams.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="text-[10px] font-mono bg-[#eefaf0] border border-[#388e3c] text-[#388e3c] px-3 py-1.5 rounded font-bold">
            ✓ {connected} CONNECTED
          </div>
          <div className="text-[10px] font-mono bg-[#fff8e1] border border-[#ff9f00] text-[#856404] px-3 py-1.5 rounded font-bold">
            ○ {pending} PENDING AUTH
          </div>
        </div>
      </div>

      {/* Info box about MOSDAC/IMDAA */}
      <div className="sz-card sz-card-body bg-[#fff8e1] border-[#ff9f00] text-xs">
        <div className="font-bold text-[#856404] mb-1">ℹ MOSDAC & IMDAA — Institutional Access Required</div>
        <p className="text-[#4a3800] leading-relaxed">
          <strong>MOSDAC</strong> (mosdac.gov.in) requires registration with ISRO/SAC. <strong>IMDAA</strong> (NCMRWF) requires institutional affiliation with MoES.
          Both are configured with pipeline connectors ready to activate on approval. <br />
          <strong>Active substitutes running now:</strong>&nbsp;
          <span className="text-[#388e3c] font-bold">NASA GIBS (MODIS/GPM)</span> replaces INSAT-3D imagery, and&nbsp;
          <span className="text-[#388e3c] font-bold">Open-Meteo ERA5</span> replaces IMDAA reanalysis — both are free, live, and equivalent in quality.
        </p>
      </div>

      {/* Table */}
      <div className="sz-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="font-bold text-sm text-[#212121]">Data Stream Registry</span>
          <span className="text-[10px] font-mono text-[#878787] bg-[#f7f7f7] border border-gray-200 px-2 py-0.5 rounded">
            {sources.length} SOURCES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="sz-table">
            <thead>
              <tr>
                <th>DATA SOURCE</th>
                <th>DATA TYPE</th>
                <th>STATUS</th>
                <th>LAST UPDATE</th>
                <th>RESOLUTION</th>
                <th>COVERAGE</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((src, idx) => (
                <tr key={idx} className={src.status === 'Pending Auth' ? 'opacity-70' : ''}>
                  <td>
                    <div className="font-bold text-[#212121] flex items-center gap-1">
                      {src.name}
                      {src.link && (
                        <a href={src.link} target="_blank" rel="noreferrer" className="text-[#2874f0]" title="Open docs">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {src.note && (
                      <div className="text-[10px] text-[#878787] mt-0.5 max-w-xs leading-relaxed">{src.note}</div>
                    )}
                  </td>
                  <td className="text-[#878787]">{src.type}</td>
                  <td>
                    {src.status === 'Connected' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#388e3c] bg-[#eefaf0] border border-[#388e3c] px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#388e3c]"></span> CONNECTED
                      </span>
                    )}
                    {src.status === 'Pending Auth' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#856404] bg-[#fff8e1] border border-[#ff9f00] px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f00]"></span> PENDING AUTH
                      </span>
                    )}
                  </td>
                  <td className="font-mono text-xs text-[#878787]">{src.lastUpdate}</td>
                  <td className="font-mono text-xs text-[#878787]">{src.resolution}</td>
                  <td className="text-xs text-[#212121]">{src.coverage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to get MOSDAC / IMDAA access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="sz-card sz-card-body text-xs space-y-2">
          <div className="font-bold text-[#212121]">🛰 How to get MOSDAC API Access</div>
          <ol className="text-[#878787] space-y-1 list-decimal list-inside leading-relaxed">
            <li>Go to <a href="https://mosdac.gov.in" target="_blank" rel="noreferrer" className="text-[#2874f0] font-semibold">mosdac.gov.in</a> → Register with institute email</li>
            <li>Request Data Access → Select INSAT-3D Products (Rainfall, CTT, WV)</li>
            <li>ISRO/SAC approves (typically 2–5 working days)</li>
            <li>Receive API key → Set <code className="bg-[#f7f7f7] px-1 rounded">MOSDAC_API_KEY</code> in <code className="bg-[#f7f7f7] px-1 rounded">config.py</code></li>
          </ol>
          <div className="text-[10px] text-[#878787] bg-[#f7f7f7] p-2 rounded">
            Pipeline connector: <code>backend/app/satellite.py</code> (pre-configured, ready to activate)
          </div>
        </div>

        <div className="sz-card sz-card-body text-xs space-y-2">
          <div className="font-bold text-[#212121]">🌐 How to get IMDAA / NCMRWF Access</div>
          <ol className="text-[#878787] space-y-1 list-decimal list-inside leading-relaxed">
            <li>Go to <a href="https://ncmrwf.gov.in" target="_blank" rel="noreferrer" className="text-[#2874f0] font-semibold">ncmrwf.gov.in</a> → Contact Data Services</li>
            <li>Submit request via institutional email with project details (SIH 26077)</li>
            <li>NCMRWF grants OPeNDAP/FTP access to IMDAA NetCDF grids</li>
            <li>Set <code className="bg-[#f7f7f7] px-1 rounded">IMDAA_OPENDAP_URL</code> in <code className="bg-[#f7f7f7] px-1 rounded">config.py</code></li>
          </ol>
          <div className="text-[10px] text-[#878787] bg-[#f7f7f7] p-2 rounded">
            Pipeline connector: <code>backend/app/reanalysis.py</code> (pre-configured, ready to activate)
          </div>
        </div>
      </div>
    </div>
  );
};
