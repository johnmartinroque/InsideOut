import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib  # For saving and loading the model

# Load dataset
df = pd.read_csv("heart_rate_emotion_dataset.csv")

df = df.dropna()

le = LabelEncoder()
df['Emotion_Label'] = le.fit_transform(df['Emotion'])

X = df[['HeartRate']]
y = df['Emotion_Label']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

prit("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

print("Accuracy:", accuracy_score(y_test, y_pred))

# Save the model and label encoder to disk
joblib.dump(model, 'heartbeat_emotion_model.pkl')
joblib.dump(le, 'label_encoder.pkl')

print("\nModel and label encoder saved as 'heartbeat_emotion_model.pkl' and 'label_encoder.pkl'")

# Create a simple Python file to load the model and predict emotion
with open("heartbeat_predictor.py", "w") as f:
    f.write('''import joblib

# Load model and label encoder
model = joblib.load("heartbeat_emotion_model.pkl")
le = joblib.load("label_encoder.pkl")

def predict_emotion(heart_rate):
    pred_label = model.predict([[heart_rate]])
    emotion = le.inverse_transform(pred_label)
    return emotion[0]

if __name__ == "__main__":
    # Example usage
    test_heart_rate = 90
    print(f"Predicted Emotion for Heart Rate {test_heart_rate}: {predict_emotion(test_heart_rate)}")
''')

print("\nPython predictor script 'heartbeat_predictor.py' created!")
