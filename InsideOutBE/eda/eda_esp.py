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

# ---- GSR EMOTION ----
EMOTION_PATH = "../models/gsrEmotion/"
emotion_model = joblib.load(EMOTION_PATH + "model.pkl")
emotion_scaler = joblib.load(EMOTION_PATH + "scaler.pkl")
emotion_encoder = joblib.load(EMOTION_PATH + "label_encoder.pkl")

# ---- MWL ----
MWL_PATH = "../models/gsrMWL/"
mwl_model = joblib.load(MWL_PATH + "model.pkl")
mwl_scaler = joblib.load(MWL_PATH + "scaler.pkl")

print("✅ GSR Emotion + MWL server ready")

# Store latest prediction
latest_prediction = {
    "gsr": None,
    "gsr_emotion": {"label": None, "confidence": None},
    "mwl": {"label": None, "confidence": None}
}

# ======================================================
# FEATURE EXTRACTION FOR MWL
# ======================================================
def extract_gsr_features_for_prediction(gsr_value):
    data = np.array([gsr_value])
    diff = np.array([0])

    features = [
        np.mean(data),
        np.std(data),
        np.min(data),
        np.max(data),
        np.median(data),
        np.percentile(data, 25),
        np.percentile(data, 75),
        np.ptp(data),
        np.mean(np.abs(diff)),
        np.std(diff),
        np.max(np.abs(diff))
    ]

    return np.array(features).reshape(1, -1)

# ======================================================
# RECEIVE DATA FROM ESP32
# ======================================================
@app.route("/data", methods=["POST"])
def receive_data():
    global latest_prediction

    try:
        data = request.json

        if not data or "value" not in data:
            return jsonify({"error": "Missing value"}), 400

        gsr_value = float(data["value"])

        # ---------------- GSR EMOTION ----------------
        X = np.array([[gsr_value]])
        X_scaled = emotion_scaler.transform(X)
        pred = emotion_model.predict(X_scaled)[0]
        emotion_label = emotion_encoder.inverse_transform([pred])[0]

        confidence_emotion = None
        if hasattr(emotion_model, "predict_proba"):
            proba = emotion_model.predict_proba(X_scaled)[0]
            confidence_emotion = round(max(proba)*100,1)

        # ---------------- MWL ----------------
        X_mwl = extract_gsr_features_for_prediction(gsr_value)
        X_mwl_scaled = mwl_scaler.transform(X_mwl)
        pred_mwl = mwl_model.predict(X_mwl_scaled)[0]
        mwl_label = "High MWL" if pred_mwl == 1 else "Low MWL"

        confidence_mwl = None
        if hasattr(mwl_model, "predict_proba"):
            proba = mwl_model.predict_proba(X_mwl_scaled)[0]
            confidence_mwl = round(proba[pred_mwl]*100,1)

        # ---------------- SAVE RESULT ----------------
        latest_prediction = {
            "gsr": round(gsr_value, 3),
            "gsr_emotion": {
                "label": emotion_label,
                "confidence": confidence_emotion
            },
            "mwl": {
                "label": mwl_label,
                "confidence": confidence_mwl
            }
        }

        # ---------------- LOG ----------------
        print(f"GSR = {gsr_value:.3f}")
        print(f"Emotion = {emotion_label} ({confidence_emotion if confidence_emotion else 'N/A'}%)")
        print(f"MWL = {mwl_label} ({confidence_mwl if confidence_mwl else 'N/A'}%)\n")

        return jsonify({"status": "success"}), 200

    except Exception as e:
        print("⚠️ Server Error:\n", traceback.format_exc())
        return jsonify({"status":"error","message":str(e)}),500


# ======================================================
# GET LATEST RESULT (FOR FRONTEND)
# ======================================================
@app.route("/latest", methods=["GET"])
def get_latest():
    return jsonify(latest_prediction), 200


# ======================================================
# RUN SERVER
# ======================================================
if __name__ == "__main__":
    print("🚀 Server running → http://0.0.0.0:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)