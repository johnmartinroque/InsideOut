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

# ---- GSR EMOTION + MWL ----
EMOTION_PATH = "../models/gsrEmotion/"
emotion_model = joblib.load(EMOTION_PATH + "model.pkl")
emotion_scaler = joblib.load(EMOTION_PATH + "scaler.pkl")
emotion_encoder = joblib.load(EMOTION_PATH + "label_encoder.pkl")

MWL_PATH = "../models/gsrMWL/"
mwl_model = joblib.load(MWL_PATH + "model.pkl")
mwl_scaler = joblib.load(MWL_PATH + "scaler.pkl")

# ---- BPM EMOTION ----
BPM_PATH = "../models/heartbeatEmotion/"
bpm_model = joblib.load(BPM_PATH + "model.pkl")
bpm_scaler = joblib.load(BPM_PATH + "scaler.pkl")
bpm_encoder = joblib.load(BPM_PATH + "label_encoder.pkl")

print("✅ Combined GSR + BPM server ready")

# Store latest prediction
latest_prediction = {
    "gsr": None,
    "gsr_emotion": {"label": None, "confidence": None},
    "mwl": {"label": None, "confidence": None},
    "bpm": None,
    "bpm_emotion": {"label": None, "confidence": None}
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
        if not data or "device" not in data or "value" not in data:
            return jsonify({"error": "Missing device or value"}), 400

        device = data["device"]
        value = float(data["value"])

        if device == "gsr":
            # ---------------- GSR EMOTION ----------------
            X = np.array([[value]])
            X_scaled = emotion_scaler.transform(X)
            pred = emotion_model.predict(X_scaled)[0]
            emotion_label = emotion_encoder.inverse_transform([pred])[0]

            confidence_emotion = None
            if hasattr(emotion_model, "predict_proba"):
                proba = emotion_model.predict_proba(X_scaled)[0]
                confidence_emotion = round(max(proba)*100,1)

            # ---------------- MWL ----------------
            X_mwl = extract_gsr_features_for_prediction(value)
            X_mwl_scaled = mwl_scaler.transform(X_mwl)
            pred_mwl = mwl_model.predict(X_mwl_scaled)[0]
            mwl_label = "High MWL" if pred_mwl == 1 else "Low MWL"

            confidence_mwl = None
            if hasattr(mwl_model, "predict_proba"):
                proba = mwl_model.predict_proba(X_mwl_scaled)[0]
                confidence_mwl = round(proba[pred_mwl]*100,1)

            latest_prediction.update({
                "gsr": round(value, 3),
                "gsr_emotion": {"label": emotion_label, "confidence": confidence_emotion},
                "mwl": {"label": mwl_label, "confidence": confidence_mwl}
            })

            print(f"GSR = {value:.3f}, Emotion = {emotion_label} ({confidence_emotion}%), MWL = {mwl_label} ({confidence_mwl}%)")

        elif device == "bpm":
            # ---------------- BPM EMOTION ----------------
            X = np.array([[value]])
            X_scaled = bpm_scaler.transform(X)
            pred = bpm_model.predict(X_scaled)[0]
            bpm_label = bpm_encoder.inverse_transform([pred])[0]

            confidence = None
            if hasattr(bpm_model, "predict_proba"):
                prob = bpm_model.predict_proba(X_scaled)[0]
                confidence = round(max(prob)*100,1)

            latest_prediction.update({
                "bpm": int(value),
                "bpm_emotion": {"label": bpm_label, "confidence": confidence}
            })

            print(f"BPM = {value}, Emotion = {bpm_label} ({confidence}%)")

        else:
            return jsonify({"error": "Unknown device"}), 400

        return jsonify({"status": "success"}), 200

    except Exception as e:
        print("⚠️ Server Error:\n", traceback.format_exc())
        return jsonify({"status":"error","message":str(e)}),500

# ======================================================
# GET LATEST RESULT
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