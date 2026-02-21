from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)

# ======================================================
# LOAD MODELS
# ======================================================

# ---- BPM EMOTION ----
BPM_PATH = "../models/heartbeatEmotion/"
bpm_model = joblib.load(BPM_PATH + "model.pkl")
bpm_scaler = joblib.load(BPM_PATH + "scaler.pkl")
bpm_encoder = joblib.load(BPM_PATH + "label_encoder.pkl")

print("✅ BPM Emotion server ready")

# store latest prediction
latest_prediction = {
    "bpm": None,
    "bpm_emotion": {"label": None, "confidence": None}
}

# ======================================================
# ESP32 ENDPOINT
# ======================================================
@app.route("/data", methods=["POST"])
def receive_esp32():
    global latest_prediction
    try:
        data = request.json

        if not data or "value" not in data:
            return jsonify({"error":"Invalid JSON"}),400

        bpm_value = float(data["value"])

        # ---------- BPM EMOTION PREDICTION ----------
        X = np.array([[bpm_value]])
        X_scaled = bpm_scaler.transform(X)

        pred = bpm_model.predict(X_scaled)[0]
        label = bpm_encoder.inverse_transform([pred])[0]

        confidence = None
        if hasattr(bpm_model,"predict_proba"):
            prob = bpm_model.predict_proba(X_scaled)[0]
            confidence = round(max(prob)*100,1)

        latest_prediction = {
            "bpm": int(bpm_value),
            "bpm_emotion": {
                "label": label,
                "confidence": confidence
            }
        }

        print(f"BPM: {bpm_value} → Emotion: {label} ({confidence if confidence else 'N/A'}%)")

        return jsonify(latest_prediction),200

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error":str(e)}),500


# ======================================================
# FRONTEND FETCH ENDPOINT
# ======================================================
@app.route("/latest", methods=["GET"])
def get_latest():
    return jsonify(latest_prediction)


# ======================================================
# RUN SERVER
# ======================================================
if __name__ == "__main__":
    print("🚀 Server running on http://0.0.0.0:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)