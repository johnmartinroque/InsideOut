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

# Emotion Model
EMOTION_PATH = "../models/gsrEmotion/"
emotion_model = joblib.load(EMOTION_PATH + "model.pkl")
emotion_scaler = joblib.load(EMOTION_PATH + "scaler.pkl")
emotion_encoder = joblib.load(EMOTION_PATH + "label_encoder.pkl")  # Calm/Stressed labels

# MWL Model
MWL_PATH = "../models/gsrMWL/"
mwl_model = joblib.load(MWL_PATH + "model.pkl")
mwl_scaler = joblib.load(MWL_PATH + "scaler.pkl")  # optional scaler if MWL used one

print("✅ Emotion + MWL prediction server ready")

# Latest Reading
latest_reading = {
    "gsr_value": None,
    "emotion": {},
    "mwl": {}
}

# ======================================================
# HOME
# ======================================================
@app.route("/")
def home():
    return jsonify({"status": "Server running"})


# ======================================================
# EMOTION PREDICTION (single GSR value)
# ======================================================
@app.route("/predict/emotion", methods=["POST"])
def predict_emotion():
    try:
        data = request.json
        if not data or "gsr" not in data:
            return jsonify({"error": "Missing GSR value"}), 400

        gsr_value = float(data["gsr"])

        # Scale input
        X = np.array([[gsr_value]])
        try:
            X_scaled = emotion_scaler.transform(X)
        except:
            expected_features = getattr(emotion_scaler, "n_features_in_", 1)
            X = np.array([[gsr_value] * expected_features])
            X_scaled = emotion_scaler.transform(X)

        # Predict
        pred_val = emotion_model.predict(X_scaled)[0]
        emotion_label = emotion_encoder.inverse_transform([pred_val])[0]

        confidence_val = None
        all_percentages = None
        if hasattr(emotion_model, "predict_proba"):
            proba = emotion_model.predict_proba(X_scaled)[0]
            all_percentages = {
                str(cls): round(p * 100, 1)
                for cls, p in zip(emotion_model.classes_, proba)
            }
            confidence_val = max(proba) * 100

        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] 🧠 Emotion → GSR={gsr_value:.3f} → {emotion_label} ({round(confidence_val,1) if confidence_val else 'N/A'}%)")

        return jsonify({
            "gsr": gsr_value,
            "emotion": emotion_label,
            "confidence": round(confidence_val, 1) if confidence_val else None,
            "all_percentages": all_percentages
        })

    except Exception as e:
        print("⚠️ Emotion Prediction Error:\n", traceback.format_exc())
        return jsonify({"error": str(e)}), 500


# ======================================================
# MWL PREDICTION (list of GSR values)
# ======================================================
@app.route("/predict/mwl", methods=["POST"])
def predict_mwl():
    try:
        data = request.json
        if not data or "gsr_series" not in data:
            return jsonify({"error": "Missing gsr_series"}), 400

        series = np.array(data["gsr_series"]).reshape(1, -1)
        # Scale if scaler exists
        try:
            X_scaled = mwl_scaler.transform(series)
        except:
            X_scaled = series

        pred_val = mwl_model.predict(X_scaled)[0]
        mwl_label = "High MWL" if pred_val == 1 else "Low MWL"

        confidence_val = None
        all_percentages = None
        if hasattr(mwl_model, "predict_proba"):
            proba = mwl_model.predict_proba(X_scaled)[0]
            all_percentages = {
                "Low MWL": round(proba[0] * 100, 1),
                "High MWL": round(proba[1] * 100, 1)
            }
            confidence_val = all_percentages[mwl_label]

        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] 💼 MWL → {mwl_label} ({confidence_val if confidence_val else 'N/A'}%)")

        return jsonify({
            "mwl": mwl_label,
            "confidence": confidence_val,
            "all_percentages": all_percentages
        })

    except Exception as e:
        print("⚠️ MWL Prediction Error:\n", traceback.format_exc())
        return jsonify({"error": str(e)}), 500


# ======================================================
# BOTH PREDICTIONS (single GSR value)
# ======================================================
@app.route("/predict/all", methods=["POST"])
def predict_all():
    global latest_reading
    try:
        data = request.json
        if not data or "gsr" not in data:
            return jsonify({"error": "Missing GSR value"}), 400

        gsr_value = float(data["gsr"])
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # ---------- Emotion ----------
        emotion_result = {"prediction": None, "confidence": None, "all_percentages": None, "timestamp": timestamp}
        X = np.array([[gsr_value]])
        try:
            X_scaled = emotion_scaler.transform(X)
        except:
            expected_features = getattr(emotion_scaler, "n_features_in_", 1)
            X = np.array([[gsr_value] * expected_features])
            X_scaled = emotion_scaler.transform(X)

        pred_val = emotion_model.predict(X_scaled)[0]
        pred_label = emotion_encoder.inverse_transform([pred_val])[0]

        confidence_val = None
        all_percentages = None
        if hasattr(emotion_model, "predict_proba"):
            proba = emotion_model.predict_proba(X_scaled)[0]
            all_percentages = {str(cls): round(p * 100,1) for cls,p in zip(emotion_model.classes_, proba)}
            confidence_val = max(proba)*100

        emotion_result.update({
            "prediction": pred_label,
            "confidence": round(confidence_val,1) if confidence_val else None,
            "all_percentages": all_percentages
        })
        print(f"[{timestamp}] 🧠 Emotion → GSR={gsr_value:.3f} → {pred_label} ({round(confidence_val,1) if confidence_val else 'N/A'}%)")

        # ---------- MWL ----------
        mwl_result = {"prediction": None, "confidence": None, "all_percentages": None, "timestamp": timestamp}
        X_mwl = np.array([[gsr_value]*mwl_model.n_features_in_])
        pred_val = mwl_model.predict(X_mwl)[0]
        pred_label_mwl = "High MWL" if pred_val==1 else "Low MWL"

        confidence_val = None
        all_percentages = None
        if hasattr(mwl_model, "predict_proba"):
            proba = mwl_model.predict_proba(X_mwl)[0]
            all_percentages = {"Low MWL": round(proba[0]*100,1),"High MWL": round(proba[1]*100,1)}
            confidence_val = all_percentages[pred_label_mwl]

        mwl_result.update({
            "prediction": pred_label_mwl,
            "confidence": confidence_val,
            "all_percentages": all_percentages
        })
        print(f"[{timestamp}] 💼 MWL → {pred_label_mwl} ({confidence_val if confidence_val else 'N/A'}%)")

        # ---------- Save latest ----------
        latest_reading = {
            "gsr_value": gsr_value,
            "emotion": emotion_result,
            "mwl": mwl_result
        }

        return jsonify(latest_reading), 200

    except Exception as e:
        print("⚠️ Server Error:\n", traceback.format_exc())
        return jsonify({"status":"error","message":str(e)}),500


# ======================================================
# RUN SERVER
# ======================================================
if __name__ == "__main__":
    print("🚀 Flask server running on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
