import pandas as pd
import os

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

# Models
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

# ---------------- LOAD DATA ----------------
file_path = os.path.join("..", "datasets", "gsr", "mental_health_wearable_data.csv")
df = pd.read_csv(file_path)

# ---------------- FILTER ONLY CALM + STRESSED ----------------
df = df[df["Emotional_State"].isin(["Calm", "Stressed"])]

# Remove missing values
df = df.dropna()

# ---------------- FEATURES + LABEL ----------------
X = df[["GSR_Values"]]   # only GSR
y = df["Emotional_State"]

# Encode labels (Calm=0, Stressed=1 automatically)
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# ---------------- TRAIN TEST SPLIT ----------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# ---------------- MODELS ----------------
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Decision Tree": DecisionTreeClassifier(),
    "Random Forest": RandomForestClassifier(),
    "SVM": SVC(),
    "KNN": KNeighborsClassifier()
}

results = {}

# ---------------- TRAIN + EVALUATE ----------------
for name, model in models.items():

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("model", model)
    ])

    pipeline.fit(X_train, y_train)
    preds = pipeline.predict(X_test)

    acc = accuracy_score(y_test, preds)
    results[name] = acc

    print("\n==============================")
    print(f"MODEL: {name}")
    print("Accuracy:", round(acc, 4))
    print(classification_report(y_test, preds, target_names=label_encoder.classes_))

# ---------------- BEST MODEL ----------------
best_model = max(results, key=results.get)

print("\n==============================")
print("BEST MODEL:", best_model)
print("BEST ACCURACY:", round(results[best_model], 4))
