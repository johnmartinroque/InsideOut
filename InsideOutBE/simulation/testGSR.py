import requests
import random
import time

# ================= CONFIG =================
URL = "http://127.0.0.1:5001/data"  # Flask server endpoint
INTERVAL = 2  # seconds between sending data

print("📡 Sending random GSR data to server...\n")

while True:
    try:
        # Generate a random GSR value between 0.1 and 5.0
        gsr_value = round(random.uniform(0.1, 5.0), 3)

        # Prepare payload
        payload = {
            "device": "gsr",
            "value": gsr_value
        }

        # Send POST request
        response = requests.post(URL, json=payload)

        if response.status_code == 200:
            data = response.json()
            print(f"GSR = {data['gsr']}")
            print(f"Emotion {data['gsr_emotion']['label']} ({data['gsr_emotion']['confidence']}%)")
            print(f"MWL {data['mwl']['label']} ({data['mwl']['confidence']}%)\n")
        else:
            print("❌ Error:", response.json())

        # Wait before sending next value
        time.sleep(INTERVAL)

    except KeyboardInterrupt:
        print("🛑 Stopped sending data.")
        break
    except Exception as e:
        print("⚠️ Exception:", e)
        time.sleep(INTERVAL)
