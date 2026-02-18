from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ======================================================
# LOAD MODEL FILES
# ======================================================
MODEL_PATH = "../models/gsrEmotion/"

model = joblib.load(MODEL_PATH + "model.pkl")
scaler = joblib.load(MODEL_PATH + "scaler.pkl")
encoder = joblib.load(MODEL_PATH + "label_encoder.pkl")

print("✅ Emotion prediction server ready")

# ======================================================
# ROUTES
# ======================================================

@app.route("/")
def home():
    return jsonify({"status": "Server running"})

# ------------------------------------------------------
# PREDICT
# ------------------------------------------------------
@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    if not data or "gsr" not in data:
        return jsonify({"error": "Missing GSR value"}), 400

    gsr_value = float(data["gsr"])

    # prepare input
    X = np.array([[gsr_value]])
    X = scaler.transform(X)

    # predict
    pred = model.predict(X)[0]
    emotion = encoder.inverse_transform([pred])[0]

    # confidence
    if hasattr(model, "predict_proba"):
        prob = model.predict_proba(X)[0]
        confidence = float(np.max(prob))
    else:
        confidence = None

    # ==================================================
    # PRINT RESULT IN SERVER TERMINAL
    # ==================================================
    timestamp = datetime.now().strftime("%H:%M:%S")

    print(
        f"[{timestamp}] GSR={gsr_value} → Emotion={emotion}"
        + (f" (Confidence={confidence:.2f})" if confidence else "")
    )

    # response
    return jsonify({
        "gsr": gsr_value,
        "emotion": emotion,
        "confidence": confidence
    })


# ======================================================
# RUN
# ======================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
