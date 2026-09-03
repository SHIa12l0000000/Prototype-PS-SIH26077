import os

def _load_env():
    """Load key-value pairs from .env if it exists."""
    for path in [".env", "../.env", "../../.env"]:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ.setdefault(k.strip(), v.strip())
                break
            except Exception:
                pass

_load_env()

class Settings:
    PROJECT_NAME: str = "SKYSHIELD"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # =========================================================
    # Twilio Emergency SMS Dispatch
    # =========================================================
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "YOUR_TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "YOUR_TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "+17372508034")
    DEFAULT_ALERT_PHONE: str = os.getenv("DEFAULT_ALERT_PHONE", "+919601121603")

    # =========================================================
    # MapTiler API (Satellite & GIS 3D Terrain Tiles)
    # =========================================================
    MAPTILER_API_KEY: str = os.getenv("MAPTILER_API_KEY", "YOUR_MAPTILER_API_KEY")

    # =========================================================
    # Tomorrow.io API (Hyper-Local 0–6h Nowcasting & Precipitation)
    # =========================================================
    TOMORROW_API_KEY: str = os.getenv("TOMORROW_API_KEY", "YOUR_TOMORROW_API_KEY")
    TOMORROW_REALTIME_URL: str = "https://api.tomorrow.io/v4/weather/realtime"
    TOMORROW_FORECAST_URL: str = "https://api.tomorrow.io/v4/weather/forecast"

    # =========================================================
    # OpenWeatherMap / WeatherAPI (Global Surface Telemetry)
    # =========================================================
    OWM_API_KEY: str = os.getenv("OWM_API_KEY", "YOUR_OWM_API_KEY")
    OWM_CURRENT_URL: str = "https://api.openweathermap.org/data/2.5/weather"
    OWM_FORECAST_URL: str = "https://api.openweathermap.org/data/2.5/forecast"
    OWM_AIR_QUALITY_URL: str = "http://api.openweathermap.org/data/2.5/air_pollution"

    # =========================================================
    # Open-Meteo (Free Convective Indices: CAPE / CIN / IWV)
    # =========================================================
    OPEN_METEO_BASE_URL: str = os.getenv(
        "OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1/forecast"
    )

    # =========================================================
    # RainViewer (Doppler Radar Mosaic Tiles)
    # =========================================================
    RAINVIEWER_BASE_URL: str = os.getenv(
        "RAINVIEWER_BASE_URL", "https://api.rainviewer.com/public/weather-maps.json"
    )

    # =========================================================
    # Default Location — Delhi NCR
    # =========================================================
    DEFAULT_LAT: float = float(os.getenv("DEFAULT_LAT", "28.6139"))
    DEFAULT_LON: float = float(os.getenv("DEFAULT_LON", "77.2090"))
    DEFAULT_LOCATION_NAME: str = "Delhi NCR, India"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    # Cache TTLs (seconds)
    WEATHER_CACHE_TTL: int = 300   # 5 min
    RADAR_CACHE_TTL: int = 600     # 10 min


settings = Settings()
