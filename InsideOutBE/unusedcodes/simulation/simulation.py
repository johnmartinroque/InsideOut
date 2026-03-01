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

# ---- BPM EMOTION ----
BPM_PATH = "../models/heartbeatEmotion/"
bpm_model = joblib.load(BPM_PATH + "model.pkl")
bpm_scaler = joblib.load(BPM_PATH + "scaler.pkl")
bpm_encoder = joblib.load(BPM_PATH + "label_encoder.pkl")

print("✅ Emotion + MWL + BPM prediction server ready")

# Store the latest prediction for frontend
latest_prediction = {
    "gsr": None,
    "bpm": None,
    "gsr_emotion": {"label": None, "confidence": None},
    "mwl": {"label": None, "confidence": None},
    "bpm_emotion": {"label": None, "confidence": None}
}

# ======================================================
# FEATURE EXTRACTION FOR MWL
# ======================================================
def extract_gsr_features_for_prediction(gsr_value):
    """
    Create feature vector from a single GSR value to match MWL model training
    Features: mean, std, min, max, median, 25th/75th percentile, ptp, diff mean/std/max
    """
    data = np.array([gsr_value])
    diff = np.array([0])  # single value => diff = 0
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
# /predict/all endpoint (POST)
# ======================================================
@app.route("/predict/all", methods=["POST"])
def predict_all():
    global latest_prediction
    try:
        data = request.json
        if not data or "gsr" not in data or "bpm" not in data:
            return jsonify({"error": "Missing GSR or BPM value"}), 400

        gsr_value = float(data["gsr"])
        bpm_value = float(data["bpm"])

        # ---------------- GSR Emotion ----------------
        X_emotion = np.array([[gsr_value]])
        X_scaled = emotion_scaler.transform(X_emotion)
        pred_val = emotion_model.predict(X_scaled)[0]
        emotion_label = emotion_encoder.inverse_transform([pred_val])[0]

        confidence_emotion = None
        if hasattr(emotion_model, "predict_proba"):
            proba = emotion_model.predict_proba(X_scaled)[0]
            confidence_emotion = round(max(proba)*100,1)

        # ---------------- MWL ----------------
        X_mwl = extract_gsr_features_for_prediction(gsr_value)
        X_mwl_scaled = mwl_scaler.transform(X_mwl)
        pred_val_mwl = mwl_model.predict(X_mwl_scaled)[0]
        mwl_label = "High MWL" if pred_val_mwl == 1 else "Low MWL"

        confidence_mwl = None
        if hasattr(mwl_model, "predict_proba"):
            proba = mwl_model.predict_proba(X_mwl_scaled)[0]
            confidence_mwl = round(proba[pred_val_mwl]*100, 1)

        # ---------------- BPM Emotion ----------------
        X_bpm = np.array([[bpm_value]])
        X_bpm_scaled = bpm_scaler.transform(X_bpm)
        bpm_pred = bpm_model.predict(X_bpm_scaled)[0]
        bpm_label = bpm_encoder.inverse_transform([bpm_pred])[0]

        bpm_conf = None
        if hasattr(bpm_model, "predict_proba"):
            bpm_proba = bpm_model.predict_proba(X_bpm_scaled)[0]
            bpm_conf = round(max(bpm_proba)*100,1)

        # ---------------- Save latest prediction ----------------
        latest_prediction = {
            "gsr": round(gsr_value, 3),
            "bpm": int(bpm_value),
            "gsr_emotion": {"label": emotion_label, "confidence": confidence_emotion},
            "mwl": {"label": mwl_label, "confidence": confidence_mwl},
            "bpm_emotion": {"label": bpm_label, "confidence": bpm_conf}
        }

        # ---------------- Print nicely ----------------
        print(f"GSR = {gsr_value:.3f} | BPM = {bpm_value}")
        print(f"GSR Emotion {emotion_label} ({confidence_emotion if confidence_emotion else 'N/A'}%)")
        print(f"MWL {mwl_label} ({confidence_mwl if confidence_mwl else 'N/A'}%)")
        print(f"BPM Emotion {bpm_label} ({bpm_conf if bpm_conf else 'N/A'}%)\n")

        return jsonify(latest_prediction), 200

    except Exception as e:
        print("⚠️ Server Error:\n", traceback.format_exc())
        return jsonify({"status":"error","message":str(e)}),500

# ======================================================
# /latest endpoint (GET)
# ======================================================
@app.route("/latest", methods=["GET"])
def get_latest():
    return jsonify(latest_prediction), 200

# ======================================================
# RUN SERVER
# ======================================================
if __name__ == "__main__":
    print("🚀 Flask server running on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)