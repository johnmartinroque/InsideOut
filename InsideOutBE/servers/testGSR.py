import time
import requests
import random

# -------- CONFIG --------
URL = "http://127.0.0.1:5002/predict"   # change if server runs elsewhere
INTERVAL = 5  # seconds

print("Starting GSR test sender...")

while True:
    try:
        # generate fake GSR value (simulate sensor)
        gsr_value = round(random.uniform(0.1, 5.0), 3)

        payload = {"gsr": gsr_value}

        response = requests.post(URL, json=payload)

        print("Sent:", payload)

        if response.status_code == 200:
            print("Response:", response.json())
        else:
            print("Server error:", response.text)

    except Exception as e:
        print("Error:", e)

    time.sleep(INTERVAL)
