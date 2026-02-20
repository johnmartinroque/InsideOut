# train_svm_heart_model.py

import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.svm import SVC

import warnings
warnings.filterwarnings('ignore')

# ============================================================
# 1. LOAD DATA
# ============================================================
print("Loading dataset...")
df = pd.read_csv("../datasets/heart_rate_emotion_dataset.csv")

# remove unwanted emotions
df = df[~df["Emotion"].isin(["fear", "disgust", "surprise", "angry"])]

print("\nClass distribution:")
print(df["Emotion"].value_counts())

# ============================================================
# 2. FEATURES & LABELS
# ============================================================
X = df[["HeartRate"]].values
y = df["Emotion"].values

# Encode labels
encoder = LabelEncoder()
y = encoder.fit_transform(y)

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Scale
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# ============================================================
# 3. MODEL
# ============================================================
model = SVC(kernel="rbf", probability=True)

# ============================================================
# 4. TRAIN
# ============================================================
print("\nTraining SVM model...")
model.fit(X_train, y_train)

# ============================================================
# 5. TEST
# ============================================================
preds = model.predict(X_test)

acc = accuracy_score(y_test, preds)
cv = cross_val_score(model, X, y, cv=5)

print("\n================================================")
print("SVM MODEL RESULTS (HeartRate → Emotion)")
print("================================================")

print("\nTest Accuracy:", round(acc,4))
print("CV Mean:", round(np.mean(cv),4), "+/-", round(np.std(cv),4))

print("\nClassification Report:\n", classification_report(y_test, preds))
print("Confusion Matrix:\n", confusion_matrix(y_test, preds))

# ============================================================
# 6. SAVE MODEL
# ============================================================
save_dir = "../models/heartbeatEmotion"
os.makedirs(save_dir, exist_ok=True)

joblib.dump(model, f"{save_dir}/model.pkl")
joblib.dump(scaler, f"{save_dir}/scaler.pkl")
joblib.dump(encoder, f"{save_dir}/label_encoder.pkl")

results = pd.DataFrame([{
    "Model": "SVM RBF",
    "Test Accuracy": acc,
    "CV Mean": np.mean(cv),
    "CV Std": np.std(cv)
}])

results.to_csv(f"{save_dir}/results.csv", index=False)

print("\n✅ Model saved to:", save_dir)
print("Saved files:")
print(" - model.pkl")
print(" - scaler.pkl")
print(" - label_encoder.pkl")
print(" - results.csv")
