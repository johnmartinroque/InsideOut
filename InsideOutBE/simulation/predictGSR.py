from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import traceback

# ---------------- APP ----------------
app = Flask(__name__)
CORS(app)

# ---------------- LOAD GSR MODELS ----------------
EMOTION_PATH = "../models/gsrEmotion/"
emotion_model = joblib.load(EMOTION_PATH + "model.pkl")
emotion_scaler = joblib.load(EMOTION_PATH + "scaler.pkl")
emotion_encoder = joblib.load(EMOTION_PATH + "label_encoder.pkl")

MWL_PATH = "../models/gsrMWL/"
mwl_model = joblib.load(MWL_PATH + "model.pkl")
mwl_scaler = joblib.load(MWL_PATH + "scaler.pkl")

print("✅ GSR prediction server ready")

# ---------------- LATEST PREDICTION ----------------
latest_prediction = {
    "gsr": None,
    "gsr_emotion": {"label": None, "confidence": None},
    "mwl": {"label": None, "confidence": None}
}

# ---------------- HELPER: PREDICT GSR ----------------
def predict_gsr(value):
    # GSR Emotion
    X_emotion = np.array([[value]])
    X_scaled = emotion_scaler.transform(X_emotion)
    pred_val = emotion_model.predict(X_scaled)[0]
    emotion_label = emotion_encoder.inverse_transform([pred_val])[0]
    confidence_emotion = None
    if hasattr(emotion_model, "predict_proba"):
        proba = emotion_model.predict_proba(X_scaled)[0]
        confidence_emotion = round(max(proba)*100, 1)

    # MWL
    X_mwl = np.array([[value] * mwl_model.n_features_in_])
    pred_val_mwl = mwl_model.predict(X_mwl)[0]
    mwl_label = "High MWL" if pred_val_mwl == 1 else "Low MWL"
    confidence_mwl = None
    if hasattr(mwl_model, "predict_proba"):
        proba = mwl_model.predict_proba(X_mwl)[0]
        confidence_mwl = round(proba[pred_val_mwl]*100, 1)

    return {
        "gsr": round(value, 3),
        "gsr_emotion": {"label": emotion_label, "confidence": confidence_emotion},
        "mwl": {"label": mwl_label, "confidence": confidence_mwl}
    }

# ---------------- RECEIVE DATA ----------------
@app.route("/data", methods=["POST"])
def receive_data():
    global latest_prediction
    try:
        data = request.json
        device = data.get("device")
        value = data.get("value")

        if device != "gsr":
            return jsonify({"error": "only GSR data is supported"}), 400

        value = float(value)
        latest_prediction = predict_gsr(value)

        # Print nicely
        print(f"GSR = {latest_prediction['gsr']}")
        print(f"GSR Emotion {latest_prediction['gsr_emotion']['label']} "
              f"({latest_prediction['gsr_emotion']['confidence']}%)")
        print(f"MWL {latest_prediction['mwl']['label']} "
              f"({latest_prediction['mwl']['confidence']}%)\n")

        return jsonify(latest_prediction), 200

    except Exception as e:
        print("⚠️ Server Error:\n", traceback.format_exc())
        return jsonify({"status":"error","message":str(e)}), 500

# ---------------- LATEST PREDICTION ----------------
@app.route("/latest", methods=["GET"])
def get_latest():
    return jsonify(latest_prediction), 200

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    print("🚀 Flask server running on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
