from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import traceback
from datetime import datetime
from zoneinfo import ZoneInfo
import firebase_admin
from firebase_admin import credentials, firestore

# =================== FIREBASE INIT ===================
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

USER_ID = "QV6m7zrKxSP4PnMjcVab"
SAVE_INTERVAL = 30  # seconds
TZ = ZoneInfo("Asia/Manila")
months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]

readings_ref = db.collection("elderly").document(USER_ID).collection("readings")

# =================== APP ===================
app = Flask(__name__)
CORS(app)

# =================== LOAD MODELS ===================
EMOTION_PATH = "../models/gsrEmotion/"
emotion_model = joblib.load(EMOTION_PATH + "model.pkl")
emotion_scaler = joblib.load(EMOTION_PATH + "scaler.pkl")
emotion_encoder = joblib.load(EMOTION_PATH + "label_encoder.pkl")

MWL_PATH = "../models/gsrMWL/"
mwl_model = joblib.load(MWL_PATH + "model.pkl")
mwl_scaler = joblib.load(MWL_PATH + "scaler.pkl")

BPM_PATH = "../models/heartbeatEmotion/"
bpm_model = joblib.load(BPM_PATH + "model.pkl")
bpm_scaler = joblib.load(BPM_PATH + "scaler.pkl")
bpm_encoder = joblib.load(BPM_PATH + "label_encoder.pkl")

print("✅ Combined GSR + BPM server ready")

# =================== GLOBAL STATE ===================
latest_prediction = {
    "gsr": None,
    "bpm": None,
    "gsr_emotion": {"label": None, "confidence": None},
    "mwl": {"label": None, "confidence": None},
    "bpm_emotion": {"label": None, "confidence": None}
}

gsr_values = []
bpm_values = []
last_save_time = None

# =================== MWL FEATURE EXTRACTION ===================
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

# =================== FIREBASE SAVE ===================
def save_to_firestore():
    global last_save_time, gsr_values, bpm_values, latest_prediction
    if not gsr_values and not bpm_values:
        return

    now = datetime.now(TZ)
    day_doc_id = f"{now.day}{months[now.month-1]}"
    time_doc_id = now.strftime("%H%M%S")

    avg_gsr = round(sum(gsr_values)/len(gsr_values),3) if gsr_values else None
    avg_bpm = round(sum(bpm_values)/len(bpm_values)) if bpm_values else None

    day_doc_ref = readings_ref.document(day_doc_id)
    day_doc_ref.set({
        "averageGSR": avg_gsr,
        "averageHB": avg_bpm
    }, merge=True)

    day_doc_ref.collection("times").document(time_doc_id).set({
        "timestamp": now,
        "gsr": latest_prediction["gsr"],
        "heart_rate": latest_prediction["bpm"],
        "gsr_emotion": latest_prediction["gsr_emotion"]["label"],
        "mwl": latest_prediction["mwl"]["label"],
        "bpm_emotion": latest_prediction["bpm_emotion"]["label"]
    })

    print(f"Saved → {day_doc_id}/times/{time_doc_id} | day averages updated")

    gsr_values = []
    bpm_values = []
    last_save_time = now

# =================== RECEIVE DATA ===================
@app.route("/data", methods=["POST"])
def receive_data():
    global latest_prediction, gsr_values, bpm_values, last_save_time
    try:
        data = request.json
        if not data or "device" not in data or "value" not in data:
            return jsonify({"error": "Missing device or value"}), 400

        device = data["device"]
        value = float(data["value"])

        if device == "gsr":
            # --- GSR EMOTION ---
            X = np.array([[value]])
            X_scaled = emotion_scaler.transform(X)
            pred = emotion_model.predict(X_scaled)[0]
            emotion_label = emotion_encoder.inverse_transform([pred])[0]
            confidence_emotion = round(max(emotion_model.predict_proba(X_scaled)[0])*100,1) if hasattr(emotion_model,"predict_proba") else None

            # --- MWL ---
            X_mwl = extract_gsr_features_for_prediction(value)
            X_mwl_scaled = mwl_scaler.transform(X_mwl)
            pred_mwl = mwl_model.predict(X_mwl_scaled)[0]
            mwl_label = "High MWL" if pred_mwl == 1 else "Low MWL"
            confidence_mwl = round(max(mwl_model.predict_proba(X_mwl_scaled)[0])*100,1) if hasattr(mwl_model,"predict_proba") else None

            latest_prediction.update({
                "gsr": round(value,3),
                "gsr_emotion": {"label": emotion_label, "confidence": confidence_emotion},
                "mwl": {"label": mwl_label, "confidence": confidence_mwl}
            })

            gsr_values.append(value)

            print(f"GSR = {value:.3f}, Emotion = {emotion_label}, MWL = {mwl_label}")

        elif device == "bpm":
            # --- BPM EMOTION ---
            X = np.array([[value]])
            X_scaled = bpm_scaler.transform(X)
            pred = bpm_model.predict(X_scaled)[0]
            bpm_label = bpm_encoder.inverse_transform([pred])[0]
            confidence = round(max(bpm_model.predict_proba(X_scaled)[0])*100,1) if hasattr(bpm_model,"predict_proba") else None

            latest_prediction.update({
                "bpm": int(value),
                "bpm_emotion": {"label": bpm_label, "confidence": confidence}
            })

            bpm_values.append(value)

            print(f"BPM = {value}, Emotion = {bpm_label}")

        else:
            return jsonify({"error":"Unknown device"}), 400

        # --- SAVE TO FIREBASE PERIODICALLY ---
        now = datetime.now(TZ)
        if last_save_time is None or (now - last_save_time).total_seconds() >= SAVE_INTERVAL:
            save_to_firestore()

        return jsonify(latest_prediction), 200

    except Exception as e:
        print("⚠️ Server Error:\n", traceback.format_exc())
        return jsonify({"status":"error","message":str(e)}),500

# =================== GET LATEST ===================
@app.route("/latest", methods=["GET"])
def get_latest():
    return jsonify(latest_prediction), 200

# =================== RUN SERVER ===================
if __name__ == "__main__":
    print("🚀 Server running → http://0.0.0.0:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)