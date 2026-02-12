import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score

# Models
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier

# ----------------------------
# Load Dataset
# ----------------------------
data_path = "../datasets/emotional_monitoring_dataset.csv"
df = pd.read_csv(data_path)

# ----------------------------
# Features
# ----------------------------
X = df[["HeartRate", "SkinConductance"]]

# Normalize features for better SVM performance
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ----------------------------
# Targets to Predict
# ----------------------------
targets = ["EmotionalState", "EngagementLevel"]

# ----------------------------
# Models to Compare
# ----------------------------
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "KNN": KNeighborsClassifier(n_neighbors=3),
    "SVM": SVC(),
    "Decision Tree": DecisionTreeClassifier(),
    "Random Forest": RandomForestClassifier(n_estimators=100)
}

# ----------------------------
# Train & Evaluate
# ----------------------------
for target in targets:
    print(f"\n======= Predicting {target} =======\n")
    
    # Encode target labels
    y = df[target]
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)
        print(f"{name}: {accuracy * 100:.2f}%")
