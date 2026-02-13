from flask import Flask, request, jsonify
import threading
import time
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# ---------------- FIREBASE INIT ----------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# ---------------- CONFIG ----------------
DOC_ID = "QV6m7zrKxSP4PnMjcVab"
INTERVAL = 600  # 10 minutes
months = ["jan","feb","mar","apr","may","jun",
          "jul","aug","sep","oct","nov","dec"]

readings_ref = db.collection("elderly").document(DOC_ID).collection("readings")

# ---------------- APP INIT ----------------
app = Flask(__name__)

# Temporary storage for incoming readings
buffer = []
lock = threading.Lock()

# ---------------- RECEIVE SENSOR DATA ----------------
@app.route("/data", methods=["POST"])
def receive_data():
    global buffer

    data = request.json

    if not data or "gsr_value" not in data or "heartbeat" not in data:
        return jsonify({"error": "Invalid data"}), 400

    gsr_val = float(data["gsr_value"])
    hr_val = float(data["heartbeat"])

    # Print incoming data
    print(f"📥 Received → GSR: {gsr_val} μS | Heartbeat: {hr_val} bpm")

    with lock:
        buffer.append({
            "gsr": gsr_val,
            "hr": hr_val
        })

    return jsonify({"message": "Data received"}), 200


# ---------------- AVERAGE + SAVE ----------------
def process_averages():
    global buffer

    while True:
        time.sleep(INTERVAL)

        with lock:
            if not buffer:
                print("No data received in last interval.")
                continue

            avg_gsr = round(sum(x["gsr"] for x in buffer) / len(buffer), 2)
            avg_hr = round(sum(x["hr"] for x in buffer) / len(buffer), 2)

            buffer.clear()

        now = datetime.now()

        # Parent doc ID → 12feb
        day_doc_id = f"{now.day}{months[now.month-1]}"

        # Subdoc ID → 1300
        time_doc_id = now.strftime("%H%M")

        # Simple status logic
        if avg_hr > 90 or avg_gsr > 5.5:
            status = "stressed"
        elif avg_hr < 70 and avg_gsr < 3.5:
            status = "calm"
        else:
            status = "neutral"

        data = {
            "timestamp": now,
            "gsr": avg_gsr,
            "heart_rate": avg_hr,
            "status": status
        }

        readings_ref \
            .document(day_doc_id) \
            .collection("times") \
            .document(time_doc_id) \
            .set(data)

        print(f"💾 Saved avg → {day_doc_id}/times/{time_doc_id} | GSR={avg_gsr} HR={avg_hr}")


# ---------------- RUN ----------------
if __name__ == "__main__":
    print("🚀 Firebase Averaging Server Running...")
    threading.Thread(target=process_averages, daemon=True).start()
    app.run(host="0.0.0.0", port=5000)
