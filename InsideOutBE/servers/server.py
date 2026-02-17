from flask import Flask, request, jsonify
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from zoneinfo import ZoneInfo
from flask_cors import CORS

# ---------------- FIREBASE INIT ----------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ---------------- CONFIG ----------------
USER_ID = "QV6m7zrKxSP4PnMjcVab"
SAVE_INTERVAL = 30  # seconds
TZ = ZoneInfo("Asia/Manila")

months = ["jan","feb","mar","apr","may","jun",
          "jul","aug","sep","oct","nov","dec"]

readings_ref = db.collection("elderly").document(USER_ID).collection("readings")

# ---------------- APP ----------------
app = Flask(__name__)
CORS(app)


latest_data = {"gsr": None, "bpm": None}
gsr_values = []
bpm_values = []
last_save_time = None

# ---------------- SAVE FUNCTION ----------------
def save_to_firestore():
    global last_save_time, gsr_values, bpm_values

    if not gsr_values or not bpm_values:
        return

    now = datetime.now(TZ)
    day_doc_id = f"{now.day}{months[now.month-1]}"
    time_doc_id = now.strftime("%H%M%S")

    # Compute averages for the day-level fields
    avg_gsr = round(sum(gsr_values)/len(gsr_values), 3)
    avg_bpm = round(sum(bpm_values)/len(bpm_values))

    # Save/update day document with averages
    day_doc_ref = readings_ref.document(day_doc_id)
    day_doc_ref.set({
        "averageGSR": avg_gsr,
        "averageHB": avg_bpm
    }, merge=True)

    # Save individual timestamped readings inside "times"
    day_doc_ref.collection("times").document(time_doc_id).set({
        "timestamp": now,
        "gsr": latest_data["gsr"],
        "heart_rate": latest_data["bpm"],
        "status": "unknown"
    })

    print(f"Saved → {day_doc_id}/times/{time_doc_id} | day averages updated")

    # reset buffers
    gsr_values = []
    bpm_values = []
    last_save_time = now

# ---------------- RECEIVE DATA ----------------
@app.route("/data", methods=["POST"])
def receive():
    global last_save_time

    data = request.json
    device = data.get("device")
    value = data.get("value")

    if device not in latest_data:
        return jsonify({"error":"unknown device"}), 400

    latest_data[device] = value

    # store for averaging
    if device == "gsr":
        gsr_values.append(float(value))
    elif device == "bpm":
        bpm_values.append(int(value))

    print(f"[{device.upper()}] {value}")

    now = datetime.now(TZ)
    if last_save_time is None or (now - last_save_time).total_seconds() >= SAVE_INTERVAL:
        save_to_firestore()

    return jsonify({"status":"received"})

# ---------------- STATUS ----------------
@app.route("/status")
def status():
    return jsonify(latest_data)

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
