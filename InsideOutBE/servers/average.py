import firebase_admin
from firebase_admin import credentials, firestore

# ---------------- FIREBASE INIT ----------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# ---------------- FUNCTION ----------------
def get_hb_average(user_id, day_id):

    times_ref = (
        db.collection("elderly")
          .document(user_id)
          .collection("readings")
          .document(day_id)
          .collection("times")
    )

    total = 0
    count = 0

    for doc in times_ref.stream():
        data = doc.to_dict()

        hb = data.get("hb_interval_avg")

        # ✅ Ignore None, missing, or invalid values
        if isinstance(hb, (int, float)):
            total += hb
            count += 1

    if count == 0:
        print("No valid HB interval values found.")
        return None

    average = round(total / count)
    return average


# ---------------- RUN ----------------
USER_ID = "flRsUK8a9mIQIxdUeEhG"
DAY_ID = "2mar"

result = get_hb_average(USER_ID, DAY_ID)

if result:
    print(f"Overall HB average for {DAY_ID}: {result}")