# accuracy.py
import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier

import warnings
warnings.filterwarnings('ignore')

# ============================================================
# 1. LOAD DATA
# ============================================================
print("Loading dataset...")
df = pd.read_csv("../datasets/mental_health_wearable_data.csv")

df = df[df['Emotional_State'].isin(['Calm', 'Stressed'])]

print("\nClass distribution:")
print(df['Emotional_State'].value_counts())

# ============================================================
# 2. FEATURES & LABELS
# ============================================================
X = df[['GSR_Values']].values
y = df['Emotional_State'].values

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
# 3. MODELS
# ============================================================
models = {
    "Logistic Regression": LogisticRegression(),
    "SVM (RBF)": SVC(kernel='rbf', probability=True),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "Gradient Boosting": GradientBoostingClassifier(random_state=42),
    "KNN": KNeighborsClassifier(n_neighbors=5),
    "MLP Neural Net": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42)
}

# ============================================================
# 4. TRAIN & TEST
# ============================================================
results = []
trained_models = {}

print("\n================================================")
print("MODEL ACCURACY RESULTS (GSR → Emotion)")
print("================================================")

for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    acc = accuracy_score(y_test, preds)
    cv = cross_val_score(model, X, y, cv=5)

    trained_models[name] = model

    results.append({
        "Model": name,
        "Test Accuracy": acc,
        "CV Mean": np.mean(cv),
        "CV Std": np.std(cv)
    })

    print(f"\n{name}")
    print("Test Accuracy:", round(acc,4))
    print("CV Mean:", round(np.mean(cv),4), "+/-", round(np.std(cv),4))
    print("Classification Report:\n", classification_report(y_test, preds))
    print("Confusion Matrix:\n", confusion_matrix(y_test, preds))

# ============================================================
# 5. SUMMARY
# ============================================================
print("\n================================================")
print("SUMMARY TABLE")
print("================================================")

summary = pd.DataFrame(results)
summary = summary.sort_values(by="Test Accuracy", ascending=False)
print(summary)

best_name = summary.iloc[0]["Model"]
best_model = trained_models[best_name]

print("\n🏆 BEST MODEL:", best_name)

# ============================================================
# 6. SAVE BEST MODEL
# ============================================================

save_dir = "../models/gsrEmotion"
os.makedirs(save_dir, exist_ok=True)

joblib.dump(best_model, f"{save_dir}/model.pkl")
joblib.dump(scaler, f"{save_dir}/scaler.pkl")
joblib.dump(encoder, f"{save_dir}/label_encoder.pkl")
summary.to_csv(f"{save_dir}/results.csv", index=False)

print("\n✅ Best model saved to:", save_dir)
print("Saved files:")
print(" - model.pkl")
print(" - scaler.pkl")
print(" - label_encoder.pkl")
print(" - results.csv")
