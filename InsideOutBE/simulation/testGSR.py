import requests
import random
import time

# ==============================
# CONFIG
# ==============================
URL = "http://127.0.0.1:5000/predict"
INTERVAL = 2   # seconds

print("Sending random GSR data...\n")

while True:
    try:
        # generate random GSR value
        gsr_value = round(random.uniform(0.1, 5.0), 3)

        payload = {"gsr": gsr_value}

        # send request
        requests.post(URL, json=payload)

        # print ONLY what is sent
        print(f"Sent GSR: {gsr_value}")

    except Exception as e:
        print("Connection error:", e)

    time.sleep(INTERVAL)
