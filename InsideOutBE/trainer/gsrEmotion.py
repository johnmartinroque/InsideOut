import pandas as pd
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier

# ---------------- PATHS ----------------
data_path = os.path.join("..", "datasets", "gsr", "mental_health_wearable_data.csv")
save_dir = os.path.join("..", "models", "gsrEmotion")
os.makedirs(save_dir, exist_ok=True)

model_path = os.path.join(save_dir, "gsr_emotion_model.pkl")
encoder_path = os.path.join(save_dir, "label_encoder.pkl")

# ---------------- LOAD DATA ----------------
df = pd.read_csv(data_path)

# Keep only Calm + Stressed
df = df[df["Emotional_State"].isin(["Calm", "Stressed"])]
df = df.dropna()

# ---------------- FEATURES ----------------
X = df[["GSR_Values"]]
y = df["Emotional_State"]

# Encode labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# ---------------- SPLIT ----------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# ---------------- PIPELINE MODEL ----------------
model = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", RandomForestClassifier(n_estimators=200))
])

# ---------------- TRAIN ----------------
model.fit(X_train, y_train)

# ---------------- SAVE ----------------
joblib.dump(model, model_path)
joblib.dump(encoder, encoder_path)

print("✅ Model saved to:", model_path)
print("✅ Encoder saved to:", encoder_path)
