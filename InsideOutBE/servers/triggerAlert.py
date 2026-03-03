from firebase_admin import firestore, _apps
from datetime import datetime, timedelta, timezone
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

ELDERLY_ID = "alcHApCZqkI4l4XKUbRw"

# Manila timezone
MANILA_TZ = timezone(timedelta(hours=8))

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

    db = firestore.client()

    gsr_data = latest_prediction.get("gsr_emotion", {})
    mwl_data = latest_prediction.get("mwl", {})
    bpm_data = latest_prediction.get("bpm_emotion", {})

    gsr_value = latest_prediction.get("gsr")
    bpm_value = latest_prediction.get("bpm")

    gsr_emotion = gsr_data.get("label")
    gsr_conf = gsr_data.get("confidence") or 0

    mwl_label = mwl_data.get("label")
    mwl_conf = mwl_data.get("confidence") or 0

    bpm_emotion = bpm_data.get("label")
    bpm_conf = bpm_data.get("confidence") or 0

    # Use Manila time
    now = datetime.now(MANILA_TZ)

    # ---------------- COOLDOWN ----------------
    if _last_alert_time and (now - _last_alert_time) < ALERT_COOLDOWN:
        return False

    # ---------------- STRICT CONDITION ----------------
    if (
        gsr_emotion == "Stressed" and gsr_conf >= 80 and
        mwl_label == "High MWL" and mwl_conf >= 80 and
        bpm_emotion == "sad" and bpm_conf >= 80
    ):

        # 🚨 SAVE ALERT TO FIRESTORE
        alert_data = {
            "timestamp": now,
            "gsr_value": gsr_value,
            "bpm_value": bpm_value,
            "gsr_emotion": gsr_emotion,
            "gsr_confidence": gsr_conf,
            "mwl_label": mwl_label,
            "mwl_confidence": mwl_conf,
            "bpm_emotion": bpm_emotion,
            "bpm_confidence": bpm_conf
        }

        db.collection("elderly") \
          .document(ELDERLY_ID) \
          .collection("alerts") \
          .add(alert_data)

        print("🚨 ALERT SAVED TO FIRESTORE")

        # Optional: fetch companions (for SMS later)
        companions = fetch_companions_for_elderly(ELDERLY_ID)

        if companions:
            print("🚨 Companion phone numbers:")
            for c in companions:
                phone_number = c.get("phoneNumber")
                if phone_number:
                    print(f"- {phone_number}")

        _last_alert_time = now
        return True

    return False