# triggerAlert.py

def check_and_alert(latest_prediction):
    """
    Checks the latest predictions and triggers an alert if conditions are met.
    
    Condition example:
    - GSR Emotion: "Stressed"
    - MWL: "High MWL"
    - BPM Emotion: "sad"
    """
    gsr_emotion = latest_prediction.get("gsr_emotion", {}).get("label")
    mwl_label = latest_prediction.get("mwl", {}).get("label")
    bpm_emotion = latest_prediction.get("bpm_emotion", {}).get("label")

    if gsr_emotion == "Stressed" and mwl_label == "High MWL" and bpm_emotion == "sad":
        # Here you can integrate actual SMS logic later
        print("TRIGGER ALERTED SMS Sent!")
        return True
    
    return False