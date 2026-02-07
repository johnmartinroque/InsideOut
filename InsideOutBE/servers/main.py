from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/")
def home():
    return "Flask server is running!"

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok"})

@app.route("/data", methods=["POST"])
def receive_data():
    data = request.json
    print("Received:", data)
    return jsonify({"message": "Data received"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
