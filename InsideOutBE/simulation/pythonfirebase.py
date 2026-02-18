import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# reference to subcollection
data_ref = db.collection("elderly") \
             .document("b9sYa0JohQsB68ieybNy") \
             .collection("data")

# data to insert
new_data = {
    "gsr": 3.8,
    "heart_rate": 72,
    "status": "calm",
    "timestamp": datetime.utcnow()
}

# auto-generate document ID
data_ref.add(new_data)

print("Data added successfully!")
