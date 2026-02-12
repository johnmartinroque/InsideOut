import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from sklearn.svm import SVC

# ----------------------------
# Paths
# ----------------------------
DATA_PATH = "../datasets/heart_rate_emotion_dataset.csv"

BASE_MODEL_DIR = "../models"
MODEL_DIR = os.path.join(BASE_MODEL_DIR, "heartbeatEmotion")

MODEL_PATH = os.path.join(MODEL_DIR, "svm_emotion_model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

# create models/heartbeatEmotion folder if not exists
os.makedirs(MODEL_DIR, exist_ok=True)

# ----------------------------
# Load Dataset
# ----------------------------
df = pd.read_csv(DATA_PATH)

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
# Train SVM Model
# ----------------------------
model = SVC(kernel="rbf", probability=True)
model.fit(X_train, y_train)

# ----------------------------
# Evaluate
# ----------------------------
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"\nSVM Accuracy: {accuracy * 100:.2f}%")

# ----------------------------
# Save Model + Encoder
# ----------------------------
joblib.dump(model, MODEL_PATH)
joblib.dump(encoder, ENCODER_PATH)

print("\nModel saved to:", MODEL_PATH)
print("Encoder saved to:", ENCODER_PATH)
