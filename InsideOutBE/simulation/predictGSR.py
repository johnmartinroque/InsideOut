from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
from datetime import datetime
import traceback

app = Flask(__name__)
CORS(app)

# ======================================================
# LOAD MODELS
# ======================================================
EMOTION_PATH = "../models/gsrEmotion/"
emotion_model = joblib.load(EMOTION_PATH + "model.pkl")
emotion_scaler = joblib.load(EMOTION_PATH + "scaler.pkl")
emotion_encoder = joblib.load(EMOTION_PATH + "label_encoder.pkl")  # Calm/Stressed labels

MWL_PATH = "../models/gsrMWL/"
mwl_model = joblib.load(MWL_PATH + "model.pkl")
mwl_scaler = joblib.load(MWL_PATH + "scaler.pkl")  # optional scaler if MWL used one

print("✅ Emotion + MWL prediction server ready")

# ======================================================
# /predict/all endpoint
# ======================================================
@app.route("/predict/all", methods=["POST"])
def predict_all():
    try:
        data = request.json
        if not data or "gsr" not in data:
            return jsonify({"error": "Missing GSR value"}), 400

        gsr_value = float(data["gsr"])

        # ---------------- Emotion Prediction ----------------
        X_emotion = np.array([[gsr_value]])
        try:
            X_scaled = emotion_scaler.transform(X_emotion)
        except:
            expected_features = getattr(emotion_scaler, "n_features_in_", 1)
            X_emotion = np.array([[gsr_value] * expected_features])
            X_scaled = emotion_scaler.transform(X_emotion)

        pred_val = emotion_model.predict(X_scaled)[0]
        emotion_label = emotion_encoder.inverse_transform([pred_val])[0]

        confidence_emotion = None
        if hasattr(emotion_model, "predict_proba"):
            proba = emotion_model.predict_proba(X_scaled)[0]
            confidence_emotion = max(proba) * 100

        # ---------------- MWL Prediction ----------------
        X_mwl = np.array([[gsr_value] * mwl_model.n_features_in_])
        pred_val_mwl = mwl_model.predict(X_mwl)[0]
        mwl_label = "High MWL" if pred_val_mwl == 1 else "Low MWL"

        confidence_mwl = None
        if hasattr(mwl_model, "predict_proba"):
            proba = mwl_model.predict_proba(X_mwl)[0]
            confidence_mwl = round(proba[pred_val_mwl]*100,1)

        # ---------------- Print nicely ----------------
        print(f"GSR = {gsr_value:.3f}")
        print(f"Emotion {emotion_label} ({round(confidence_emotion,1) if confidence_emotion else 'N/A'}%)")
        print(f"MWL {mwl_label} ({confidence_mwl if confidence_mwl else 'N/A'}%)\n")

        # ---------------- Return JSON ----------------
        return jsonify({
            "gsr": gsr_value,
            "emotion": {
                "label": emotion_label,
                "confidence": round(confidence_emotion,1) if confidence_emotion else None
            },
            "mwl": {
                "label": mwl_label,
                "confidence": confidence_mwl
            }
        }), 200

    except Exception as e:
        print("⚠️ Server Error:\n", traceback.format_exc())
        return jsonify({"status":"error","message":str(e)}),500


# ======================================================
# RUN SERVER
# ======================================================
if __name__ == "__main__":
    print("🚀 Flask server running on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
