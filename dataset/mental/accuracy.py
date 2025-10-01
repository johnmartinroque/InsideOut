import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Models
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier

# Load dataset
data = pd.read_csv("mental_health_wearable_data.csv")

# Select features and target
X = data[["GSR_Values", "Gender"]].copy()
y = data["Emotional_State"]

# Encode categorical values
le_gender = LabelEncoder()
X["Gender"] = le_gender.fit_transform(X["Gender"])

le_target = LabelEncoder()
y = le_target.fit_transform(y)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Define models
models = {
    "Logistic Regression": LogisticRegression(),
    "SVM (RBF)": SVC(kernel="rbf", probability=True),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42),
    "KNN": KNeighborsClassifier(n_neighbors=5),
    "MLP": MLPClassifier(hidden_layer_sizes=(50,), max_iter=500, random_state=42)
}

print("Model Evaluation Results")
print("="*60)

# Train and evaluate each model
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    cv_scores = cross_val_score(model, X_train, y_train, cv=5)

    print(f"\n{name}:")
    print(f"  Test Accuracy: {acc:.4f}")
    print(f"  CV Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    print("  Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le_target.classes_))
