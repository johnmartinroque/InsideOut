from flask import Flask, request, jsonify

app = Flask(__name__)

latest_bpm = 0

@app.route("/bpm", methods=["POST"])
def receive_bpm():
    global latest_bpm
    data = request.json
    latest_bpm = data["bpm"]

    print("Received BPM:", latest_bpm)

    return jsonify({"status": "ok"})


@app.route("/status")
def status():
    return jsonify({
        "bpm": latest_bpm,
        "esp32": "connected" if latest_bpm > 0 else "waiting"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
