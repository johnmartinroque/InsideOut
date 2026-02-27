from firebase_admin import firestore, _apps
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

ELDERLY_ID = "QV6m7zrKxSP4PnMjcVab"

# Keep track of last alert time
_last_alert_time = None
ALERT_COOLDOWN = timedelta(minutes=1)  # 1 minute

# ---------------- FETCH COMPANIONS ----------------
def fetch_companions_for_elderly(elderly_id):
    db = firestore.client()
    companions_ref = db.collection("companion")
    query = companions_ref.where("elderlyID", "==", elderly_id)
    docs = query.stream()

    companions = []
    for doc in docs:
        data = doc.to_dict()
        data["docID"] = doc.id
        companions.append(data)
    return companions

# ---------------- ALERT CHECK ----------------
def check_and_alert(latest_prediction):
    global _last_alert_time

    gsr_emotion = latest_prediction.get("gsr_emotion", {}).get("label")
    mwl_label = latest_prediction.get("mwl", {}).get("label")
    bpm_emotion = latest_prediction.get("bpm_emotion", {}).get("label")

    now = datetime.now()

    # Only trigger if cooldown passed
    if _last_alert_time and (now - _last_alert_time) < ALERT_COOLDOWN:
        return False

    if gsr_emotion == "Stressed" and mwl_label == "High MWL" and bpm_emotion == "sad":
        companions = fetch_companions_for_elderly(ELDERLY_ID)

        print("TRIGGER ALERT! Companion phone numbers:")
        if not companions:
            print("No companions found.")
        else:
            for c in companions:
                phone_number = c.get("phoneNumber")
                if phone_number:
                    print(f"- {phone_number}")

        _last_alert_time = now  # update last alert time
        return True

    return False