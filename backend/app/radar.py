import httpx
import logging
from datetime import datetime, timezone
from typing import List
from .schemas import RadarResponse, RadarFrame
from .config import settings

logger = logging.getLogger("weatherguard.radar")

async def fetch_rainviewer_radar() -> RadarResponse:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(settings.RAINVIEWER_BASE_URL)
            resp.raise_for_status()
            data = resp.json()

        host = data.get("host", "https://tilecache.rainviewer.com")
        radar_data = data.get("radar", {})
        
        past_raw = radar_data.get("past", [])
        nowcast_raw = radar_data.get("nowcast", [])

        past_frames: List[RadarFrame] = []
        for frame in past_raw:
            ts = frame.get("time", 0)
            path = frame.get("path", "")
            iso_time = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat() if ts else ""
            past_frames.append(RadarFrame(time=ts, path=path, time_iso=iso_time))

        nowcast_frames: List[RadarFrame] = []
        for frame in nowcast_raw:
            ts = frame.get("time", 0)
            path = frame.get("path", "")
            iso_time = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat() if ts else ""
            nowcast_frames.append(RadarFrame(time=ts, path=path, time_iso=iso_time))

        latest_url = None
        if past_frames:
            latest = past_frames[-1]
            latest_url = f"{host}{latest.path}/256/{{z}}/{{x}}/{{y}}/2/1_1.png"

        return RadarResponse(
            host=host,
            past_frames=past_frames,
            nowcast_frames=nowcast_frames,
            latest_frame_url=latest_url,
            status="CONNECTED",
            message="RainViewer live Doppler radar tile feed active.",
            is_demo=False
        )

    except Exception as e:
        logger.warning(f"RainViewer API connection failed: {e}")
        return RadarResponse(
            host="https://tilecache.rainviewer.com",
            past_frames=[],
            nowcast_frames=[],
            latest_frame_url=None,
            status="DEGRADED",
            message=f"Radar overlay temporarily unavailable ({str(e)}). Map navigation unaffected.",
            is_demo=True
        )
