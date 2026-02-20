import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

# MODELS
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

# ======================================
# LOAD DATASET
# ======================================
path = "../datasets/heart_rate_emotion_dataset.csv"
df = pd.read_csv(path)

print("\nOriginal Dataset Size:", len(df))

# ======================================
# REMOVE UNWANTED EMOTIONS
# ======================================
remove_labels = ["fear", "disgust", "surprise", "angry"]
df = df[~df["Emotion"].isin(remove_labels)]

print("Filtered Dataset Size:", len(df))
print("Remaining Labels:", df["Emotion"].unique())

# ======================================
# FEATURES / LABELS
# ======================================
X = df[["HeartRate"]]
y = df["Emotion"]

# Encode labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# ======================================
# TRAIN TEST SPLIT
# ======================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# ======================================
# MODELS TO TEST
# ======================================
models = {
    "Logistic Regression": LogisticRegression(),
    "Decision Tree": DecisionTreeClassifier(),
    "Random Forest": RandomForestClassifier(),
    "SVM": SVC(),
    "KNN": KNeighborsClassifier()
}

print("\n===== MODEL ACCURACY RESULTS =====\n")

best_model = None
best_score = 0

# ======================================
# TRAIN + EVALUATE
# ======================================
for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    acc = accuracy_score(y_test, preds)
    print(f"{name} Accuracy: {acc*100:.2f}%")

    if acc > best_score:
        best_score = acc
        best_model = name

# ======================================
# BEST MODEL
# ======================================
print("\n🏆 BEST MODEL:", best_model)
print(f"BEST ACCURACY: {best_score*100:.2f}%\n")
