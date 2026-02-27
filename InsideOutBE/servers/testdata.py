import requests
import random
import time

# =========================
# CONFIG
# =========================
SERVER_URL = "http://127.0.0.1:5001/data"  # change if hosted elsewhere
INTERVAL = 3  # seconds between sends

print("Starting random GSR + BPM sender...\n")

while True:
    try:
        # -------- RANDOM GSR --------
        gsr_value = round(random.uniform(0.1, 5.0), 3)
        gsr_payload = {
            "device": "gsr",
            "value": gsr_value
        }

        gsr_response = requests.post(SERVER_URL, json=gsr_payload)
        print(f"GSR Sent: {gsr_value} → Status {gsr_response.status_code}")

        # -------- RANDOM BPM --------
        bpm_value = random.randint(60, 120)
        bpm_payload = {
            "device": "bpm",
            "value": bpm_value
        }

        bpm_response = requests.post(SERVER_URL, json=bpm_payload)
        print(f"BPM Sent: {bpm_value} → Status {bpm_response.status_code}")

        print("Server Response:", bpm_response.json())
        print("-" * 50)

        time.sleep(INTERVAL)

    except KeyboardInterrupt:
        print("\nStopped sender.")
        break

    except Exception as e:
        print("Error:", e)
        time.sleep(3)