from datetime import datetime, timezone
from typing import List, Dict, Any
from .schemas import (
    EnvironmentalInput,
    RiskPrediction,
    HazardScore,
    RiskFactor
)
from .terrain import analyze_terrain

def get_severity_label(score: int) -> str:
    if score >= 75:
        return "EXTREME"
    elif score >= 55:
        return "HIGH"
    elif score >= 35:
        return "MODERATE"
    return "LOW"

def compute_risk_assessment(input_data: EnvironmentalInput, location_name: str = "Target Location") -> RiskPrediction:
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # 1. Analyze Terrain Parameters
    terrain_info = analyze_terrain(
        input_data.latitude,
        input_data.longitude,
        location_name
    )
    
    slope = input_data.slope_deg if input_data.slope_deg is not None else terrain_info.get("slope_deg", 5.0)
    elev = input_data.elevation_m if input_data.elevation_m is not None else terrain_info.get("elevation_m", 200.0)

    # 2. Thunderstorm Risk Score Calculation
    temp = input_data.temperature_c
    humidity = input_data.relative_humidity_pct
    wind_gust = input_data.wind_gusts_kmh
    cloud = input_data.cloud_cover_pct
    rain = input_data.precipitation_mm

    ts_moisture = min(30.0, humidity * 0.3)
    ts_thermal = max(0.0, (temp - 18.0) * 1.4)
    ts_wind = min(35.0, wind_gust * 0.5)
    ts_cloud = cloud * 0.15
    ts_rain_bonus = 15.0 if rain > 5.0 else (5.0 if rain > 0.5 else 0.0)
    
    ts_score = int(min(100.0, max(5.0, ts_moisture + ts_thermal + ts_wind + ts_cloud + ts_rain_bonus)))

    # 3. Cloudburst Risk Score Calculation (Extreme localized rain intensity + orographic lift)
    cb_rain = min(60.0, rain * 4.2)
    cb_cloud = cloud * 0.2
    cb_humidity = max(0.0, (humidity - 65.0) * 0.6)
    cb_orographic = 18.0 if slope > 15.0 else (8.0 if slope > 8.0 else 0.0)
    
    cb_score = int(min(100.0, max(2.0, cb_rain + cb_cloud + cb_humidity + cb_orographic)))

    # 4. Flash Flood Risk Score Calculation (Rainfall + Terrain Slope + Low Drainage)
    ff_rain = min(55.0, rain * 3.8)
    ff_moisture = min(20.0, humidity * 0.2)
    ff_slope_risk = 25.0 if slope > 20.0 else (20.0 if elev < 25.0 else 10.0)
    ff_pressure_drop = 10.0 if input_data.surface_pressure_hpa < 1005.0 else 0.0

    ff_score = int(min(100.0, max(3.0, ff_rain + ff_moisture + ff_slope_risk + ff_pressure_drop)))

    # 5. Overall Hazard Level
    overall_score = max(ts_score, cb_score, ff_score)
    overall_severity = get_severity_label(overall_score)

    # 6. Contributing Factors Breakdown
    contributing_factors = [
        RiskFactor(
            factor_name="Rainfall Intensity",
            weight_pct=35.0,
            level="EXTREME" if rain > 15.0 else ("HIGH" if rain > 8.0 else ("MODERATE" if rain > 1.5 else "LOW")),
            value_display=f"{rain:.1f} mm/h",
            description="Active surface precipitation rate measured via meteorological telemetry."
        ),
        RiskFactor(
            factor_name="Atmospheric Moisture",
            weight_pct=25.0,
            level="HIGH" if humidity > 75.0 else ("MODERATE" if humidity > 55.0 else "LOW"),
            value_display=f"{humidity:.1f}%",
            description="Surface relative humidity contributing to convective potential."
        ),
        RiskFactor(
            factor_name="Wind Gust & Shear",
            weight_pct=20.0,
            level="HIGH" if wind_gust > 45.0 else ("MODERATE" if wind_gust > 25.0 else "LOW"),
            value_display=f"{wind_gust:.1f} km/h",
            description="Surface wind gust speeds indicating squall line activity."
        ),
        RiskFactor(
            factor_name="Terrain Susceptibility",
            weight_pct=20.0,
            level=terrain_info.get("flood_susceptibility", "MODERATE"),
            value_display=f"Slope {slope:.1f}° | Elev {elev:.0f}m",
            description=f"Terrain geomorphology ({terrain_info.get('geomorphology', 'Basin')})."
        ),
        RiskFactor(
            factor_name="CAPE / IWV / CTT Drop Rate",
            weight_pct=0.0,
            level="LOW",
            value_display="Not available in current data source",
            description="INSAT-3D satellite & IMDAA reanalysis parameters ready for production hookup."
        )
    ]

    # Primary Reasons List
    reasons = []
    if rain > 5.0:
        reasons.append(f"Elevated precipitation rate ({rain:.1f} mm/h) detected.")
    if humidity > 75.0:
        reasons.append(f"High relative humidity ({humidity:.1f}%) supporting atmospheric saturation.")
    if wind_gust > 35.0:
        reasons.append(f"Strong surface wind gusts ({wind_gust:.1f} km/h).")
    if slope > 15.0:
        reasons.append(f"Steep terrain slope ({slope:.1f}°) heightens flash flood and orographic runoff risk.")
    elif elev < 25.0:
        reasons.append(f"Low elevation ({elev:.0f}m) in coastal/river basin increases inundation risk.")
    if not reasons:
        reasons.append("Environmental parameters are within normal baseline thresholds.")

    # Recommended Actions
    actions = []
    if overall_score >= 75:
        actions.append("Issue high-priority hyper-local advisory to district disaster response teams.")
        actions.append("Monitor low-lying areas, natural drainage channels, and landslide-prone slopes.")
        actions.append("Initiate 2–6 hour early warning protocols for local emergency personnel.")
    elif overall_score >= 55:
        actions.append("Maintain active telemetry monitoring over target district.")
        actions.append("Advise municipal drainage authorities to verify culverts and water channels.")
    else:
        actions.append("Routine atmospheric monitoring active. No emergency response required.")

    return RiskPrediction(
        location_name=location_name,
        latitude=input_data.latitude,
        longitude=input_data.longitude,
        timestamp=now_iso,
        is_prototype_score=True,
        advisory_notice="Prototype Risk Score — heuristic calculation, not a certified operational warning.",
        thunderstorm_risk=HazardScore(
            hazard_type="Thunderstorm Risk",
            risk_score=ts_score,
            severity=get_severity_label(ts_score),
            trend="INCREASING" if wind_gust > 30 else "STABLE",
            short_explanation=f"Moisture ({humidity:.0f}%) and wind gusts ({wind_gust:.0f} km/h) indicate convective potential."
        ),
        cloudburst_risk=HazardScore(
            hazard_type="Cloudburst Risk",
            risk_score=cb_score,
            severity=get_severity_label(cb_score),
            trend="INCREASING" if rain > 10 else "STABLE",
            short_explanation=f"Precipitation rate ({rain:.1f} mm/h) combined with orographic slope lift."
        ),
        flash_flood_risk=HazardScore(
            hazard_type="Flash Flood Risk",
            risk_score=ff_score,
            severity=get_severity_label(ff_score),
            trend="INCREASING" if rain > 8 else "STABLE",
            short_explanation=f"Surface runoff potential on {terrain_info.get('geomorphology', 'terrain')} under {rain:.1f} mm/h rain."
        ),
        overall_hazard=HazardScore(
            hazard_type="Overall Severe Weather Hazard",
            risk_score=overall_score,
            severity=overall_severity,
            trend="INCREASING" if overall_score > 60 else "STABLE",
            short_explanation=f"Composite risk level for {location_name} over 2–6 hour window."
        ),
        contributing_factors=contributing_factors,
        primary_reasons=reasons,
        recommended_actions=actions,
        terrain_info=terrain_info
    )
