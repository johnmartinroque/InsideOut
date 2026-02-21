import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
import warnings
warnings.filterwarnings('ignore')

# Paths for GSR data
high_path = "../datasets/gsr/High_MWL"
low_path = "../datasets/gsr/Low_MWL"

# Lists of available files
high_files = [2, 3, 5, 10, 11, 12, 13, 19, 20, 21, 23]
low_files = [3, 4, 5, 6, 8, 10, 13, 14, 15, 16, 17, 18, 20, 22, 23, 24, 25]

def load_and_prepare_data(high_path, low_path):
    """
    Load GSR data from High_MWL_GSR and Low_MWL_GSR folders and prepare features/labels
    Only the first column of each CSV is used.
    """
    X, y = [], []
    
    # Load High MWL GSR files
    for i in high_files:
        filename = f"p{i}h.csv"
        filepath = os.path.join(high_path, filename)
        
        if os.path.exists(filepath):
            try:
                df = pd.read_csv(filepath, header=None)
                df = df.apply(pd.to_numeric, errors='coerce').dropna()
                
                if not df.empty:
                    # Take only the first column
                    first_col = df.iloc[:, 0]
                    features = extract_gsr_features(first_col.to_frame())  # convert Series to DataFrame
                    X.append(features)
                    y.append(1)  # High MWL
                    print(f"Loaded High MWL GSR: {filename}, Features: {len(features)}")
            except Exception as e:
                print(f"Error loading {filepath}: {e}")
    
    # Load Low MWL GSR files
    for i in low_files:
        filename = f"p{i}l.csv"
        filepath = os.path.join(low_path, filename)
        
        if os.path.exists(filepath):
            try:
                df = pd.read_csv(filepath, header=None)
                df = df.apply(pd.to_numeric, errors='coerce').dropna()
                
                if not df.empty:
                    first_col = df.iloc[:, 0]
                    features = extract_gsr_features(first_col.to_frame())
                    X.append(features)
                    y.append(0)  # Low MWL
                    print(f"Loaded Low MWL GSR: {filename}, Features: {len(features)}")
            except Exception as e:
                print(f"Error loading {filepath}: {e}")
    
    return np.array(X), np.array(y)


def extract_gsr_features(df):
    """
    Extract features from GSR data.
    Assumes df contains only one column (the first column from CSV)
    """
    features = []
    
    for col in df.columns:
        column_data = df[col].dropna()
        
        if len(column_data) > 0:
            col_features = [
                np.mean(column_data),
                np.std(column_data),
                np.min(column_data),
                np.max(column_data),
                np.median(column_data),
                np.percentile(column_data, 25),
                np.percentile(column_data, 75),
                np.ptp(column_data),
            ]
            
            if len(column_data) > 1:
                differences = np.diff(column_data)
                col_features.extend([
                    np.mean(np.abs(differences)),
                    np.std(differences),
                    np.max(np.abs(differences)),
                ])
            else:
                col_features.extend([0, 0, 0])
            
            features.extend(col_features)
    
    # No cross-column features since we only use the first column
    return features

def evaluate_models(X, y):
    """
    Evaluate multiple machine learning models without saving them
    """
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Define models to evaluate
    models = {
        'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
        'SVM': SVC(random_state=42),
        'Random Forest': RandomForestClassifier(random_state=42, n_estimators=100),
        'Gradient Boosting': GradientBoostingClassifier(
            random_state=42,
            n_estimators=100,
            max_depth=3,
            learning_rate=0.1,
            subsample=0.8
        ),
        'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=5),
        'Neural Network': MLPClassifier(random_state=42, max_iter=1000, hidden_layer_sizes=(100, 50))
    }
    
    results = {}
    
    print("Model Evaluation Results:")
    print("=" * 60)
    
    for name, model in models.items():
        try:
            # Train and predict
            if name in ['SVM', 'K-Nearest Neighbors', 'Neural Network', 'Logistic Regression']:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                
                # Cross-validation with scaled data
                cv_scores = cross_val_score(model, scaler.transform(X), y, cv=5)
            else:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                
                # Cross-validation
                cv_scores = cross_val_score(model, X, y, cv=5)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            mean_cv_score = cv_scores.mean()
            std_cv_score = cv_scores.std()
            
            results[name] = {
                'accuracy': accuracy,
                'mean_cv_score': mean_cv_score,
                'std_cv_score': std_cv_score,
                'cv_scores': cv_scores,
                'model': model  # Store the trained model temporarily
            }
            
            print(f"\n{name}:")
            print(f"  Test Accuracy: {accuracy:.4f}")
            print(f"  Cross-validation: {mean_cv_score:.4f} (+/- {std_cv_score * 2:.4f})")
            
        except Exception as e:
            print(f"\n{name} - Error: {e}")
            results[name] = None
    
    return results, X_train, X_test, y_train, y_test, models

def print_detailed_results(results, X_test, y_test, models, X, y):
    """
    Print detailed results for the best performing model
    """
    print("\n" + "=" * 60)
    print("DETAILED ANALYSIS")
    print("=" * 60)
    
    # Find best model based on test accuracy
    valid_results = [(name, result) for name, result in results.items() if result is not None]
    if not valid_results:
        print("No valid models to evaluate.")
        return
    
    best_model_name, best_result = max(valid_results, key=lambda x: x[1]['accuracy'])
    
    print(f"\nBest Model: {best_model_name}")
    print(f"Best Accuracy: {best_result['accuracy']:.4f}")
    
    # Print classification report for best model
    best_model = models[best_model_name]
    
    # Create a new train/test split for consistency
    X_train, X_test_new, y_train, y_test_new = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale if needed
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test_new)
    
    if best_model_name in ['SVM', 'K-Nearest Neighbors', 'Neural Network', 'Logistic Regression']:
        best_model.fit(X_train_scaled, y_train)
        y_pred = best_model.predict(X_test_scaled)
    else:
        best_model.fit(X_train, y_train)
        y_pred = best_model.predict(X_test_new)
    
    print(f"\nClassification Report for {best_model_name}:")
    print(classification_report(y_test_new, y_pred, target_names=['Low MWL', 'High MWL']))
    
    print(f"Confusion Matrix for {best_model_name}:")
    cm = confusion_matrix(y_test_new, y_pred)
    print(cm)

# Main execution
if __name__ == "__main__":
    # Load data
    print("Loading GSR data...")
    X, y = load_and_prepare_data(high_path, low_path)
    
    if len(X) == 0:
        print("No data loaded. Please check your file paths and data files.")
        print(f"Expected folders: {high_path} and {low_path}")
        print("Expected files: p2h.csv to p25h.csv for High MWL, p2l.csv to p25l.csv for Low MWL")
    else:
        print(f"\nData loaded successfully!")
        print(f"Total samples: {len(X)}")
        print(f"High MWL samples: {np.sum(y == 1)}")
        print(f"Low MWL samples: {np.sum(y == 0)}")
        print(f"Feature dimension: {X.shape[1]}")
        
        # Evaluate models without saving them
        results, X_train, X_test, y_train, y_test, models = evaluate_models(X, y)
        
        # Print detailed results
        print_detailed_results(results, X_test, y_test, models, X, y)
        
        # Summary table
        print("\n" + "=" * 60)
        print("SUMMARY TABLE")
        print("=" * 60)
        print(f"{'Model':<25} {'Test Accuracy':<15} {'CV Mean':<10} {'CV Std':<10}")
        print("-" * 60)
        
        for name, result in results.items():
            if result is not None:
                print(f"{name:<25} {result['accuracy']:<15.4f} {result['mean_cv_score']:<10.4f} {result['std_cv_score']:<10.4f}")
        
        print(f"\nAll models were evaluated but not saved to disk.")