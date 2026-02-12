import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import random

# ---------------- FIREBASE INIT ----------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# ---------------- CONFIG ----------------
user_id = "N650pQK08tF0f5bZaTGo"
start_date = datetime(2026, 2, 12, 0, 0)  # change start date if needed
days = 2
interval_minutes = 60

# month format mapping
months = ["jan","feb","mar","apr","may","jun",
          "jul","aug","sep","oct","nov","dec"]

# reference to readings collection
readings_ref = db.collection("elderly").document(user_id).collection("readings")

# ---------------- GENERATE DATA ----------------
current = start_date
end_date = start_date + timedelta(days=days)

while current < end_date:

    # ID format → 12feb1305
    doc_id = (
        f"{current.day}"
        f"{months[current.month-1]}"
        f"{current.strftime('%H%M')}"
    )

    data = {
        "timestamp": current,
        "gsr": round(random.uniform(2.5, 5.5), 2),
        "heart_rate": random.randint(60, 100),
        "status": random.choice(["calm", "neutral", "stressed"])
    }

    readings_ref.document(doc_id).set(data)

    print("Created:", doc_id)

    current += timedelta(minutes=interval_minutes)

print("\n✅ Finished generating test data!")
