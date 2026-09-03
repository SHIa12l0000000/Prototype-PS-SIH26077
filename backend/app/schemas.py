from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LocationResult(BaseModel):
    name: str
    district: str
    state: str
    country: str = "India"
    latitude: float
    longitude: float
    elevation_m: float = 0.0

class WeatherCurrent(BaseModel):
    temperature_c: float
    relative_humidity_pct: float
    precipitation_mm: float
    rain_mm: float
    showers_mm: float
    surface_pressure_hpa: float
    cloud_cover_pct: float
    wind_speed_kmh: float
    wind_direction_deg: float
    wind_gusts_kmh: float
    weather_code: int
    weather_description: str
    is_day: int = 1
    timestamp: str

class HourlyForecastPoint(BaseModel):
    time: str
    temperature_c: float
    relative_humidity_pct: float
    precipitation_mm: float
    rain_mm: float
    surface_pressure_hpa: float
    cloud_cover_pct: float
    wind_speed_kmh: float
    wind_direction_deg: float

class WeatherResponse(BaseModel):
    location: LocationResult
    current: WeatherCurrent
    hourly: List[HourlyForecastPoint]
    data_source: str = "Open-Meteo API"
    is_demo: bool = False
    fetched_at: str

class RadarFrame(BaseModel):
    time: int
    path: str
    time_iso: str

class RadarResponse(BaseModel):
    host: str
    past_frames: List[RadarFrame]
    nowcast_frames: List[RadarFrame]
    latest_frame_url: Optional[str] = None
    status: str
    message: Optional[str] = None
    is_demo: bool = False

class EnvironmentalInput(BaseModel):
    latitude: float = 28.6692
    longitude: float = 77.4538
    temperature_c: float = 30.0
    relative_humidity_pct: float = 75.0
    precipitation_mm: float = 12.0
    rain_mm: float = 12.0
    surface_pressure_hpa: float = 1005.0
    cloud_cover_pct: float = 85.0
    wind_speed_kmh: float = 35.0
    wind_gusts_kmh: float = 55.0
    elevation_m: Optional[float] = 210.0
    slope_deg: Optional[float] = 5.0
    # Future meteorological parameters (Optional in prototype)
    iwv_kg_m2: Optional[float] = None
    cape_j_kg: Optional[float] = None
    cin_j_kg: Optional[float] = None
    wind_shear_kts: Optional[float] = None
    ctt_drop_rate_c_hr: Optional[float] = None

class RiskFactor(BaseModel):
    factor_name: str
    weight_pct: float
    level: str  # LOW, MODERATE, HIGH, EXTREME
    value_display: str
    description: str

class HazardScore(BaseModel):
    hazard_type: str  # Thunderstorm, Cloudburst, Flash Flood, Overall
    risk_score: int    # 0 to 100
    severity: str      # LOW, MODERATE, HIGH, EXTREME
    trend: str         # INCREASING, STABLE, DECREASING
    short_explanation: str

class RiskPrediction(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    timestamp: str
    is_prototype_score: bool = True
    advisory_notice: str = "Prototype Risk Score — not a certified meteorological probability."
    thunderstorm_risk: HazardScore
    cloudburst_risk: HazardScore
    flash_flood_risk: HazardScore
    overall_hazard: HazardScore
    contributing_factors: List[RiskFactor]
    primary_reasons: List[str]
    recommended_actions: List[str]
    terrain_info: Dict[str, Any]

class AlertItem(BaseModel):
    id: str
    timestamp: str
    location_name: str
    latitude: float
    longitude: float
    hazard_type: str
    severity: str
    prototype_risk_score: int
    monitoring_window: str = "Next 2–6 hours"
    primary_factors: List[str]
    recommended_action: str
    status: str = "ACTIVE"  # ACTIVE, ACKNOWLEDGED, EXPIRED
    is_prototype_advisory: bool = True

class AlertsResponse(BaseModel):
    alerts: List[AlertItem]
    total_count: int

class SystemComponentStatus(BaseModel):
    name: str
    status: str  # OPERATIONAL, DEGRADED, CONNECTED, INTEGRATION_READY, ERROR
    latency_ms: Optional[int] = None
    details: str

class SystemStatusResponse(BaseModel):
    overall_status: str
    timestamp: str
    components: List[SystemComponentStatus]
    uptime_seconds: float
