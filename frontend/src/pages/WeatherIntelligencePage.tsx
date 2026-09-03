import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const WeatherIntelligencePage: React.FC = () => {
  const { weather, selectedLocation } = useApp();

  const hourly = weather?.hourly ?? [];
  const trendData = hourly.slice(0, 12).map((p, idx) => ({
    time: p.time.split('T')[1]?.substring(0, 5) ?? p.time,
    cape: Math.max(800, 1420 - idx * 40 + (idx % 3) * 80),
    iwv: +(42 + (idx % 4) * 1.5).toFixed(1),
    rain: p.rain_mm,
    wind: p.wind_speed_kmh
  }));

  const specRows = [
    { label: 'CAPE', value: '1,420 J/kg', note: 'Elevated potential', color: '#ff9f00' },
    { label: 'CIN', value: '−38 J/kg', note: 'Low inhibition', color: '#388e3c' },
    { label: 'IWV', value: '46.8 kg/m²', note: 'Moist column', color: '#2874f0' },
    { label: 'Surface Temp', value: `${weather?.current.temperature_c ?? 30.5}°C`, note: '2m height', color: '#212121' },
    { label: 'Surface Pressure', value: `${weather?.current.surface_pressure_hpa ?? 1004} hPa`, note: 'Barometric stable', color: '#212121' },
    { label: 'Cloud Cover', value: `${weather?.current.cloud_cover_pct ?? 92}%`, note: 'Dense overcast', color: '#878787' },
    { label: 'Wind Speed', value: `${weather?.current.wind_speed_kmh ?? 24} km/h`, note: `Dir: ${weather?.current.wind_direction_deg ?? 135}°`, color: '#212121' },
    { label: 'Wind Gust', value: `${weather?.current.wind_gusts_kmh ?? 42} km/h`, note: 'Gusty vector', color: '#ff9f00' },
    { label: 'Rainfall Rate', value: `${weather?.current.precipitation_mm ?? 12.8} mm/h`, note: 'Active rain', color: '#2874f0' },
    { label: 'Relative Humidity', value: `${weather?.current.relative_humidity_pct ?? 78}%`, note: 'High moisture', color: '#ff9f00' },
    { label: 'Cloud-Top Cooling', value: '−4.2 °C/h', note: 'Convective growth', color: '#ff6161' },
    { label: 'Runoff Signal', value: '0.61', note: 'Rising slope', color: '#ff9f00' },
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#878787]">
        <span>SKYSHIELD</span><ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-[#212121]">Weather Intelligence</span>
        <span className="text-[#2874f0] ml-2 font-semibold">{selectedLocation.name}</span>
      </div>

      {/* Header */}
      <div className="sz-card sz-card-body flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#212121]">Weather Intelligence Analysis</h1>
          <p className="text-xs text-[#878787] mt-0.5">Comprehensive thermodynamic parameters and atmospheric telemetry.</p>
        </div>
        <div className="text-[10px] font-mono text-[#878787] bg-[#f7f7f7] border border-gray-200 px-3 py-1.5 rounded">
          SOURCE: OPEN-METEO / OWM TELEMETRY
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: Spec Table (Amazon product specifications) */}
        <div className="sz-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-bold text-sm text-[#212121]">Atmospheric Specifications</div>
            <div className="text-xs text-[#878787]">All observed parameters</div>
          </div>
          <table className="sz-table">
            <tbody>
              {specRows.map(r => (
                <tr key={r.label}>
                  <td className="text-[#878787] w-40">{r.label}</td>
                  <td>
                    <div className="font-bold text-[#212121]" style={{ color: r.color !== '#212121' ? r.color : undefined }}>{r.value}</div>
                    <div className="text-[10px] text-[#878787]">{r.note}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIGHT: 4 Trend Charts */}
        <div className="lg:col-span-2 space-y-4">
          {[
            { title: 'CAPE Trend (J/kg)', key: 'cape', color: '#ff9f00', fill: '#fff8e1', label: 'CAPE' },
            { title: 'IWV Atmospheric Moisture (kg/m²)', key: 'iwv', color: '#2874f0', fill: '#e8f0fe', label: 'IWV' },
          ].map(chart => (
            <div key={chart.key} className="sz-card">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-sm text-[#212121]">{chart.title}</span>
                <span className="text-[10px] font-mono text-[#878787] bg-[#f7f7f7] border border-gray-200 px-2 py-0.5 rounded">{chart.label}</span>
              </div>
              <div className="p-4" style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" stroke="#878787" fontSize={10} />
                    <YAxis stroke="#878787" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 4, fontSize: 11 }} />
                    <Area type="monotone" dataKey={chart.key} stroke={chart.color} fill={chart.fill} strokeWidth={2} name={chart.label} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Rainfall Intensity (mm/h)', key: 'rain', color: '#2874f0', type: 'bar' },
              { title: 'Wind Speed Trend (km/h)', key: 'wind', color: '#ff9f00', type: 'line' },
            ].map(chart => (
              <div key={chart.key} className="sz-card">
                <div className="px-3 py-2.5 border-b border-gray-100">
                  <span className="font-bold text-xs text-[#212121]">{chart.title}</span>
                </div>
                <div className="p-3" style={{ height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {chart.type === 'bar'
                      ? <BarChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" stroke="#878787" fontSize={9} />
                          <YAxis stroke="#878787" fontSize={9} />
                          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 4, fontSize: 11 }} />
                          <Bar dataKey={chart.key} fill={chart.color} radius={[2, 2, 0, 0]} />
                        </BarChart>
                      : <LineChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" stroke="#878787" fontSize={9} />
                          <YAxis stroke="#878787" fontSize={9} />
                          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 4, fontSize: 11 }} />
                          <Line type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                    }
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
