import { WeatherResponse, RiskPrediction, AlertItem, RadarResponse, SystemStatusResponse } from '../types';

export const DEMO_LOCATION = {
  name: "Ghaziabad",
  district: "Ghaziabad",
  state: "Uttar Pradesh",
  country: "India",
  latitude: 28.6692,
  longitude: 77.4538,
  elevation_m: 210.0
};

export const DEMO_WEATHER: WeatherResponse = {
  location: DEMO_LOCATION,
  current: {
    temperature_c: 30.5,
    relative_humidity_pct: 78.0,
    precipitation_mm: 12.8,
    rain_mm: 12.8,
    showers_mm: 0.0,
    surface_pressure_hpa: 1004.2,
    cloud_cover_pct: 88.0,
    wind_speed_kmh: 24.5,
    wind_direction_deg: 135.0,
    wind_gusts_kmh: 42.0,
    weather_code: 80,
    weather_description: "Slight rain showers (DEMO MODE)",
    is_day: 1,
    timestamp: new Date().toISOString()
  },
  hourly: Array.from({ length: 12 }, (_, i) => ({
    time: `2026-09-03T${(i + 12) % 24}:00`,
    temperature_c: Number((30.5 - i * 0.4).toFixed(1)),
    relative_humidity_pct: Math.min(98, 78 + i * 1.5),
    precipitation_mm: Number(Math.max(0, 12.8 - i * 0.8 + (i % 3) * 2.5).toFixed(1)),
    rain_mm: Number(Math.max(0, 12.8 - i * 0.8 + (i % 3) * 2.5).toFixed(1)),
    surface_pressure_hpa: Number((1004.2 - i * 0.3).toFixed(1)),
    cloud_cover_pct: Math.min(100, 88 + i * 1),
    wind_speed_kmh: Number((24.5 + (i % 4) * 3).toFixed(1)),
    wind_direction_deg: 135.0
  })),
  data_source: "WeatherGuard Heuristic Telemetry Engine (DEMO DATA)",
  is_demo: true,
  fetched_at: new Date().toISOString()
};

export const DEMO_RISK_PREDICTION: RiskPrediction = {
  location_name: "Ghaziabad",
  latitude: 28.6692,
  longitude: 77.4538,
  timestamp: new Date().toISOString(),
  is_prototype_score: true,
  advisory_notice: "Prototype Risk Score — for SIH demonstration and testing.",
  thunderstorm_risk: {
    hazard_type: "Thunderstorm Risk",
    risk_score: 64,
    severity: "HIGH",
    trend: "INCREASING",
    short_explanation: "Atmospheric moisture (78%) and surface wind gusts (42 km/h) indicate strong convective potential."
  },
  cloudburst_risk: {
    hazard_type: "Cloudburst Risk",
    risk_score: 72,
    severity: "HIGH",
    trend: "STABLE",
    short_explanation: "Intense localized precipitation rate (12.8 mm/h) coupled with high cloud cover (88%)."
  },
  flash_flood_risk: {
    hazard_type: "Flash Flood Risk",
    risk_score: 82,
    severity: "EXTREME",
    trend: "INCREASING",
    short_explanation: "Rapid surface water runoff on low-lying Indo-Gangetic alluvial terrain under heavy precipitation."
  },
  overall_hazard: {
    hazard_type: "Overall Severe Weather Hazard",
    risk_score: 82,
    severity: "EXTREME",
    trend: "INCREASING",
    short_explanation: "High-priority multi-hazard advisory over next 2–6 hour operational window."
  },
  contributing_factors: [
    {
      factor_name: "Rainfall Intensity",
      weight_pct: 35.0,
      level: "EXTREME",
      value_display: "12.8 mm/h",
      description: "Active surface precipitation rate measured via telemetry."
    },
    {
      factor_name: "Atmospheric Moisture",
      weight_pct: 25.0,
      level: "HIGH",
      value_display: "78.0%",
      description: "Surface relative humidity driving convective instability."
    },
    {
      factor_name: "Wind Gust & Shear",
      weight_pct: 20.0,
      level: "HIGH",
      value_display: "42.0 km/h",
      description: "Surface wind gust velocity."
    },
    {
      factor_name: "Terrain Susceptibility",
      weight_pct: 20.0,
      level: "HIGH",
      value_display: "Slope 2.1° | Elev 210m",
      description: "Indo-Gangetic Basin low-lying drainage catchment."
    },
    {
      factor_name: "CAPE / IWV / CTT Drop Rate",
      weight_pct: 0.0,
      level: "LOW",
      value_display: "Not available in current data source",
      description: "INSAT-3D satellite & IMDAA reanalysis connectors integration-ready."
    }
  ],
  primary_reasons: [
    "Heavy localized precipitation rate (12.8 mm/h) detected.",
    "Elevated relative humidity (78.0%) supporting atmospheric moisture convergence.",
    "Strong surface wind gusts (42.0 km/h) indicating squall boundary.",
    "Low-lying urban basin terrain susceptible to rapid inundation."
  ],
  recommended_actions: [
    "Issue immediate hyper-local advisory to district emergency response personnel.",
    "Monitor low-lying drainage channels and urban underpasses for waterlogging.",
    "Advise public against transit through waterlogged road sections over next 2–6 hours."
  ],
  terrain_info: {
    elevation_m: 210.0,
    slope_deg: 2.1,
    drainage_capacity: "MODERATE",
    flood_susceptibility: "HIGH",
    geomorphology: "Indo-Gangetic Alluvial Basin",
    dataset: "CartoDEM 30m / SRTM HydroSHEDS Heuristic Model (DEMO DATA)"
  }
};

export const DEMO_ALERTS: AlertItem[] = [
  {
    id: "ALT-DEMO-01",
    timestamp: new Date().toISOString(),
    location_name: "Wayanad, Kerala",
    latitude: 11.6854,
    longitude: 76.1320,
    hazard_type: "Flash Flood",
    severity: "EXTREME",
    prototype_risk_score: 88,
    monitoring_window: "Next 2–6 hours",
    primary_factors: ["Extreme precipitation (18.5 mm/h)", "Steep slope terrain (28.5°)", "High moisture (94%)"],
    recommended_action: "Monitor low-lying river channels and slope failure zones immediately.",
    status: "ACTIVE",
    is_prototype_advisory: true
  },
  {
    id: "ALT-DEMO-02",
    timestamp: new Date().toISOString(),
    location_name: "Kedarnath, Uttarakhand",
    latitude: 30.7346,
    longitude: 79.0669,
    hazard_type: "Cloudburst",
    severity: "HIGH",
    prototype_risk_score: 76,
    monitoring_window: "Next 2–4 hours",
    primary_factors: ["High altitude rain accumulation", "Glacial valley orographic lift"],
    recommended_action: "Issue precautionary notice to transit checkpoints.",
    status: "ACTIVE",
    is_prototype_advisory: true
  },
  {
    id: "ALT-DEMO-03",
    timestamp: new Date().toISOString(),
    location_name: "Ghaziabad, Uttar Pradesh",
    latitude: 28.6692,
    longitude: 77.4538,
    hazard_type: "Flash Flood",
    severity: "HIGH",
    prototype_risk_score: 82,
    monitoring_window: "Next 2–6 hours",
    primary_factors: ["Precipitation rate 12.8 mm/h", "Urban drainage congestion"],
    recommended_action: "Inspect municipal drainage underpasses and pumping stations.",
    status: "ACTIVE",
    is_prototype_advisory: true
  }
];

export const DEMO_RADAR: RadarResponse = {
  host: "https://tilecache.rainviewer.com",
  past_frames: [
    { time: 1756920000, path: "/v2/radar/1756920000", time_iso: new Date().toISOString() }
  ],
  nowcast_frames: [],
  latest_frame_url: null,
  status: "DEGRADED",
  message: "RainViewer Tile Service Demo Mode Active.",
  is_demo: true
};

export const DEMO_SYSTEM_STATUS: SystemStatusResponse = {
  overall_status: "OPERATIONAL",
  timestamp: new Date().toISOString(),
  components: [
    { name: "Frontend Command Dashboard", status: "OPERATIONAL", latency_ms: 5, details: "Vite React Single Page Application" },
    { name: "FastAPI Backend Proxy Service", status: "OPERATIONAL", latency_ms: 8, details: "Python Uvicorn API Gateway" },
    { name: "Open-Meteo Weather API", status: "CONNECTED", latency_ms: 180, details: "Global Numerical Weather Data Stream" },
    { name: "RainViewer Radar Tile Feed", status: "CONNECTED", latency_ms: 210, details: "Global Doppler Radar Infrastructure" },
    { name: "AI / Risk Engine", status: "OPERATIONAL", latency_ms: 4, details: "Multi-Hazard Heuristic Risk Engine" },
    { name: "INSAT-3D Satellite Connector", status: "INTEGRATION_READY", details: "MOSDAC Endpoint Hookup Ready" },
    { name: "IMDAA Atmospheric Reanalysis", status: "INTEGRATION_READY", details: "NCMRWF High-Res Data Connector Ready" },
    { name: "CartoDEM / SRTM Elevation Index", status: "OPERATIONAL", latency_ms: 2, details: "Spatial Slope & Terrain Drainage Index" }
  ],
  uptime_seconds: 1420.5
};
