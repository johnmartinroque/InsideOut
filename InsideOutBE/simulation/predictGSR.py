from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)

# ======================================================
# LOAD GSR EMOTION MODEL
# ======================================================
EMOTION_PATH = "../models/gsrEmotion/"
emotion_model = joblib.load(EMOTION_PATH + "model.pkl")
emotion_scaler = joblib.load(EMOTION_PATH + "scaler.pkl")
emotion_encoder = joblib.load(EMOTION_PATH + "label_encoder.pkl")

print("✅ GSR Emotion prediction server ready")

# ======================================================
# /predict/gsr endpoint
# ======================================================
@app.route("/predict/gsr", methods=["POST"])
def predict_gsr():
    try:
        data = request.json
        if not data or "gsr" not in data:
            return jsonify({"error": "Missing GSR value"}), 400

        gsr_value = float(data["gsr"])

        # ---------------- GSR Emotion Prediction ----------------
        X_emotion = np.array([[gsr_value]])
        X_scaled = emotion_scaler.transform(X_emotion)

        pred_val = emotion_model.predict(X_scaled)[0]
        emotion_label = emotion_encoder.inverse_transform([pred_val])[0]

        confidence_emotion = None
        if hasattr(emotion_model, "predict_proba"):
            proba = emotion_model.predict_proba(X_scaled)[0]
            confidence_emotion = round(max(proba)*100, 1)

        # ---------------- Print nicely ----------------
        print(f"GSR = {gsr_value:.3f}")
        print(f"GSR Emotion: {emotion_label} ({confidence_emotion if confidence_emotion else 'N/A'}%)\n")

        # ---------------- Return JSON ----------------
        return jsonify({
            "gsr": gsr_value,
            "gsr_emotion": {
                "label": emotion_label,
                "confidence": confidence_emotion
            }
        }), 200

    except Exception as e:
        print("⚠️ Server Error:\n", traceback.format_exc())
        return jsonify({"status":"error","message":str(e)}), 500

# ======================================================
# RUN SERVER
# ======================================================
if __name__ == "__main__":
    print("🚀 Flask server running on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
