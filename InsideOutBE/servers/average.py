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
    valid_count = 0
    empty_count = 0
    total_docs = 0

    for doc in times_ref.stream():
        total_docs += 1
        data = doc.to_dict()
        hb = data.get("hb_interval_avg")

        if isinstance(hb, (int, float)):
            total += hb
            valid_count += 1
        else:
            empty_count += 1

    if valid_count == 0:
        print("No valid HB interval values found.")
        return None

    average = round(total / valid_count)

    print("------ RESULTS ------")
    print(f"Total interval documents: {total_docs}")
    print(f"Valid hb_interval_avg: {valid_count}")
    print(f"Empty / None hb_interval_avg: {empty_count}")
    print(f"Overall HB average: {average}")
    print("---------------------")

    return average


# ---------------- RUN ----------------
USER_ID = "flRsUK8a9mIQIxdUeEhG"
DAY_ID = "2mar"

get_hb_average(USER_ID, DAY_ID)