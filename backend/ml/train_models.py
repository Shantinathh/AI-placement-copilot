import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score, mean_squared_error, r2_score

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "Student_Dataset.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

def train_and_save_models():
    os.makedirs(MODEL_DIR, exist_ok=True)
    print(f"Loading dataset from {os.path.abspath(DATASET_PATH)}...")
    df = pd.read_csv(DATASET_PATH)
    
    # Drop identifier columns
    cols_to_drop = [c for c in ['Unnamed: 0', 'student_id'] if c in df.columns]
    df = df.drop(columns=cols_to_drop)
    
    categorical_cols = ['gender', 'branch', 'college_tier', 'volunteer_experience']
    numerical_cols = [
        'age', 'cgpa', 'internships_count', 'projects_count', 'certifications_count',
        'aptitude_score', 'communication_skill_score', 'hackathons_participated',
        'github_repos', 'linkedin_connections', 'backlogs', 'extracurricular_score',
        'leadership_score', 'sleep_hours', 'study_hours_per_day'
    ]
    
    feature_cols = categorical_cols + numerical_cols
    X = df[feature_cols]
    y_clf = df['placement_status']
    y_reg = df['salary_package_lpa']
    
    # Setup Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols),
            ('num', 'passthrough', numerical_cols)
        ]
    )
    
    # Fit preprocessor on X
    X_trans = preprocessor.fit_transform(X)
    
    # Retrieve transformed feature names
    cat_feature_names = preprocessor.named_transformers_['cat'].get_feature_names_out(categorical_cols)
    all_transformed_feature_names = list(cat_feature_names) + numerical_cols
    
    # Train / Test split for Classifier
    X_train, X_test, y_train_clf, y_test_clf = train_test_split(
        X_trans, y_clf, test_size=0.2, random_state=42, stratify=y_clf
    )
    
    print("\nTraining RandomForestClassifier for placement status...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train_clf)
    
    y_pred_clf = clf.predict(X_test)
    acc = accuracy_score(y_test_clf, y_pred_clf)
    prec = precision_score(y_test_clf, y_pred_clf, pos_label='Placed')
    rec = recall_score(y_test_clf, y_pred_clf, pos_label='Placed')
    f1 = f1_score(y_test_clf, y_pred_clf, pos_label='Placed')
    cm = confusion_matrix(y_test_clf, y_pred_clf).tolist()
    
    print("Classification Metrics:")
    print(f"  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"  Confusion Matrix:\n{np.array(cm)}")
    
    # Train Regressor on Placed subset
    placed_mask = (df['placement_status'] == 'Placed')
    X_trans_placed = X_trans[placed_mask]
    y_reg_placed = y_reg[placed_mask]
    
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
        X_trans_placed, y_reg_placed, test_size=0.2, random_state=42
    )
    
    print("\nTraining RandomForestRegressor for salary package (LPA)...")
    reg = RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
    reg.fit(X_train_r, y_train_r)
    
    y_pred_r = reg.predict(X_test_r)
    rmse = np.sqrt(mean_squared_error(y_test_r, y_pred_r))
    r2 = r2_score(y_test_r, y_pred_r)
    print(f"Regression Metrics on Placed Students:")
    print(f"  RMSE: {rmse:.4f} LPA")
    print(f"  R2:   {r2:.4f}")
    
    # Feature importances dict
    feature_importances = dict(zip(all_transformed_feature_names, clf.feature_importances_.tolist()))
    
    # Save artifacts
    print("\nSaving model files to backend/models/...")
    joblib.dump(clf, os.path.join(MODEL_DIR, "placement_clf.joblib"))
    joblib.dump(reg, os.path.join(MODEL_DIR, "salary_reg.joblib"))
    joblib.dump(preprocessor, os.path.join(MODEL_DIR, "preprocessor.joblib"))
    
    metadata = {
        "categorical_cols": categorical_cols,
        "numerical_cols": numerical_cols,
        "transformed_feature_names": all_transformed_feature_names,
        "metrics": {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "confusion_matrix": cm,
            "rmse_lpa": float(rmse),
            "r2_lpa": float(r2)
        },
        "feature_importances": feature_importances
    }
    
    with open(os.path.join(MODEL_DIR, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    print("Model training and export complete!")

if __name__ == "__main__":
    train_and_save_models()
