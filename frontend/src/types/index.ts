export interface LocationResult {
  name: string;
  district: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
}

export interface WeatherCurrent {
  temperature_c: number;
  relative_humidity_pct: number;
  precipitation_mm: number;
  rain_mm: number;
  showers_mm: number;
  surface_pressure_hpa: number;
  cloud_cover_pct: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  wind_gusts_kmh: number;
  weather_code: number;
  weather_description: string;
  is_day: number;
  timestamp: string;
}

export interface HourlyForecastPoint {
  time: string;
  temperature_c: number;
  relative_humidity_pct: number;
  precipitation_mm: number;
  rain_mm: number;
  surface_pressure_hpa: number;
  cloud_cover_pct: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
}

export interface WeatherResponse {
  location: LocationResult;
  current: WeatherCurrent;
  hourly: HourlyForecastPoint[];
  data_source: string;
  is_demo: boolean;
  fetched_at: string;
}

export interface RadarFrame {
  time: number;
  path: string;
  time_iso: string;
}

export interface RadarResponse {
  host: string;
  past_frames: RadarFrame[];
  nowcast_frames: RadarFrame[];
  latest_frame_url: string | null;
  status: string;
  message?: string;
  is_demo: boolean;
}

export interface HazardScore {
  hazard_type: string;
  risk_score: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  short_explanation: string;
}

export interface RiskFactor {
  factor_name: string;
  weight_pct: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  value_display: string;
  description: string;
}

export interface RiskPrediction {
  location_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  is_prototype_score: boolean;
  advisory_notice: string;
  thunderstorm_risk: HazardScore;
  cloudburst_risk: HazardScore;
  flash_flood_risk: HazardScore;
  overall_hazard: HazardScore;
  contributing_factors: RiskFactor[];
  primary_reasons: string[];
  recommended_actions: string[];
  terrain_info: {
    elevation_m: number;
    slope_deg: number;
    drainage_capacity: string;
    flood_susceptibility: string;
    geomorphology: string;
    dataset: string;
  };
}

export interface AlertItem {
  id: string;
  timestamp: string;
  location_name: string;
  latitude: number;
  longitude: number;
  hazard_type: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  prototype_risk_score: number;
  monitoring_window: string;
  primary_factors: string[];
  recommended_action: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'EXPIRED';
  is_prototype_advisory: boolean;
}

export interface SystemComponentStatus {
  name: string;
  status: string;
  latency_ms?: number;
  details: string;
}

export interface SystemStatusResponse {
  overall_status: string;
  timestamp: string;
  components: SystemComponentStatus[];
  uptime_seconds: number;
}

export type PageId =
  | 'overview'
  | 'map'
  | 'weather'
  | 'alerts'
  | 'xai'
  | 'satellite'
  | 'analytics'
  | 'datasources'
  | 'status';
