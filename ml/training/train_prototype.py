import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

def train_baseline_prototype():
    """
    Demonstration training script for synthetic atmospheric baseline data.
    Generates synthetic sample dataset matching expected feature shapes and exports model artifact.
    """
    print("[WEATHERGUARD AI ML] Generating synthetic benchmark training dataset...")
    np.random.seed(42)
    n_samples = 1000

    # Synthetic features: temp, humidity, rain, pressure, cloud, wind, gust, elev, slope
    X = np.zeros((n_samples, 9))
    X[:, 0] = np.random.uniform(15, 42, n_samples)   # temp
    X[:, 1] = np.random.uniform(30, 98, n_samples)   # humidity
    X[:, 2] = np.random.exponential(3.0, n_samples)  # rain
    X[:, 3] = np.random.uniform(995, 1020, n_samples)# pressure
    X[:, 4] = np.random.uniform(10, 100, n_samples)  # cloud
    X[:, 5] = np.random.uniform(5, 40, n_samples)    # wind
    X[:, 6] = X[:, 5] + np.random.uniform(5, 30, n_samples) # gust
    X[:, 7] = np.random.uniform(5, 3500, n_samples)  # elev
    X[:, 8] = np.random.uniform(0.5, 45, n_samples)  # slope

    # Target synthetic risk labels
    y_ts = np.clip((X[:, 1] * 0.3) + ((X[:, 0] - 18) * 1.2) + (X[:, 6] * 0.5) + np.random.normal(0, 5, n_samples), 0, 100)
    
    print("[WEATHERGUARD AI ML] Fitting Multi-Output Random Forest Model...")
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y_ts)

    os.makedirs("ml/models", exist_ok=True)
    model_path = "ml/models/prototype_rf_model.pkl"
    joblib.dump(model, model_path)
    print(f"[WEATHERGUARD AI ML] Model successfully trained and saved to {model_path}")

if __name__ == "__main__":
    train_baseline_prototype()
