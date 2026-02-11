import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin with service account
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Example: create a document in "users" collection
new_user = {
    "uid": "user_123",
    "email": "test@example.com",
    "name": "John Doe",
    "age": 25
}

db.collection("users").document("user_123").set(new_user)

print("User added to Firestore successfully!")
