# WeatherGuard AI — API Specification

**Base URL**: `http://localhost:8000/api`

---

## Endpoints

### 1. Health Check
`GET /api/health`

**Response (200 OK)**:
```json
{
  "status": "healthy",
  "service": "WeatherGuard AI",
  "version": "1.0.0",
  "timestamp": "2026-09-03T22:30:00Z"
}
```

---

### 2. Location Search
`GET /api/locations/search?q={query}`

**Query Parameters**:
- `q` (string, required): City name, district, or coordinates (e.g. `Ghaziabad`, `Wayanad`, `28.66, 77.45`)

**Response (200 OK)**:
```json
[
  {
    "name": "Ghaziabad",
    "district": "Ghaziabad",
    "state": "Uttar Pradesh",
    "country": "India",
    "latitude": 28.6692,
    "longitude": 77.4538,
    "elevation_m": 210.0
  }
]
```

---

### 3. Weather Telemetry
`GET /api/weather?latitude={lat}&longitude={lon}&location_name={name}`

**Response (200 OK)**:
```json
{
  "location": { "name": "Ghaziabad", "latitude": 28.6692, "longitude": 77.4538 },
  "current": {
    "temperature_c": 31.2,
    "relative_humidity_pct": 74.0,
    "precipitation_mm": 12.4,
    "surface_pressure_hpa": 1004.5,
    "cloud_cover_pct": 85.0,
    "wind_speed_kmh": 22.1,
    "wind_gusts_kmh": 41.5,
    "weather_code": 80,
    "weather_description": "Slight rain showers"
  },
  "hourly": [...],
  "data_source": "Open-Meteo Live API",
  "is_demo": false
}
```

---

### 4. Doppler Radar Feed
`GET /api/radar`

**Response (200 OK)**:
```json
{
  "host": "https://tilecache.rainviewer.com",
  "past_frames": [
    { "time": 1756920000, "path": "/v2/radar/1756920000", "time_iso": "2026-09-03T22:00:00Z" }
  ],
  "latest_frame_url": "https://tilecache.rainviewer.com/v2/radar/1756920000/256/{z}/{x}/{y}/2/1_1.png",
  "status": "CONNECTED"
}
```

---

### 5. Severe Weather Risk Assessment
`GET /api/risk?latitude={lat}&longitude={lon}&location_name={name}`

**Response (200 OK)**:
```json
{
  "location_name": "Ghaziabad",
  "latitude": 28.6692,
  "longitude": 77.4538,
  "is_prototype_score": true,
  "advisory_notice": "Prototype Risk Score — heuristic calculation, not a certified operational warning.",
  "thunderstorm_risk": { "hazard_type": "Thunderstorm Risk", "risk_score": 58, "severity": "HIGH", "trend": "INCREASING" },
  "cloudburst_risk": { "hazard_type": "Cloudburst Risk", "risk_score": 62, "severity": "HIGH", "trend": "STABLE" },
  "flash_flood_risk": { "hazard_type": "Flash Flood Risk", "risk_score": 71, "severity": "HIGH", "trend": "INCREASING" },
  "overall_hazard": { "hazard_type": "Overall Severe Weather Hazard", "risk_score": 71, "severity": "HIGH" },
  "contributing_factors": [...],
  "primary_reasons": [...],
  "recommended_actions": [...]
}
```

---

### 6. Active Alerts
`GET /api/alerts?severity={severity}&q={location}`

**Response (200 OK)**:
```json
{
  "alerts": [
    {
      "id": "ALT-2026-0901",
      "location_name": "Wayanad, Kerala",
      "hazard_type": "Flash Flood",
      "severity": "EXTREME",
      "prototype_risk_score": 88,
      "status": "ACTIVE"
    }
  ],
  "total_count": 1
}
```

---

### 7. System Status Telemetry
`GET /api/system/status`

**Response (200 OK)**:
```json
{
  "overall_status": "OPERATIONAL",
  "timestamp": "2026-09-03T22:30:00Z",
  "components": [...],
  "uptime_seconds": 342.5
}
```
