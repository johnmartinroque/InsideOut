from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# Store latest sensor data
latest_data = {
    "gsr_value": None,
    "heartbeat": None
}

@app.route("/")
def home():
    return "Flask server is running!"

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok"})

# ESP32 sends data here
@app.route("/data", methods=["POST"])
def receive_data():
    global latest_data

    data = request.json
    print("Received:", data)

    # Update stored values
    latest_data["gsr_value"] = data.get("gsr_value")
    latest_data["heartbeat"] = data.get("heartbeat")

    return jsonify({"message": "Data received"})

# React frontend fetches here
@app.route("/status", methods=["GET"])
def status():
    return jsonify(latest_data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
