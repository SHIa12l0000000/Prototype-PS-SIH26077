import numpy as np
from typing import Dict, Any, List

FEATURE_NAMES = [
    "temperature_c",
    "relative_humidity_pct",
    "precipitation_mm",
    "surface_pressure_hpa",
    "cloud_cover_pct",
    "wind_speed_kmh",
    "wind_gusts_kmh",
    "elevation_m",
    "slope_deg"
]

def extract_feature_vector(features_dict: Dict[str, Any]) -> np.ndarray:
    """
    Normalizes input feature dictionary into numpy vector for inference.
    """
    vector = []
    vector.append(float(features_dict.get("temperature_c", 25.0)))
    vector.append(float(features_dict.get("relative_humidity_pct", 60.0)))
    vector.append(float(features_dict.get("precipitation_mm", 0.0)))
    vector.append(float(features_dict.get("surface_pressure_hpa", 1013.0)))
    vector.append(float(features_dict.get("cloud_cover_pct", 50.0)))
    vector.append(float(features_dict.get("wind_speed_kmh", 15.0)))
    vector.append(float(features_dict.get("wind_gusts_kmh", 25.0)))
    vector.append(float(features_dict.get("elevation_m", 200.0)))
    vector.append(float(features_dict.get("slope_deg", 5.0)))
    return np.array(vector).reshape(1, -1)
