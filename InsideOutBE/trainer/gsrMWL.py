import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib

# Paths for GSR data
high_path = "../datasets/gsr/High_MWL"
low_path = "../datasets/gsr/Low_MWL"

# Lists of available files
high_files = [2, 3, 5, 6, 10, 11, 12, 13, 16, 19, 20, 21, 23]
low_files = [3, 4, 5, 6, 8, 10, 13, 14, 15, 16, 17, 18, 20, 22, 23, 24, 25]


# ================= FEATURE EXTRACTION =================
def extract_gsr_features(column_data):
    column_data = pd.to_numeric(column_data, errors="coerce").dropna()

    features = [
        np.mean(column_data),
        np.std(column_data),
        np.min(column_data),
        np.max(column_data),
        np.median(column_data),
        np.percentile(column_data, 25),
        np.percentile(column_data, 75),
        np.ptp(column_data),
    ]

    if len(column_data) > 1:
        differences = np.diff(column_data)
        features.extend([
            np.mean(np.abs(differences)),
            np.std(differences),
            np.max(np.abs(differences)),
        ])
    else:
        features.extend([0, 0, 0])

    return features


# ================= LOAD DATA =================
def load_gsr_data():
    X, y = [], []

    # High MWL
    for i in high_files:
        filepath = os.path.join(high_path, f"p{i}h.csv")
        if os.path.exists(filepath):
            df = pd.read_csv(filepath, header=None)
            features = extract_gsr_features(df.iloc[:, 0])
            X.append(features)
            y.append(1)

    # Low MWL
    for i in low_files:
        filepath = os.path.join(low_path, f"p{i}l.csv")
        if os.path.exists(filepath):
            df = pd.read_csv(filepath, header=None)
            features = extract_gsr_features(df.iloc[:, 0])
            X.append(features)
            y.append(0)

    return np.array(X), np.array(y)


# ================= TRAIN MODEL =================
X, y = load_gsr_data()
print(f"Total samples: {len(X)}, Features: {X.shape[1]}")

# Scale features (keep scaler for compatibility with server)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 🔥 RANDOM FOREST INSTEAD OF LOGISTIC REGRESSION
rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    random_state=42
)

rf_model.fit(X_scaled, y)

# ================= SAVE MODEL =================
MWL_PATH = "../models/gsrMWL/"
os.makedirs(MWL_PATH, exist_ok=True)

joblib.dump(rf_model, MWL_PATH + "model.pkl")
joblib.dump(scaler, MWL_PATH + "scaler.pkl")

print("✅ MWL Random Forest model trained and saved!")


