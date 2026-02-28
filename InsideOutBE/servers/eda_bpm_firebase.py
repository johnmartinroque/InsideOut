from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import traceback
from datetime import datetime
from zoneinfo import ZoneInfo
import firebase_admin
from firebase_admin import credentials, firestore
from triggerAlert import check_and_alert


# =================== FIREBASE INIT ===================
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

USER_ID = "alcHApCZqkI4l4XKUbRw"
SAVE_INTERVAL = 30
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
    global last_save_time, gsr_values, bpm_values

    if not gsr_values and not bpm_values:
        return

    now = datetime.now(TZ)
    start_time = last_save_time or now
    end_time = now

    time_range = f"{start_time.strftime('%I:%M %p')} - {end_time.strftime('%I:%M %p')}"
    day_doc_id = f"{now.day}{months[now.month-1]}"
    time_doc_id = now.strftime("%H%M%S")

    # --- interval averages ---
    interval_avg_gsr = round(np.mean(gsr_values), 3) if gsr_values else None
    interval_avg_bpm = round(np.mean(bpm_values)) if bpm_values else None

    day_doc_ref = readings_ref.document(day_doc_id)

    # ---------- SAVE INTERVAL ----------
    day_doc_ref.collection("times").document(time_doc_id).set({
        "timestamp": now,
        "timeRange": time_range,
        "gsr_interval_avg": interval_avg_gsr,
        "hb_interval_avg": interval_avg_bpm
    })

    # ---------- UPDATE DAY AVERAGES SEPARATELY ----------
    day_doc = day_doc_ref.get()

    if day_doc.exists:
        data = day_doc.to_dict()

        prev_gsr_avg = data.get("averageGSR", 0)
        prev_bpm_avg = data.get("averageHB", 0)

        gsr_count = data.get("gsrCount", 0)
        hb_count = data.get("hbCount", 0)

    else:
        prev_gsr_avg = 0
        prev_bpm_avg = 0
        gsr_count = 0
        hb_count = 0

    update_data = {}

    # ----- UPDATE GSR -----
    if interval_avg_gsr is not None:
        new_gsr_count = gsr_count + 1
        new_gsr_avg = round(
            ((prev_gsr_avg * gsr_count) + interval_avg_gsr) / new_gsr_count,
            3
        )

        update_data["averageGSR"] = new_gsr_avg
        update_data["gsrCount"] = new_gsr_count

    # ----- UPDATE BPM -----
    if interval_avg_bpm is not None:
        new_hb_count = hb_count + 1
        new_bpm_avg = round(
            ((prev_bpm_avg * hb_count) + interval_avg_bpm) / new_hb_count
        )

        update_data["averageHB"] = new_bpm_avg
        update_data["hbCount"] = new_hb_count

    # Save updates
    if update_data:
        day_doc_ref.set(update_data, merge=True)

    print(f"Saved interval → {day_doc_id}/{time_doc_id}")

    # reset buffers
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

            check_and_alert(latest_prediction)

            gsr_values.append(value)

            print(f"GSR = {value:.3f} μS | "f"Emotion = {emotion_label} ({confidence_emotion}%) | "f"MWL = {mwl_label} ({confidence_mwl}%)")

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

            print(f"BPM = {int(value)} | "f"Emotion = {bpm_label} ({confidence}%)")

        else:
            return jsonify({"error":"Unknown device"}), 400

        # --- SAVE TO FIREBASE PERIODICALLY ---
        now = datetime.now(TZ)

        # Start timer only after first valid data
        if last_save_time is None:
            last_save_time = now

        # Save only if interval passed AND both buffers have data
        elif (now - last_save_time).total_seconds() >= SAVE_INTERVAL:
            if gsr_values or bpm_values:
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