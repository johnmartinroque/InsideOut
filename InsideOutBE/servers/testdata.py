from flask import Flask, jsonify
import random
import threading
import time
import requests

app = Flask(__name__)

SEND_INTERVAL = 2  # seconds
SERVER_URL = "http://127.0.0.1:5000/data" 


latest_sent = {
    "gsr_value": None,
    "heartbeat": None
}

# Starting realistic base values
gsr_value = 4.0  # microsiemens, typical GSR
heartbeat = 70   # bpm, typical resting heart rate

def smooth_random_walk(value, min_val, max_val, step=0.1):
    """Simulate smooth changes in sensor values."""
    change = random.uniform(-step, step)
    value += change
    value = max(min_val, min(max_val, value))
    return round(value, 2)

def simulate_sensor_data():
    global latest_sent, gsr_value, heartbeat
    while True:
        gsr_value = smooth_random_walk(gsr_value, 2.0, 7.0, step=0.05)
        heartbeat = smooth_random_walk(heartbeat, 60, 100, step=1.0)

        latest_sent = {
            "gsr_value": gsr_value,
            "heartbeat": heartbeat
        }

        # Print locally
        print(f"📊 Simulator → GSR: {gsr_value} μS | Heartbeat: {heartbeat} bpm")

        # Send to Flask averaging server
        try:
            requests.post(SERVER_URL, json=latest_sent, timeout=1)
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Failed to send: {e}")

        time.sleep(SEND_INTERVAL)

# ---------- API ----------
@app.route("/status", methods=["GET"])
def status():
    return jsonify(latest_sent)

# ---------- Run ----------
if __name__ == "__main__":
    print("🚀 GSR & Heartbeat Simulator Running (Terminal Output Only)...")
    threading.Thread(target=simulate_sensor_data, daemon=True).start()
    app.run(host="0.0.0.0", port=5000)
