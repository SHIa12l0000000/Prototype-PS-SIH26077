import { WeatherResponse, RiskPrediction, AlertItem, RadarResponse, SystemStatusResponse, LocationResult } from '../types';
import { DEMO_WEATHER, DEMO_RISK_PREDICTION, DEMO_ALERTS, DEMO_RADAR, DEMO_SYSTEM_STATUS, DEMO_LOCATION } from './demoData';

const BASE_URL = '/api';

export async function fetchLocations(query: string): Promise<LocationResult[]> {
  try {
    const res = await fetch(`${BASE_URL}/locations/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Location search API call failed. Using demo location filter.", err);
    return [DEMO_LOCATION];
  }
}

export async function fetchWeather(
  lat: number,
  lon: number,
  locationName: string = "Ghaziabad",
  isDemoMode: boolean = false
): Promise<WeatherResponse> {
  if (isDemoMode) {
    return {
      ...DEMO_WEATHER,
      location: { ...DEMO_LOCATION, name: locationName, latitude: lat, longitude: lon }
    };
  }

  try {
    const url = `${BASE_URL}/weather?latitude=${lat}&longitude=${lon}&location_name=${encodeURIComponent(locationName)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: WeatherResponse = await res.json();
    return data;
  } catch (err) {
    console.warn("Weather API call failed. Falling back to Demo Mode weather.", err);
    return {
      ...DEMO_WEATHER,
      location: { ...DEMO_LOCATION, name: locationName, latitude: lat, longitude: lon },
      data_source: "Demo Telemetry (Backend API Unreachable)",
      is_demo: true
    };
  }
}

export async function fetchRiskPrediction(
  lat: number,
  lon: number,
  locationName: string = "Ghaziabad",
  isDemoMode: boolean = false
): Promise<RiskPrediction> {
  if (isDemoMode) {
    return {
      ...DEMO_RISK_PREDICTION,
      location_name: locationName,
      latitude: lat,
      longitude: lon
    };
  }

  try {
    const url = `${BASE_URL}/risk?latitude=${lat}&longitude=${lon}&location_name=${encodeURIComponent(locationName)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: RiskPrediction = await res.json();
    return data;
  } catch (err) {
    console.warn("Risk API call failed. Falling back to Demo Mode prediction.", err);
    return {
      ...DEMO_RISK_PREDICTION,
      location_name: locationName,
      latitude: lat,
      longitude: lon
    };
  }
}

export async function fetchAlerts(
  severity?: string,
  isDemoMode: boolean = false
): Promise<AlertItem[]> {
  if (isDemoMode) {
    if (severity && severity !== 'ALL') {
      return DEMO_ALERTS.filter(a => a.severity.toUpperCase() === severity.toUpperCase());
    }
    return DEMO_ALERTS;
  }

  try {
    let url = `${BASE_URL}/alerts`;
    if (severity && severity !== 'ALL') {
      url += `?severity=${severity}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.alerts;
  } catch (err) {
    console.warn("Alerts API call failed. Using Demo Alerts.", err);
    return DEMO_ALERTS;
  }
}

export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/alerts/${alertId}/acknowledge`, { method: 'POST' });
    return res.ok;
  } catch (err) {
    console.warn("Acknowledge alert failed.", err);
    return true;
  }
}

export async function fetchRadar(): Promise<RadarResponse> {
  try {
    const res = await fetch(`${BASE_URL}/radar`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: RadarResponse = await res.json();
    return data;
  } catch (err) {
    console.warn("Radar API call failed. Using Demo Radar.", err);
    return DEMO_RADAR;
  }
}

export async function fetchSystemStatus(): Promise<SystemStatusResponse> {
  try {
    const res = await fetch(`${BASE_URL}/system/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: SystemStatusResponse = await res.json();
    return data;
  } catch (err) {
    console.warn("System Status API call failed. Using Demo Status.", err);
    return DEMO_SYSTEM_STATUS;
  }
}
