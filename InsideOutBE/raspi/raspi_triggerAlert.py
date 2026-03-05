from firebase_admin import firestore
from datetime import datetime, timedelta, timezone
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

import os
import time

# ✅ clean import
from music_manager import StressMusicManager

ELDERLY_ID = "XrKpNMKrShHjQg443n34"

# Manila timezone
MANILA_TZ = timezone(timedelta(hours=8))

# ---------------- COOLDOWNS ----------------
_last_alert_time = None
ALERT_COOLDOWN = timedelta(minutes=1)  # Firestore alert cooldown

_last_sms_time = None
SMS_COOLDOWN = timedelta(minutes=1)    # SMS cooldown (can differ from alert)

# ---------------- MUSIC SETTINGS ----------------
BASE_DIR = os.path.dirname(os.path.abspath(_file_))

music_manager = StressMusicManager(
    music_files=[
        os.path.join(BASE_DIR, "stressed1.mp3"),
        os.path.join(BASE_DIR, "stressed2.mp3"),
        os.path.join(BASE_DIR, "stressed3.mp3"),
        os.path.join(BASE_DIR, "stressed4.mp3"),
        os.path.join(BASE_DIR, "stressed5.mp3"),
    ],
    cooldown_seconds=10,
    calm_required_seconds=3,
    verbose=True
)

# ---------------- SMS SETTINGS ----------------
SMS_ENABLED = True
SIM_PORT = "/dev/serial0"   # ✅ serial0 (NOT usb)
SIM_BAUD = 115200           # ✅ your SIM800L responded correctly at 115200

SMS_HEADER = "a@@i@@ STRESS ALERT"


def _try_import_serial():
    try:
        import serial  # pyserial
        return serial
    except Exception as e:
        print(f"⚠️ pyserial not available — SMS disabled. ({e})")
        return None


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


def _fmt_time(dt_obj: datetime):
    try:
        return dt_obj.astimezone(MANILA_TZ).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return datetime.now(MANILA_TZ).strftime("%Y-%m-%d %H:%M:%S")


def _fmt_pct(x):
    """
    Produces 2-decimal percent text.
    Handles:
      0.644   -> 64.40%
      64.40   -> 64.40%
      6440    -> 64.40%  (double-multiplied case)
    """
    try:
        x = float(x)
    except Exception:
        return "0.00%"

    if x > 100:
        x = x / 100.0
    if x > 100:
        x = x / 100.0
    if x <= 1:
        x = x * 100.0

    return f"{x:.2f}%"


def build_sms_message(now, eda_value, bpm_value, eda_emotion, eda_conf, mwl_label, mwl_conf, bpm_emotion, bpm_conf):
    return (
        f"{SMS_HEADER}\n"
        f"Time: {_fmt_time(now)}\n"
        f"EDA: {eda_emotion} ({_fmt_pct(eda_conf)}) | Value: {eda_value}\n"
        f"MWL: {mwl_label} ({_fmt_pct(mwl_conf)})\n"
        f"BPM: {bpm_emotion} ({_fmt_pct(bpm_conf)}) | Value: {bpm_value}"
    )


def send_sms(phone_number: str, message: str) -> bool:
    """
    SIM800/900 SMS send via AT commands.
    Returns True only if modem confirms +CMGS and OK.
    """
    if not SMS_ENABLED:
        return False

    serial = _try_import_serial()
    if serial is None:
        return False

    ser = None

    def _read_all(delay=0.4):
        time.sleep(delay)
        try:
            return ser.read_all().decode(errors="ignore")
        except Exception:
            return ""

    def _wait_for(token: str, timeout=8.0):
        end = time.time() + timeout
        buf = ""
        while time.time() < end:
            buf += _read_all(0.2)
            if token in buf:
                return True, buf
        return False, buf

    try:
        ser = serial.Serial(SIM_PORT, SIM_BAUD, timeout=0.5)
        time.sleep(1.0)

        # Flush any boot text (e.g., "SMS Ready")
        _read_all(0.5)

        # Basic init
        ser.write(b"AT\r")
        ok, resp = _wait_for("OK", timeout=2.5)
        if not ok:
            print(f"❌ SMS init failed (no OK on AT). Response:\n{resp}")
            return False

        ser.write(b"ATE0\r")        # echo off
        _wait_for("OK", timeout=2.5)

        ser.write(b"AT+CMGF=1\r")   # text mode
        ok, resp = _wait_for("OK", timeout=3.5)
        if not ok:
            print(f"❌ Failed to set SMS text mode. Response:\n{resp}")
            return False

        # Start SMS and wait for '>' prompt
        ser.write(f'AT+CMGS="{phone_number}"\r'.encode("utf-8"))
        got_prompt, resp = _wait_for(">", timeout=6.0)
        if not got_prompt:
            print(f"❌ No SMS prompt ('>'). Response:\n{resp}")
            return False

        # Send message then Ctrl+Z
        ser.write(message.encode("utf-8", errors="ignore"))
        ser.write(bytes([26]))  # Ctrl+Z

        # Wait for confirmation
        end = time.time() + 15.0
        buf = ""
        while time.time() < end:
            buf += _read_all(0.3)
            if "+CMGS" in buf and "OK" in buf:
                print(f"📩 SMS sent to {phone_number}")
                return True
            if "ERROR" in buf:
                print(f"❌ SMS failed to {phone_number}. Modem said:\n{buf}")
                return False

        print(f"❌ SMS timeout to {phone_number}. Modem said:\n{buf}")
        return False

    except Exception as e:
        print(f"❌ SMS failed to {phone_number}: {e}")
        return False

    finally:
        try:
            if ser:
                ser.close()
        except Exception:
            pass


def check_and_alert(latest_prediction):
    """
    Called by eda_bpm_firebase.py each prediction.

    ✅ Music runs every prediction (start/stop logic via music_manager.update)
    ✅ Firestore alert only on STRICT condition + cooldown
    ✅ SMS triggers when EDA says "Stressed" (same trigger as music) + its own cooldown
    ✅ SMS format matches your sample (header + time + readings + fixed decimals)
    ✅ SMS includes actual EDA and BPM numeric values
    """
    global _last_alert_time, _last_sms_time

    db = firestore.client()

    gsr_data = latest_prediction.get("gsr_emotion", {}) or {}
    mwl_data = latest_prediction.get("mwl", {}) or {}
    bpm_data = latest_prediction.get("bpm_emotion", {}) or {}

    # actual numeric values
    eda_value = latest_prediction.get("gsr")   # your code uses "gsr" as the EDA numeric value
    bpm_value = latest_prediction.get("bpm")

    # keep your field usage (label/confidence)
    eda_emotion = gsr_data.get("label")
    eda_conf = float(gsr_data.get("confidence") or 0)

    mwl_label = mwl_data.get("label")
    mwl_conf = float(mwl_data.get("confidence") or 0)

    bpm_emotion = bpm_data.get("label")
    bpm_conf = float(bpm_data.get("confidence") or 0)

    now = datetime.now(MANILA_TZ)

    # ---------------- MUSIC RULE ----------------
    is_stressed_for_music = (eda_emotion == "Stressed")
    music_manager.update(is_stressed_for_music)

    # ---------------- SMS TRIGGER (same as music) ----------------
    if SMS_ENABLED and is_stressed_for_music:
        if not _last_sms_time or (now - _last_sms_time) >= SMS_COOLDOWN:
            companions = fetch_companions_for_elderly(ELDERLY_ID)

            if companions:
                sms_text = build_sms_message(
                    now=now,
                    eda_value=eda_value,
                    bpm_value=bpm_value,
                    eda_emotion=eda_emotion,
                    eda_conf=eda_conf,
                    mwl_label=mwl_label,
                    mwl_conf=mwl_conf,
                    bpm_emotion=bpm_emotion,
                    bpm_conf=bpm_conf
                )

                for c in companions:
                    phone_number = c.get("phoneNumber")
                    if phone_number:
                        send_sms(phone_number, sms_text)

                _last_sms_time = now
            else:
                print("⚠️ No companions found for this elderlyID.")
        else:
            print("⏳ SMS cooldown active — not sending SMS yet.")

    # ---------------- ALERT COOLDOWN ----------------
    if _last_alert_time and (now - _last_alert_time) < ALERT_COOLDOWN:
        return False

    # ---------------- STRICT CONDITION (FIRESTORE ALERTS) ----------------
    strict_trigger = (
        eda_emotion == "Stressed" and eda_conf >= 52 and
        mwl_label == "High MWL" and mwl_conf >= 74 and
        bpm_emotion == "sad" and bpm_conf >= 52
    )

    if not strict_trigger:
        return False

    # 🚨 SAVE ALERT TO FIRESTORE
    alert_data = {
        "timestamp": now,
        "gsr_value": eda_value,
        "bpm_value": bpm_value,
        "gsr_emotion": eda_emotion,
        "gsr_confidence": eda_conf,
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

    _last_alert_time = now
    return True