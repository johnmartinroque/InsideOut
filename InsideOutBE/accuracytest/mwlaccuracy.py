import os
import pandas as pd
import numpy as np

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
warnings.filterwarnings('ignore')


# =====================================================
# PATH CONFIG
# =====================================================
BASE_PATH = os.path.join("..", "datasets", "gsr")
HIGH_PATH = os.path.join(BASE_PATH, "High_MWL")
LOW_PATH  = os.path.join(BASE_PATH, "Low_MWL")



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

        # smooth signal
        if len(data) >= 5:
            data = savgol_filter(data, 5, 2)

        # ----- stats -----
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

        # ----- temporal -----
        diffs = np.diff(data)
        col_features.extend([
            np.mean(np.abs(diffs)),
            np.std(diffs),
            np.max(np.abs(diffs)),
            np.sqrt(np.mean(data**2))
        ])

        # ----- peaks -----
        peaks, prop = find_peaks(data, height=np.mean(data))
        heights = prop["peak_heights"] if "peak_heights" in prop else []

        col_features.extend([
            len(peaks),
            np.mean(heights) if len(heights) else 0,
            np.max(heights) if len(heights) else 0
        ])

        # ----- frequency -----
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
def load_data(high_path, low_path):

    X, y = [], []

    # ----- HIGH MWL -----
    for i in range(2, 26):
        file = os.path.join(high_path, f"p{i}h.csv")
        if not os.path.exists(file):
            continue

        df = pd.read_csv(file, header=None)
        df = df.apply(pd.to_numeric, errors="coerce").dropna()

        if not df.empty:
            X.append(extract_gsr_features(df))
            y.append(1)
            print("Loaded High:", file)

    # ----- LOW MWL -----
    for i in range(2, 26):
        file = os.path.join(low_path, f"p{i}l.csv")
        if not os.path.exists(file):
            continue

        df = pd.read_csv(file, header=None)
        df = df.apply(pd.to_numeric, errors="coerce").dropna()

        if not df.empty:
            X.append(extract_gsr_features(df))
            y.append(0)
            print("Loaded Low:", file)

    return np.array(X), np.array(y)


# =====================================================
# MODEL TESTING
# =====================================================
def evaluate_models(X, y):

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    models = {
        "Logistic Regression": LogisticRegression(max_iter=2000),
        "SVM": SVC(),
        "Random Forest": RandomForestClassifier(n_estimators=200),
        "Gradient Boosting": GradientBoostingClassifier(),
        "KNN": KNeighborsClassifier(),
        "Neural Network": MLPClassifier(max_iter=2000)
    }

    results = {}

    print("\n================ RESULTS ================\n")

    for name, model in models.items():

        try:
            if name in ["Logistic Regression","SVM","KNN","Neural Network"]:
                model.fit(X_train_s, y_train)
                pred = model.predict(X_test_s)
                cv = cross_val_score(model, scaler.transform(X), y, cv=5)
            else:
                model.fit(X_train, y_train)
                pred = model.predict(X_test)
                cv = cross_val_score(model, X, y, cv=5)

            acc = accuracy_score(y_test, pred)

            results[name] = (acc, cv.mean(), cv.std())

            print(f"{name}")
            print("Accuracy:", round(acc,4))
            print("CV mean:", round(cv.mean(),4))
            print("CV std:", round(cv.std(),4))
            print()

        except Exception as e:
            print(name,"FAILED:",e)

    return results


# =====================================================
# MAIN
# =====================================================
if __name__ == "__main__":

    print("Loading data...\n")

    X, y = load_data(HIGH_PATH, LOW_PATH)

    print("\nDataset Summary")
    print("Samples:", len(X))
    print("High:", np.sum(y==1))
    print("Low:", np.sum(y==0))
    print("Feature length:", X.shape[1])

    results = evaluate_models(X,y)

    print("\n============= SUMMARY TABLE =============")
    print(f"{'Model':<22} {'Acc':<8} {'CV Mean':<10} {'CV Std':<10}")
    print("-"*55)

    for k,v in results.items():
        print(f"{k:<22} {v[0]:<8.4f} {v[1]:<10.4f} {v[2]:<10.4f}")
