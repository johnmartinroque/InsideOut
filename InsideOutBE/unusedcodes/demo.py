import requests
import random
import time

# =========================
# CONFIG
# =========================
SERVER_URL = "http://127.0.0.1:5001/data"

EDA_INTERVAL = 10  # EDA updates every 10 seconds
print("Starting realistic GSR + BPM sender...\n")

last_eda_time = 0
next_bpm_time = time.time() + random.uniform(2, 10)

while True:
    try:
        current_time = time.time()

        # =========================
        # EDA (Every 10 seconds)
        # =========================
        if current_time - last_eda_time >= EDA_INTERVAL:
            eda_value = round(random.uniform(1.650, 1.750), 3)

            eda_payload = {
                "device": "gsr",
                "value": eda_value
            }

            eda_response = requests.post(SERVER_URL, json=eda_payload)
            print(f"EDA Sent: {eda_value} → Status {eda_response.status_code}")

            last_eda_time = current_time

        # =========================
        # BPM (Random 2–10 sec)
        # =========================
        if current_time >= next_bpm_time:

            # 10% spike chance
            if random.random() < 0.10:
                bpm_value = random.randint(100, 105)
            else:
                bpm_value = random.randint(70, 90)

            bpm_payload = {
                "device": "bpm",
                "value": bpm_value
            }

            bpm_response = requests.post(SERVER_URL, json=bpm_payload)
            print(f"BPM Sent: {bpm_value} → Status {bpm_response.status_code}")
            print("Server Response:", bpm_response.json())
            print("-" * 50)

            # Schedule next random BPM send
            next_bpm_time = current_time + random.uniform(2, 10)

        time.sleep(0.1)  # Small sleep to prevent CPU overuse

    except KeyboardInterrupt:
        print("\nStopped sender.")
        break

    except Exception as e:
        print("Error:", e)
        time.sleep(3)