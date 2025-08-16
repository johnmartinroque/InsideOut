import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score

# Load the dataset
df = pd.read_csv("heart_rate_emotion_dataset.csv")  # Change to your CSV file name

# Display the first few rows
print("First few rows of the dataset:")
print(df.head())

# Display data info
print("\nDataset Info:")
print(df.info())

# Handle missing values (if any)
df = df.dropna()

# Check column names
print("\nColumn names:")
print(df.columns)

# Assume the dataset has 'Heart_Rate' and 'Emotion' columns
# Encode the target variable (Emotion)
le = LabelEncoder()
df['Emotion_Label'] = le.fit_transform(df['Emotion'])

# Features and target
X = df[['HeartRate']]  # You can include more features if available
y = df['Emotion_Label']

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Initialize and train the model
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Predict on test set
y_pred = model.predict(X_test)

# Evaluate the model
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

print("Accuracy:", accuracy_score(y_test, y_pred))

# Example: Predict a new heart rate
new_heart_rate = [[90]]
predicted_label = model.predict(new_heart_rate)
predicted_emotion = le.inverse_transform(predicted_label)

print(f"\nPredicted Emotion for Heart Rate 85: {predicted_emotion[0]}")