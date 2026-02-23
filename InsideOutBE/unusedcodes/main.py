from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

latest_data = {
    "gsr_value": None,
    "heartbeat": None,
    "last_received": None,  # track last ESP32 data timestamp
    "esp32_connected": False
}

@app.route("/data", methods=["POST"])
def receive_data():
    global latest_data
    data = request.json
    print("Received:", data)

    # Update values
    latest_data["gsr_value"] = data.get("gsr_value")
    latest_data["heartbeat"] = data.get("heartbeat")
    latest_data["last_received"] = datetime.now().isoformat()

    # ESP32 is considered connected if it sends data
    latest_data["esp32_connected"] = True

    return jsonify({"message": "Data received"})

@app.route("/status", methods=["GET"])
def status():
    global latest_data
    # If last data was more than 10 seconds ago, mark disconnected
    if latest_data["last_received"]:
        last_time = datetime.fromisoformat(latest_data["last_received"])
        if datetime.now() - last_time > timedelta(seconds=10):
            latest_data["esp32_connected"] = False
    else:
        latest_data["esp32_connected"] = False

    return jsonify(latest_data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
