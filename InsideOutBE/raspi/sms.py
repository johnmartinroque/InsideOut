from firebase_admin import firestore
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

import serial
import time

# ================= CONFIG =================
ELDERLY_ID = "QV6m7zrKxSP4PnMjcVab"

SIM800_PORT = "/dev/serial0"   # change if needed (e.g. /dev/ttyUSB0)
SIM800_BAUD = 9600

_last_alert_time = None
ALERT_COOLDOWN = timedelta(minutes=1)


# ================= SMS SENDER =================
def send_sms(phone_number: str, message: str) -> bool:
    try:
        ser = serial.Serial(SIM800_PORT, SIM800_BAUD, timeout=5)
        time.sleep(1)

        # Text mode
        ser.write(b'AT+CMGF=1\r')
        time.sleep(1)
        ser.read_all()

        # Recipient
        ser.write(f'AT+CMGS="{phone_number}"\r'.encode())
        time.sleep(1)

        # Message body
        ser.write(message.encode())
        time.sleep(0.5)

        # CTRL+Z
        ser.write(bytes([26]))
        time.sleep(3)

        response = ser.read_all().decode(errors="ignore")
        ser.close()

        if "OK" in response or "+CMGS" in response:
            print(f"✅ SMS sent to {phone_number}")
            return True
        else:
            print(f"❌ SMS failed for {phone_number}: {response}")
            return False

    except Exception as e:
        print(f"❌ SMS error for {phone_number}: {e}")
        return False


# ================= FETCH COMPANIONS =================
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


# ================= HELPERS =================
def _get_label_conf(obj: dict, default_label="Unknown"):
    if not isinstance(obj, dict):
        return default_label, None

    label = obj.get("label") or obj.get("prediction", default_label)
    conf = obj.get("confidence")
    return label, conf


def _fmt_conf(conf):
    if conf is None:
        return ""
    try:
        return f" ({float(conf)*100:.0f}%)"
    except Exception:
        return f" ({conf})"


# ================= ALERT LOGIC =================
def check_and_alert(latest_prediction):
    global _last_alert_time

    now = datetime.now()
    ts = now.strftime("%Y-%m-%d %H:%M:%S")

    gsr_label, gsr_conf = _get_label_conf(latest_prediction.get("gsr_emotion", {}))
    mwl_label, mwl_conf = _get_label_conf(latest_prediction.get("mwl", {}))
    bpm_label, bpm_conf = _get_label_conf(latest_prediction.get("bpm_emotion", {}))

    # Cooldown check
    if _last_alert_time and (now - _last_alert_time) < ALERT_COOLDOWN:
        return False

    # Trigger condition
    if (
        str(gsr_label).lower() == "stressed"
        and str(mwl_label).lower() == "high mwl"
        and str(bpm_label).lower() == "sad"
    ):
        companions = fetch_companions_for_elderly(ELDERLY_ID)

        alert_msg = (
            f"⚠️ STRESS ALERT\n"
            f"Time: {ts}\n"
            f"EDM/GSR: {gsr_label}{_fmt_conf(gsr_conf)}\n"
            f"MWL: {mwl_label}{_fmt_conf(mwl_conf)}\n"
            f"BPM: {bpm_label}{_fmt_conf(bpm_conf)}"
        )

        print("🚨 TRIGGER ALERT")
        print(alert_msg)

        if not companions:
            print("No companions found.")
        else:
            for c in companions:
                phone_number = c.get("phoneNumber")
                if phone_number:
                    print(f"Sending to {phone_number}")
                    send_sms(phone_number, alert_msg)

        _last_alert_time = now
        return True

    return False