from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

latest_data = {
    "gsr": None,
    "bpm": None
}

@app.route("/data", methods=["POST"])
def receive():
    data = request.json

    device = data.get("device")
    value = data.get("value")

    if device not in latest_data:
        return jsonify({"error":"unknown device"}), 400

    latest_data[device] = {
        "value": value,
        "time": datetime.now().strftime("%H:%M:%S")
    }

    print(f"[{device.upper()}] {value}")

    return jsonify({"status":"received"})


@app.route("/status")
def status():
    return jsonify(latest_data)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
