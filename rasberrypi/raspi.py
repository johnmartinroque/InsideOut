"""

sudo apt update
sudo apt install python3-pip
pip3 install requests firebase-admin


"""


import time
import requests
import firebase_admin
from firebase_admin import credentials, firestore

# ---------- Firebase Init ----------
cred = credentials.Certificate("serviceAccountKey.json")  # your downloaded key
firebase_admin.initialize_app(cred)
db = firestore.client()

# ---------- ESP32 Endpoint ----------
ESP32_IP = "http://192.168.100.50"  # replace with your ESP32 IP
ESP32_DATA_URL = f"{ESP32_IP}/data"

while True:
    try:
        # Get JSON from ESP32
        response = requests.get(ESP32_DATA_URL, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("Received:", data)

            # Save to Firebase Firestore
            doc_ref = db.collection("health_data").document("patient1")
            doc_ref.set({
                "heartRate": data["heartRate"],
                "spo2": data["spo2"],
                "timestamp": firestore.SERVER_TIMESTAMP
            })
            print("Uploaded to Firebase!")

    except Exception as e:
        print("Error:", e)

    time.sleep(5)  # every 5 seconds
