import pandas as pd
import random
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

# Models
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier

# ----------------------------
# Load Dataset
# ----------------------------
data_path = "../datasets/heart_rate_emotion_dataset.csv"
df = pd.read_csv(data_path)

# ----------------------------
# Remove unwanted emotions
# ----------------------------
exclude_emotions = ["surprise", "fear", "disgust"]
df = df[~df["Emotion"].isin(exclude_emotions)]

# ----------------------------
# Features & Labels
# ----------------------------
X = df[["HeartRate"]]
y = df["Emotion"]

# Encode labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# ----------------------------
# Train-Test Split
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

# ----------------------------
# Models to Compare
# ----------------------------
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "KNN": KNeighborsClassifier(n_neighbors=3),
    "SVM": SVC(probability=True),  # IMPORTANT
    "Decision Tree": DecisionTreeClassifier(),
    "Random Forest": RandomForestClassifier(n_estimators=100)
}

# ----------------------------
# Generate 10 Random Heart Rates
# ----------------------------
random_heartbeats = [random.randint(55, 110) for _ in range(10)]
random_data = pd.DataFrame(random_heartbeats, columns=["HeartRate"])

print("\nRandom Heartbeat Test Values:")
print(random_heartbeats)

# ----------------------------
# Train & Evaluate
# ----------------------------
print("\nModel Results:\n")

for name, model in models.items():
    model.fit(X_train, y_train)

    # Accuracy
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    print(f"================ {name} ================")
    print(f"Accuracy: {accuracy * 100:.2f}%")

    # Probability predictions
    probs = model.predict_proba(random_data)
    pred_indexes = np.argmax(probs, axis=1)
    decoded_preds = encoder.inverse_transform(pred_indexes)

    print("Predictions:")
    for hr, emotion, prob in zip(random_heartbeats, decoded_preds, probs):
        confidence = max(prob) * 100
        print(f"HeartRate {hr} → {emotion} ({confidence:.2f}%)")

    print("\n")
