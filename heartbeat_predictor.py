import pandas as pd
import joblib

# Load model and label encoder
model = joblib.load("heartbeat_emotion_model.pkl")
le = joblib.load("label_encoder.pkl")

def predict_emotion(heart_rate):
    # Create a DataFrame with the same feature name as training
    input_df = pd.DataFrame([[heart_rate]], columns=['HeartRate'])
    pred_label = model.predict(input_df)
    emotion = le.inverse_transform(pred_label)
    return emotion[0]

if __name__ == "__main__":
    # Example usage
    test_heart_rate = 80
    print(f"Predicted Emotion for Heart Rate {test_heart_rate}: {predict_emotion(test_heart_rate)}")
