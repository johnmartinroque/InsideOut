import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import joblib

# Paths for GSR data
high_path = "../datasets/gsr/High_MWL"
low_path = "../datasets/gsr/Low_MWL"

# Lists of available files
high_files = [2, 3, 5, 6, 10, 11, 12, 13, 16, 19, 20, 21, 23]
low_files = [3, 4, 5, 6, 8, 10, 13, 14, 15, 16, 17, 18, 20, 22, 23, 24, 25]

def extract_gsr_features_for_prediction(gsr_value):
    """Given a single GSR reading, create a pseudo-feature vector compatible with trained model"""
    # For a single value, differences are 0, percentiles are equal to the value
    data = np.array([gsr_value])
    diff = np.array([0])
    features = [
        np.mean(data),
        np.std(data),
        np.min(data),
        np.max(data),
        np.median(data),
        np.percentile(data, 25),
        np.percentile(data, 75),
        np.ptp(data),
        np.mean(np.abs(diff)),
        np.std(diff),
        np.max(np.abs(diff))
    ]
    return np.array(features).reshape(1, -1)

def load_gsr_data():
    X, y = [], []
    # High MWL
    for i in high_files:
        filepath = os.path.join(high_path, f"p{i}h.csv")
        if os.path.exists(filepath):
            df = pd.read_csv(filepath, header=None)
            X.append(extract_gsr_features(df.iloc[:,0]))
            y.append(1)
    # Low MWL
    for i in low_files:
        filepath = os.path.join(low_path, f"p{i}l.csv")
        if os.path.exists(filepath):
            df = pd.read_csv(filepath, header=None)
            X.append(extract_gsr_features(df.iloc[:,0]))
            y.append(0)
    return np.array(X), np.array(y)

# Load data
X, y = load_gsr_data()
print(f"Total samples: {len(X)}, Features: {X.shape[1]}")

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train logistic regression
lr_model = LogisticRegression(random_state=42, max_iter=1000)
lr_model.fit(X_scaled, y)

# Save model and scaler
MWL_PATH = "../models/gsrMWL/"
os.makedirs(MWL_PATH, exist_ok=True)
joblib.dump(lr_model, MWL_PATH + "model.pkl")
joblib.dump(scaler, MWL_PATH + "scaler.pkl")

print("✅ MWL Logistic Regression model trained and saved!")