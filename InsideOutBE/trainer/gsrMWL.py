# train_mwl_model.py

import os
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier

from scipy.signal import find_peaks, savgol_filter
from scipy.fft import fft

import warnings
warnings.filterwarnings("ignore")

# =====================================================
# PATH CONFIG
# =====================================================
BASE_PATH = os.path.join("..", "datasets", "gsr")
HIGH_PATH = os.path.join(BASE_PATH, "High_MWL")
LOW_PATH  = os.path.join(BASE_PATH, "Low_MWL")

SAVE_DIR = os.path.join("..", "models", "gsrMWL")
os.makedirs(SAVE_DIR, exist_ok=True)


# =====================================================
# FEATURE EXTRACTION
# =====================================================
def extract_gsr_features(df):

    features = []

    for col in df.columns:
        data = df[col].dropna().values

        if len(data) == 0:
            features.extend([0]*20)
            continue

        if len(data) >= 5:
            data = savgol_filter(data, 5, 2)

        col_features = [
            np.mean(data),
            np.std(data),
            np.min(data),
            np.max(data),
            np.median(data),
            np.percentile(data, 25),
            np.percentile(data, 75),
            np.ptp(data),
        ]

        diffs = np.diff(data)
        col_features.extend([
            np.mean(np.abs(diffs)),
            np.std(diffs),
            np.max(np.abs(diffs)),
            np.sqrt(np.mean(data**2))
        ])

        peaks, prop = find_peaks(data, height=np.mean(data))
        heights = prop["peak_heights"] if "peak_heights" in prop else []

        col_features.extend([
            len(peaks),
            np.mean(heights) if len(heights) else 0,
            np.max(heights) if len(heights) else 0
        ])

        fft_vals = np.abs(fft(data))[:len(data)//2]
        col_features.extend([
            np.mean(fft_vals),
            np.max(fft_vals)
        ])

        features.extend(col_features)

    return features


# =====================================================
# LOAD DATA
# =====================================================
def load_data():

    X, y = [], []

    for i in range(2,26):
        f = os.path.join(HIGH_PATH, f"p{i}h.csv")
        if os.path.exists(f):
            df = pd.read_csv(f, header=None)
            df = df.apply(pd.to_numeric, errors="coerce").dropna()
            if not df.empty:
                X.append(extract_gsr_features(df))
                y.append(1)

    for i in range(2,26):
        f = os.path.join(LOW_PATH, f"p{i}l.csv")
        if os.path.exists(f):
            df = pd.read_csv(f, header=None)
            df = df.apply(pd.to_numeric, errors="coerce").dropna()
            if not df.empty:
                X.append(extract_gsr_features(df))
                y.append(0)

    return np.array(X), np.array(y)


# =====================================================
# MAIN
# =====================================================
print("\nLoading data...")
X, y = load_data()

print("\nDataset Loaded")
print("Samples:", len(X))
print("High:", np.sum(y==1))
print("Low:", np.sum(y==0))
print("Feature length:", X.shape[1])


# =====================================================
# SPLIT + SCALE
# =====================================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)


# =====================================================
# MODELS
# =====================================================
models = {
    "Logistic Regression": LogisticRegression(max_iter=2000),
    "SVM": SVC(probability=True),
    "Random Forest": RandomForestClassifier(n_estimators=200),
    "Gradient Boosting": GradientBoostingClassifier(),
    "KNN": KNeighborsClassifier(),
    "Neural Network": MLPClassifier(max_iter=2000)
}

results = []
trained = {}

print("\n================ TRAINING MODELS ================\n")

for name, model in models.items():

    if name in ["Logistic Regression","SVM","KNN","Neural Network"]:
        model.fit(X_train_s, y_train)
        preds = model.predict(X_test_s)
        cv = cross_val_score(model, scaler.transform(X), y, cv=5)
    else:
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        cv = cross_val_score(model, X, y, cv=5)

    acc = accuracy_score(y_test, preds)

    trained[name] = model

    results.append({
        "Model": name,
        "Test Accuracy": acc,
        "CV Mean": np.mean(cv),
        "CV Std": np.std(cv)
    })

    print(name)
    print("Accuracy:", round(acc,4))
    print("CV Mean:", round(np.mean(cv),4))
    print("Confusion Matrix:\n", confusion_matrix(y_test,preds))
    print(classification_report(y_test,preds))


# =====================================================
# RESULTS TABLE
# =====================================================
summary = pd.DataFrame(results).sort_values(by="Test Accuracy", ascending=False)

print("\n================ SUMMARY TABLE ================\n")
print(summary)


# =====================================================
# BEST MODEL
# =====================================================
best_name = summary.iloc[0]["Model"]
best_model = trained[best_name]

print("\n🏆 BEST MODEL:", best_name)


# =====================================================
# SAVE FILES
# =====================================================
joblib.dump(best_model, f"{SAVE_DIR}/model.pkl")
joblib.dump(scaler, f"{SAVE_DIR}/scaler.pkl")
summary.to_csv(f"{SAVE_DIR}/results.csv", index=False)

print("\nSaved to:", SAVE_DIR)
print("Files:")
print(" - model.pkl")
print(" - scaler.pkl")
print(" - results.csv")
