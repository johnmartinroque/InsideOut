import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# ---------------- INIT ----------------
app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(__file__)

emotion_model_path = os.path.join(BASE_DIR, "..", "models", "gsrEmotion", "gsr_emotion_model.pkl")
mwl_model_path = os.path.join(BASE_DIR, "..", "models", "gsrMWL", "gsrMWL_model.pkl")

# ---------------- LOAD MODELS ----------------
try:
    emotion_model = joblib.load(emotion_model_path)
    print("✅ Emotion model loaded")
except Exception as e:
    print("❌ Failed to load Emotion model:", e)
    exit()

try:
    mwl_model = joblib.load(mwl_model_path)
    print("✅ MWL model loaded")
except Exception as e:
    print("❌ Failed to load MWL model:", e)
    exit()

# ---------------- ROUTES ----------------

@app.route("/")
def home():
    return "GSR Prediction Server Running"

@app.route("/status")
def status():
    return jsonify({
        "server": "running",
        "models_loaded": True
    })

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        gsr = float(data["gsr"])

        sample = np.array([[gsr]])

        emotion = emotion_model.predict(sample)[0]
        mwl = mwl_model.predict(sample)[0]

        return jsonify({
            "gsr": gsr,
            "emotion_state": str(emotion),
            "mental_workload": str(mwl)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
