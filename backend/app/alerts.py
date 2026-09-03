from datetime import datetime, timezone
import uuid
from typing import List, Optional
from .schemas import AlertItem, AlertsResponse, RiskPrediction

# In-memory store backed by initial benchmark alerts
SAMPLE_ALERTS: List[AlertItem] = [
    AlertItem(
        id="ALT-2026-0901",
        timestamp=datetime.now(timezone.utc).isoformat(),
        location_name="Wayanad, Kerala",
        latitude=11.6854,
        longitude=76.1320,
        hazard_type="Flash Flood",
        severity="EXTREME",
        prototype_risk_score=88,
        monitoring_window="Next 2–6 hours",
        primary_factors=["Extreme precipitation (18.5 mm/h)", "Steep terrain slope (28.5°)", "High atmospheric moisture (94%)"],
        recommended_action="Monitor vulnerable slope zones and low-lying river channels immediately.",
        status="ACTIVE",
        is_prototype_advisory=True
    ),
    AlertItem(
        id="ALT-2026-0902",
        timestamp=datetime.now(timezone.utc).isoformat(),
        location_name="Kedarnath, Uttarakhand",
        latitude=30.7346,
        longitude=79.0669,
        hazard_type="Cloudburst",
        severity="HIGH",
        prototype_risk_score=76,
        monitoring_window="Next 2–4 hours",
        primary_factors=["Rapid rainfall accumulation", "Glacial valley orographic uplift", "Cloud cover 95%"],
        recommended_action="Issue precautionary notification to high-altitude transit posts.",
        status="ACTIVE",
        is_prototype_advisory=True
    ),
    AlertItem(
        id="ALT-2026-0903",
        timestamp=datetime.now(timezone.utc).isoformat(),
        location_name="Ghaziabad, Uttar Pradesh",
        latitude=28.6692,
        longitude=77.4538,
        hazard_type="Thunderstorm",
        severity="MODERATE",
        prototype_risk_score=48,
        monitoring_window="Next 4–6 hours",
        primary_factors=["Wind gusts up to 42 km/h", "High relative humidity (78%)"],
        recommended_action="Maintain routine district telemetry monitoring.",
        status="ACTIVE",
        is_prototype_advisory=True
    ),
    AlertItem(
        id="ALT-2026-0904",
        timestamp=datetime.now(timezone.utc).isoformat(),
        location_name="Mumbai, Maharashtra",
        latitude=19.0760,
        longitude=72.8777,
        hazard_type="Flash Flood",
        severity="HIGH",
        prototype_risk_score=72,
        monitoring_window="Next 2–6 hours",
        primary_factors=["Heavy coastal rain (14.2 mm/h)", "High tide estuary backwater risk"],
        recommended_action="Inspect municipal drainage pumping stations.",
        status="ACTIVE",
        is_prototype_advisory=True
    )
]

class AlertManager:
    def __init__(self):
        self.alerts: List[AlertItem] = list(SAMPLE_ALERTS)

    def get_alerts(self, severity_filter: Optional[str] = None, location_query: Optional[str] = None) -> AlertsResponse:
        filtered = self.alerts
        if severity_filter and severity_filter.upper() != "ALL":
            filtered = [a for a in filtered if a.severity.upper() == severity_filter.upper()]
        if location_query:
            filtered = [a for a in filtered if location_query.lower() in a.location_name.lower()]
        return AlertsResponse(alerts=filtered, total_count=len(filtered))

    def acknowledge_alert(self, alert_id: str) -> Optional[AlertItem]:
        for alert in self.alerts:
            if alert.id == alert_id:
                alert.status = "ACKNOWLEDGED"
                return alert
        return None

    def generate_alert_from_prediction(self, prediction: RiskPrediction) -> Optional[AlertItem]:
        overall = prediction.overall_hazard
        if overall.risk_score >= 50:
            # Determine dominant hazard type
            if prediction.thunderstorm_risk.risk_score >= prediction.cloudburst_risk.risk_score and \
               prediction.thunderstorm_risk.risk_score >= prediction.flash_flood_risk.risk_score:
                hazard_type = prediction.thunderstorm_risk.hazard_type
            elif prediction.cloudburst_risk.risk_score >= prediction.flash_flood_risk.risk_score:
                hazard_type = prediction.cloudburst_risk.hazard_type
            else:
                hazard_type = "Flash Flood"

            # ── DEDUPLICATION: skip if same location+hazard alert exists within last 10 minutes ──
            from datetime import timedelta
            now = datetime.now(timezone.utc)
            for existing in self.alerts:
                if (
                    existing.location_name == prediction.location_name
                    and existing.hazard_type == hazard_type
                    and existing.status == "ACTIVE"
                ):
                    try:
                        existing_ts = datetime.fromisoformat(existing.timestamp.replace("Z", "+00:00"))
                        if (now - existing_ts) < timedelta(minutes=10):
                            return None  # Already have a recent alert for this location+hazard
                    except Exception:
                        pass

            new_alert = AlertItem(
                id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
                timestamp=prediction.timestamp,
                location_name=prediction.location_name,
                latitude=prediction.latitude,
                longitude=prediction.longitude,
                hazard_type=hazard_type,
                severity=overall.severity,
                prototype_risk_score=overall.risk_score,
                monitoring_window="Next 2–6 hours",
                primary_factors=prediction.primary_reasons,
                recommended_action=prediction.recommended_actions[0] if prediction.recommended_actions else "Monitor area telemetry.",
                status="ACTIVE",
                is_prototype_advisory=True
            )
            self.alerts.insert(0, new_alert)
            return new_alert
        return None

alert_manager = AlertManager()

