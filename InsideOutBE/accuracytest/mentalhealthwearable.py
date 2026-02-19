# accuracy.py
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
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# 1. LOAD DATA
# ============================================================
print("Loading dataset...")
df = pd.read_csv("../datasets/mental_health_wearable_data.csv")

# Keep only Calm & Stressed
df = df[df['Emotional_State'].isin(['Calm', 'Stressed'])]

print("\nClass distribution:")
print(df['Emotional_State'].value_counts())

# Check columns exist
required_cols = ['GSR_Values', 'Emotional_State']
for col in required_cols:
    if col not in df.columns:
        raise ValueError(f"Column '{col}' not found.")

# ============================================================
# 2. FEATURES & LABELS
# ============================================================
X = df[['GSR_Values']].values
y = df['Emotional_State'].values

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

print("\n================================================")
print("MODEL ACCURACY RESULTS (GSR → Emotion)")
print("================================================")

for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    acc = accuracy_score(y_test, preds)
    cv = cross_val_score(model, X, y, cv=5)

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
print(summary.sort_values(by="Test Accuracy", ascending=False))

best = summary.loc[summary['Test Accuracy'].idxmax()]
print("\n🏆 BEST MODEL:")
print(best)
