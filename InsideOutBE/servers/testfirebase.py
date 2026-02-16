from flask import Flask, request, jsonify
import threading
import time
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from zoneinfo import ZoneInfo


# ---------------- FIREBASE INIT ----------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# ---------------- CONFIG ----------------
DOC_ID = "QV6m7zrKxSP4PnMjcVab"
INTERVAL = 300  # 10 minutes
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

            # Compute 10-minute interval average
            avg_gsr = round(sum(x["gsr"] for x in buffer) / len(buffer), 2)
            avg_hr = round(sum(x["hr"] for x in buffer) / len(buffer), 2)
            interval_count = len(buffer)

            buffer.clear()

        now = datetime.now(ZoneInfo("Asia/Manila"))

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

        # --- Save individual timestamped reading ---
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

        # --- Update running daily average ---
        daily_doc_ref = readings_ref.document(day_doc_id)
        daily_doc = daily_doc_ref.get().to_dict()

        if daily_doc and "count" in daily_doc and "averageGSR" in daily_doc and "averageHB" in daily_doc:
            old_count = daily_doc["count"]
            old_avg_gsr = daily_doc["averageGSR"]
            old_avg_hr = daily_doc["averageHB"]

            new_count = old_count + interval_count
            new_avg_gsr = round((old_avg_gsr * old_count + avg_gsr * interval_count) / new_count, 2)
            new_avg_hr = round((old_avg_hr * old_count + avg_hr * interval_count) / new_count, 2)
        else:
            # First interval of the day
            new_count = interval_count
            new_avg_gsr = avg_gsr
            new_avg_hr = avg_hr

        daily_doc_ref.set({
            "averageGSR": new_avg_gsr,
            "averageHB": new_avg_hr,
            "count": new_count,
            "lastUpdated": now
        }, merge=True)

        print(f"💾 Saved avg → {day_doc_id}/times/{time_doc_id} | GSR={avg_gsr} HR={avg_hr}")
        print(f"📊 Updated running daily averages → {day_doc_id} | averageGSR={new_avg_gsr} averageHB={new_avg_hr} (count={new_count})")



# ---------------- RUN ----------------
if __name__ == "__main__":
    print("🚀 Firebase Averaging Server Running...")
    threading.Thread(target=process_averages, daemon=True).start()
    app.run(host="0.0.0.0", port=5000)
