# 🌩️ SKYSHIELD — Severe Weather Nowcast

### **AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting**
**Smart India Hackathon (SIH) — Problem Statement 26077**  
*Organization: Ministry of Earth Sciences (MoES) / National Centre for Medium Range Weather Forecasting (NCMRWF)*

---

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite_6-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![MapTiler](https://img.shields.io/badge/GIS-MapTiler_Cloud-FF6600.svg)](https://maptiler.com)
[![Tomorrow.io](https://img.shields.io/badge/Weather-Tomorrow.io_API-00B2FE.svg)](https://tomorrow.io)
[![Twilio](https://img.shields.io/badge/SMS-Twilio_Alerts-F22F46.svg?logo=twilio&logoColor=white)](https://twilio.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Executive Summary

**SKYSHIELD** is an operational-grade prototype for **0–6 hour hyper-local severe weather nowcasting**. It synthesizes live satellite, Doppler radar reflectivity, multi-layer numerical reanalysis, and digital elevation models (DEM) through a physics-informed Machine Learning risk engine to deliver actionable warnings for:

1. **Severe Thunderstorms & Convective Squalls** (CAPE, Lifted Index, Vertical Wind Shear)
2. **Cloudbursts** (Sudden extreme precipitation > 100 mm/hr, rapid cloud-top cooling)
3. **Flash Floods & Urban Inundation** (Terrain steepness, runoff index, soil saturation proxy)

The platform features an **Amazon/Flipkart-inspired high-density Command Center UI** designed for disaster management authorities (NDRF/SDMA), field officers, and citizens.

---

## 🚀 Live Data Streams & Telemetry

| Data Stream | Source | Resolution / Refresh | Role in Nowcasting |
|---|---|---|---|
| **Hyper-Local Convective Weather** | Tomorrow.io API | 1 km grid / Real-time | Short-range precipitation, wind gusts, convective cell movement |
| **Surface Observations & Fallback** | OpenWeatherMap API | Station point / 10 min | Ambient temp, humidity, pressure trends, dew point |
| **Atmospheric Instability** | Open-Meteo (ERA5/IFS) | 0.1° (~11 km) / Hourly | CAPE (J/kg), CIN, Integrated Water Vapour (IWV), 0–6km shear |
| **Satellite Channels (Optical & IR)** | NASA GIBS (MODIS / GPM) | 250 m – 5 km / 3-hour | Cloud-top brightness temperature (Band 31), Water vapour, GPM IMERG |
| **Doppler Radar Reflectivity** | RainViewer API | 1 km mosaic / 10 min | Real-time dBZ reflectivity composite loop |
| **3D Topographic Terrain** | MapTiler Cloud GIS | 30 cm satellite / 30 m DEM | Terrain slope, valley convergence, runoff flow pathways |
| **Early Warning Telephony** | Twilio SMS Gateway | Global GSM/LTE carrier | Instant SMS dispatches to civil protection and field units |

---

## 🧩 Architectural Overview

```text
       ┌───────────────────────────────────────────────────────────┐
       │                 MULTI-SOURCE DATA INGESTION               │
       │  Tomorrow.io · OWM · NASA GIBS · RainViewer · MapTiler    │
       └─────────────────────────────┬─────────────────────────────┘
                                     │
                                     ▼
       ┌───────────────────────────────────────────────────────────┐
       │             FASTAPI BACKEND TELEMETRY SERVICE             │
       │       - Multi-Hazard Risk Scoring (Physics-Informed)      │
       │       - Alert Deduplication & Priority Dispatch           │
       │       - Explainable AI (XAI) Feature Attribution Engine    │
       │       - Twilio High-Priority SMS Gateway                  │
       └─────────────────────────────┬─────────────────────────────┘
                                     │
                                     ▼
       ┌───────────────────────────────────────────────────────────┐
       │             SKYSHIELD COMMAND CENTER (REACT 19)           │
       │   1. Command Center Overview  5. Explainable AI (XAI)     │
       │   2. Interactive Risk Map     6. Satellite & Radar Loop   │
       │   3. Weather Intelligence     7. Analytics & Trends       │
       │   4. Alerts & Dispatch Queue  8. Data Sources & Status    │
       └───────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Capabilities

### 1. Multi-Hazard Composite Risk Engine
- Calculates localized hazard indices ($0 - 100$) categorized as **Normal**, **Watch**, **Moderate**, **Elevated**, or **Critical**.
- Integrates convective instability metrics ($\text{CAPE} > 2000 \text{ J/kg}$, $\text{CIN} \to 0$), digital elevation slope, and Doppler radar reflectivity ($> 45 \text{ dBZ}$).

### 2. Autonomous SMS Dispatch Pipeline
- Integrated with Twilio to deliver cellular early-warning messages directly to registered emergency response personnel (`+91 9601121603`).
- 10-minute stateful alert deduplication prevents message flooding during continuous storm monitoring.

### 3. NASA GIBS Satellite & RainViewer Radar GIS
- Live raster overlay with real-time switching between **MODIS True Colour**, **Doppler Radar Mosaic**, **Thermal Infrared (Cloud-Top Cooling)**, **Water Vapour**, and **GPM IMERG Rainfall**.

### 4. Explainable AI (XAI) Module
- Transparent decision-making for meteorologists: decomposes each hazard score into individual meteorological driving factors (CAPE weighting, Radar dBZ, Slope factor, Precip intensity).

---

## 📁 Repository Structure

```text
techpulse-ai/  (SKYSHIELD)
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   └── api.py           # All 8 REST endpoints (Weather, Radar, Risk, Alerts, SMS, Status)
│   │   ├── alerts.py            # AlertManager with 10-min deduplication
│   │   ├── config.py            # Dynamic .env loader & API configurations
│   │   ├── main.py              # FastAPI application entrypoint
│   │   ├── radar.py             # RainViewer Doppler radar parser
│   │   ├── risk_engine.py       # Multi-hazard physics-informed scoring engine
│   │   ├── schemas.py           # Pydantic v2 data models
│   │   ├── terrain.py           # Digital elevation & slope calculator
│   │   └── weather.py           # Tomorrow.io + OWM + Open-Meteo aggregator
│   └── requirements.txt         # Python dependencies (FastAPI, Uvicorn, httpx, pydantic)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx       # Flipkart-style blue top bar & navigation tabs
│   │   │   ├── Sidebar.tsx      # High-density operational sidebar
│   │   │   └── MobileNav.tsx    # Mobile navigation bar
│   │   ├── context/
│   │   │   └── AppContext.tsx   # Global app state & auto-polling
│   │   ├── pages/
│   │   │   ├── OverviewPage.tsx            # Main Command Center dashboard
│   │   │   ├── MapPage.tsx                 # Fullscreen MapTiler 3D GIS risk map
│   │   │   ├── WeatherIntelligencePage.tsx # Detailed meteorological data
│   │   │   ├── AlertsPage.tsx              # Alert queue & 1-click Twilio SMS dispatch
│   │   │   ├── XaiPage.tsx                 # Explainable AI feature attribution
│   │   │   ├── SatellitePage.tsx           # NASA GIBS satellite & radar viewer
│   │   │   ├── AnalyticsPage.tsx           # Lead time & risk trends
│   │   │   ├── DataSourcesPage.tsx         # Data stream status registry
│   │   │   └── SystemStatusPage.tsx        # System latency & pipeline health
│   │   └── services/
│   │       └── api.ts           # Axios / fetch proxy client
│   ├── package.json
│   └── vite.config.ts
│
├── ml/                          # Prototype ML training & feature preprocessing
├── docker-compose.yml           # Multi-container orchestration
├── create_zip.py                # Offline evaluation archiver
└── test_workflow.py             # Automated end-to-end API test suite
```

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`

### 1. Clone Repository
```bash
git clone https://github.com/SHIa12l0000000/techpulse-ai.git
cd techpulse-ai
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your API keys:
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
DEFAULT_ALERT_PHONE=+91xxxxxxxxxx
MAPTILER_API_KEY=your_maptiler_key
TOMORROW_API_KEY=your_tomorrow_key
OWM_API_KEY=your_owm_key
```

### 3. Backend Setup
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --port 8000 --reload
```

### 4. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Visit:
- **Web App**: `http://localhost:3000`
- **Swagger API Docs**: `http://127.0.0.1:8000/docs`

---

## 🧪 Verification & Automated Testing

Run the automated end-to-end test suite to verify all 8 backend endpoints:
```bash
python test_workflow.py
```
Expected output:
```text
[PASS] [200] Health
[PASS] [200] Location Search
[PASS] [200] Weather (Tomorrow.io/OWM Live API)
[PASS] [200] Radar Mosaic
[PASS] [200] Risk Assessment (Multi-Hazard Scoring)
[PASS] [200] Alerts & Dispatch Queue
[PASS] [200] SMS Dispatch Route
[PASS] [200] System Status Matrix

ALL 8 BACKEND API ENDPOINTS VERIFIED & PASSING!
```

---

## 🏛️ SIH Problem Statement 26077 Alignment

| SIH Requirement | SKYSHIELD Implementation |
|---|---|
| **0–6h Nowcasting Lead Time** | Real-time convective cell tracking with Tomorrow.io + Doppler Radar extrapolation |
| **High Spatial Resolution** | 1 km grid resolution downscaled over MapTiler 30 m terrain DEM |
| **Multi-Hazard Coverage** | Thunderstorms, Cloudbursts, and Flash Flood risk engines running simultaneously |
| **Explainable Predictions (XAI)** | Meteorological factor contribution charts (CAPE, dBZ, Slope, Rain Rate) |
| **Early Warning Dissemination** | 1-Click Twilio SMS dispatch with carrier delivery confirmation |
| **Operational Command Center** | Flipkart/Amazon high-density dashboard with zero-latency responsive controls |

---

## 📄 License
This project is developed for **Smart India Hackathon (SIH) 2024 / 2026** under the **MIT License**.
Developed by **Team SKYSHIELD** (Bedi Shivam Jagjeet).
