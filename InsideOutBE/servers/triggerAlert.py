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
# ---------------- ALERT CHECK ----------------
def check_and_alert(latest_prediction):
    global _last_alert_time

    gsr_data = latest_prediction.get("gsr_emotion", {})
    mwl_data = latest_prediction.get("mwl", {})
    bpm_data = latest_prediction.get("bpm_emotion", {})

    gsr_emotion = gsr_data.get("label")
    gsr_conf = gsr_data.get("confidence") or 0

    mwl_label = mwl_data.get("label")
    mwl_conf = mwl_data.get("confidence") or 0

    bpm_emotion = bpm_data.get("label")
    bpm_conf = bpm_data.get("confidence") or 0

    now = datetime.now()

    # Cooldown check
    if _last_alert_time and (now - _last_alert_time) < ALERT_COOLDOWN:
        return False

    # 🚨 STRICT CONDITION WITH CONFIDENCE >= 70%
    if (
        gsr_emotion == "Stressed" and gsr_conf >= 70 and
        mwl_label == "High MWL" and mwl_conf >= 70 and
        bpm_emotion == "sad" and bpm_conf >= 70
    ):
        companions = fetch_companions_for_elderly(ELDERLY_ID)

        print("🚨 TRIGGER ALERT! Companion phone numbers:")

        if not companions:
            print("No companions found.")
        else:
            for c in companions:
                phone_number = c.get("phoneNumber")
                if phone_number:
                    print(f"- {phone_number}")

        _last_alert_time = now
        return True

    return False