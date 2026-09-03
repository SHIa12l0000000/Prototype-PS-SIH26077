# WeatherGuard AI — Architecture Documentation

**System Title**: WeatherGuard AI — Hyper-Local Severe Weather Early Warning System  
**SIH Problem Statement ID**: 26077  
**Organization**: Ministry of Earth Sciences (MoES) / National Centre for Medium Range Weather Forecasting (NCMRWF)

---

## Architectural Overview

WeatherGuard AI is built using a modern decoupled client-server architecture designed for high availability, low-latency rendering, and multi-hazard spatiotemporal evaluation.

```
+-----------------------------------------------------------------------------------+
|                            FRONTEND (React + Vite + TS)                           |
|  - Dark Command Center UI (Tailwind CSS v4)                                       |
|  - MapLibre GL JS Vector & Doppler Radar Tile Rendering                           |
|  - Recharts Forecast & Telemetry Visualizations                                   |
|  - DEMO MODE Toggle (Fail-safe Deterministic Telemetry)                           |
+-----------------------------------------------------------------------------------+
                                         │
                                   HTTP / REST (JSON)
                                         ▼
+-----------------------------------------------------------------------------------+
|                             BACKEND PROXY (FastAPI)                               |
|  - Open-Meteo Weather Normalization Proxy                                         |
|  - RainViewer Radar Metadata Normalizer                                           |
|  - Modular Severe Weather Risk Engine                                             |
|  - CartoDEM / SRTM Elevation & Slope Geomorphology Index                          |
|  - Active Alert Manager & Geocoding Resolver                                      |
+-----------------------------------------------------------------------------------+
                                         │
             ┌───────────────────────────┼───────────────────────────┐
             ▼                           ▼                           ▼
+-------------------------+ +-------------------------+ +-------------------------+
|     Live Data APIs      | |   Prototype Risk Model  | | Future Integration Hub  |
| - Open-Meteo Forecast   | | - Thunderstorm Risk     | | - INSAT-3D/3DR (MOSDAC) |
| - RainViewer Radar      | | - Cloudburst Risk       | | - IMDAA Atmospheric     |
| - OSM Nominatim         | | - Flash Flood Risk      | | - High-Res CartoDEM     |
+-------------------------+ +-------------------------+ +-------------------------+
```

---

## Key Subsystems

### 1. Frontend Command Dashboard
- Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.
- Uses **MapLibre GL JS** for fast WebGL map rendering.
- Custom Dark Theme with zero decorative bloat, clear information hierarchy, high contrast status indicators (`#EF4444` Critical, `#F97316` High, `#F59E0B` Moderate, `#10B981` Low, `#3B82F6` Info).
- Supports 9 core operational views: Overview, Live Risk Map, Weather Intelligence, Alerts, AI Analysis (XAI), Satellite Readiness, Analytics, Data Sources, and System Status.

### 2. Backend Proxy & API Gateway
- Built with **Python 3.11** & **FastAPI**.
- Prevents direct client-side third-party API exposure, managing rate limits, timeouts, and normalization.
- Serves endpoints for weather, radar tiles, hazard risk predictions, alert state management, and system health monitoring.

### 3. Severe Weather Risk Engine
- Implements transparent heuristic algorithms for 3 critical hazard types:
  1. **Thunderstorm Risk**: Convective energy, wind gusts, relative humidity, cloud cover.
  2. **Cloudburst Risk**: Intense localized rainfall rate, cloud cover, atmospheric saturation, orographic slope lift.
  3. **Flash Flood Risk**: Rainfall rate, soil saturation proxy, terrain slope, low elevation drainage bottlenecks.
- Designed with a clean interface (`ml/inference/predict.py`) so trained multi-task deep learning models (taking 3D spatiotemporal atmospheric grids) can replace the prototype risk engine.

### 4. Spatiotemporal & Satellite Integration Roadmap
- **INSAT-3D/3DR Satellite Data**: Prepared for direct API connection to MOSDAC (Water Vapor, Thermal Infrared, Cloud Top Temperature drop rate).
- **IMDAA Atmospheric Reanalysis**: Structured to consume NCMRWF high-resolution atmospheric reanalysis parameters (CAPE, CIN, Integrated Water Vapor, Wind Shear, Low-Level Convergence).
