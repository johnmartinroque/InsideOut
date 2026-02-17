from flask import Flask, request, jsonify
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# ---------------- FIREBASE INIT ----------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ---------------- CONFIG ----------------
USER_ID = "QV6m7zrKxSP4PnMjcVab"
SAVE_INTERVAL = 30  # seconds

months = ["jan","feb","mar","apr","may","jun",
          "jul","aug","sep","oct","nov","dec"]

readings_ref = db.collection("elderly").document(USER_ID).collection("readings")

# ---------------- APP ----------------
app = Flask(__name__)

latest_data = {
    "gsr": None,
    "bpm": None
}

last_save_time = None


# ---------------- SAVE FUNCTION ----------------
def save_to_firestore():
    global last_save_time

    now = datetime.now()

    day_doc_id = f"{now.day}{months[now.month-1]}"
    time_doc_id = now.strftime("%H%M%S")  # include seconds now

    data = {
        "timestamp": now,
        "gsr": latest_data["gsr"],
        "heart_rate": latest_data["bpm"],
        "status": "unknown"
    }

    readings_ref \
        .document(day_doc_id) \
        .collection("times") \
        .document(time_doc_id) \
        .set(data)

    last_save_time = now
    print(f"Saved → {day_doc_id}/times/{time_doc_id}")


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

    print(f"[{device.upper()}] {value}")

    # save only every 30 seconds
    now = datetime.now()

    if latest_data["gsr"] is not None and latest_data["bpm"] is not None:
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
