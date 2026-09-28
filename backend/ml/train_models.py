import os
import json
from datetime import date
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingRegressor
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, roc_curve,
    mean_squared_error, r2_score, mean_absolute_error
)

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "Student_Dataset.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def build_features(df: pd.DataFrame):
    """Add engineered features to the dataframe in-place."""
    df = df.copy()

    # Activity aggregates
    df['total_activities'] = (
        df['internships_count'] + df['projects_count'] +
        df['certifications_count'] + df['hackathons_participated']
    )

    # Academic composites
    df['academic_score'] = df['cgpa'] * 10 + df['aptitude_score']
    df['cgpa_sq'] = df['cgpa'] ** 2
    df['cgpa_per_backlog'] = df['cgpa'] / (df['backlogs'] + 1)

    # Soft-skill composite
    df['soft_skill_score'] = (
        df['communication_skill_score'] +
        df['leadership_score'] +
        df['extracurricular_score']
    )

    # Online / networking presence
    df['online_presence'] = df['github_repos'] + df['linkedin_connections']

    # Career-age-adjusted density
    career_age = (df['age'] - 17).clip(lower=1)
    df['internship_density'] = df['internships_count'] / career_age
    df['activity_per_year'] = df['total_activities'] / career_age

    # Interaction terms
    df['aptitude_x_cgpa'] = df['aptitude_score'] * df['cgpa']
    df['comm_x_leadership'] = df['communication_skill_score'] * df['leadership_score']
    df['aptitude_x_comm'] = df['aptitude_score'] * df['communication_skill_score']

    # College tier ordinal × CGPA
    tier_map = {'Tier 1': 3, 'Tier 2': 2, 'Tier 3': 1}
    df['tier_encoded'] = df['college_tier'].map(tier_map).fillna(1)
    df['tier_x_cgpa'] = df['tier_encoded'] * df['cgpa']

    return df


def get_col_lists():
    categorical_cols = ['gender', 'branch', 'college_tier', 'volunteer_experience']
    numerical_cols = [
        'age', 'cgpa', 'internships_count', 'projects_count', 'certifications_count',
        'aptitude_score', 'communication_skill_score', 'hackathons_participated',
        'github_repos', 'linkedin_connections', 'backlogs', 'extracurricular_score',
        'leadership_score', 'sleep_hours', 'study_hours_per_day',
    ]
    engineered_cols = [
        'total_activities', 'academic_score', 'cgpa_sq', 'cgpa_per_backlog',
        'soft_skill_score', 'online_presence', 'internship_density',
        'activity_per_year', 'aptitude_x_cgpa', 'comm_x_leadership',
        'aptitude_x_comm', 'tier_encoded', 'tier_x_cgpa',
    ]
    return categorical_cols, numerical_cols, engineered_cols


def build_preprocessor(categorical_cols, numerical_cols, engineered_cols):
    num_all = numerical_cols + engineered_cols
    return ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols),
            ('num', StandardScaler(), num_all),
        ]
    ), num_all


def find_optimal_threshold(y_true, y_proba, pos_label='Placed'):
    """Find the decision threshold that maximises F1 on the given split."""
    fpr, tpr, thresholds = roc_curve(y_true, y_proba, pos_label=pos_label)
    best_thresh, best_f1 = 0.5, 0.0
    for thresh in thresholds:
        preds = (y_proba >= thresh).astype(int)
        labels = (np.array(y_true) == pos_label).astype(int)
        tp = np.sum((preds == 1) & (labels == 1))
        fp = np.sum((preds == 1) & (labels == 0))
        fn = np.sum((preds == 0) & (labels == 1))
        f1 = (2 * tp) / (2 * tp + fp + fn + 1e-9)
        if f1 > best_f1:
            best_f1, best_thresh = f1, float(thresh)
    return round(best_thresh, 4)


def train_and_save_models():
    os.makedirs(MODEL_DIR, exist_ok=True)
    print(f"Loading dataset from {os.path.abspath(DATASET_PATH)}...")
    df_raw = pd.read_csv(DATASET_PATH)

    # Drop identifiers
    cols_to_drop = [c for c in ['Unnamed: 0', 'student_id'] if c in df_raw.columns]
    df_raw = df_raw.drop(columns=cols_to_drop)

    # Feature engineering
    print("Building engineered features...")
    df = build_features(df_raw)

    categorical_cols, numerical_cols, engineered_cols = get_col_lists()
    preprocessor, num_all = build_preprocessor(categorical_cols, numerical_cols, engineered_cols)

    feature_cols = categorical_cols + numerical_cols + engineered_cols
    X = df[feature_cols]
    y_clf = df['placement_status']
    y_reg = df['salary_package_lpa']

    # ── CLASSIFIER ─────────────────────────────────────────────────────────────
    X_trans = preprocessor.fit_transform(X)

    # Retrieve all transformed feature names
    cat_feature_names = preprocessor.named_transformers_['cat'].get_feature_names_out(categorical_cols)
    all_feature_names = list(cat_feature_names) + num_all

    X_train, X_test, y_train_clf, y_test_clf = train_test_split(
        X_trans, y_clf, test_size=0.2, random_state=42, stratify=y_clf
    )

    print("\nTraining RandomForestClassifier for placement status...")
    base_clf = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1
    )
    # Calibrate probabilities using isotonic regression (5-fold CV)
    clf = CalibratedClassifierCV(base_clf, method='isotonic', cv=5)
    clf.fit(X_train, y_train_clf)

    # Test-set metrics
    y_pred_clf = clf.predict(X_test)
    y_proba_clf = clf.predict_proba(X_test)
    placed_idx = list(clf.classes_).index('Placed')
    y_proba_placed = y_proba_clf[:, placed_idx]

    acc   = accuracy_score(y_test_clf, y_pred_clf)
    prec  = precision_score(y_test_clf, y_pred_clf, pos_label='Placed')
    rec   = recall_score(y_test_clf, y_pred_clf, pos_label='Placed')
    f1    = f1_score(y_test_clf, y_pred_clf, pos_label='Placed')
    cm    = confusion_matrix(y_test_clf, y_pred_clf).tolist()
    auc   = roc_auc_score((np.array(y_test_clf) == 'Placed').astype(int), y_proba_placed)
    best_thresh = find_optimal_threshold(y_test_clf, y_proba_placed, pos_label='Placed')

    # Optimal-threshold predictions
    y_opt_pred = ['Placed' if p >= best_thresh else 'Not Placed' for p in y_proba_placed]
    opt_acc  = accuracy_score(y_test_clf, y_opt_pred)
    opt_f1   = f1_score(y_test_clf, y_opt_pred, pos_label='Placed')
    opt_prec = precision_score(y_test_clf, y_opt_pred, pos_label='Placed')
    opt_rec  = recall_score(y_test_clf, y_opt_pred, pos_label='Placed')

    # Train-set metrics
    y_train_pred_clf = clf.predict(X_train)
    train_acc  = accuracy_score(y_train_clf, y_train_pred_clf)
    train_prec = precision_score(y_train_clf, y_train_pred_clf, pos_label='Placed')
    train_rec  = recall_score(y_train_clf, y_train_pred_clf, pos_label='Placed')
    train_f1   = f1_score(y_train_clf, y_train_pred_clf, pos_label='Placed')

    print("Classification Metrics (Test  @ default threshold 0.5):")
    print(f"  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"  ROC-AUC:   {auc:.4f}")
    print(f"  Confusion Matrix:\n{np.array(cm)}")
    print(f"\nClassification Metrics (Test  @ optimal threshold {best_thresh}):")
    print(f"  Accuracy:  {opt_acc:.4f}")
    print(f"  Precision: {opt_prec:.4f}")
    print(f"  Recall:    {opt_rec:.4f}")
    print(f"  F1 Score:  {opt_f1:.4f}")
    print("Classification Metrics (Train @ default threshold 0.5):")
    print(f"  Accuracy:  {train_acc:.4f}")
    print(f"  Precision: {train_prec:.4f}")
    print(f"  Recall:    {train_rec:.4f}")
    print(f"  F1 Score:  {train_f1:.4f}")

    feature_importances = {}
    # Average importances across calibrated estimators
    raw_importances = np.mean(
        [est.estimator.feature_importances_ for est in clf.calibrated_classifiers_],
        axis=0
    )
    feature_importances = dict(zip(all_feature_names, raw_importances.tolist()))

    # ── REGRESSOR ──────────────────────────────────────────────────────────────
    placed_mask = (df['placement_status'] == 'Placed')
    X_trans_placed = X_trans[placed_mask.values]
    y_reg_placed   = y_reg[placed_mask].reset_index(drop=True)

    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
        X_trans_placed, y_reg_placed, test_size=0.2, random_state=42
    )

    print("\nTraining HistGradientBoostingRegressor for salary package (LPA)...")
    reg = HistGradientBoostingRegressor(
        max_iter=500,
        max_depth=8,
        learning_rate=0.03,
        min_samples_leaf=30,
        l2_regularization=0.1,
        random_state=42
    )
    reg.fit(X_train_r, y_train_r)

    # Test-set regression metrics
    y_pred_r    = reg.predict(X_test_r)
    rmse        = np.sqrt(mean_squared_error(y_test_r, y_pred_r))
    mae         = mean_absolute_error(y_test_r, y_pred_r)
    r2          = r2_score(y_test_r, y_pred_r)

    # Train-set regression metrics
    y_train_pred_r = reg.predict(X_train_r)
    train_rmse  = np.sqrt(mean_squared_error(y_train_r, y_train_pred_r))
    train_mae   = mean_absolute_error(y_train_r, y_train_pred_r)
    train_r2    = r2_score(y_train_r, y_train_pred_r)

    print(f"Regression Metrics (Test):")
    print(f"  RMSE: {rmse:.4f} LPA  |  MAE: {mae:.4f} LPA  |  R²: {r2:.4f}")
    print(f"Regression Metrics (Train):")
    print(f"  RMSE: {train_rmse:.4f} LPA  |  MAE: {train_mae:.4f} LPA  |  R²: {train_r2:.4f}")

    # ── SAVE ARTIFACTS ─────────────────────────────────────────────────────────
    print("\nSaving model files to backend/models/...")
    joblib.dump(clf,          os.path.join(MODEL_DIR, "placement_clf.joblib"))
    joblib.dump(reg,          os.path.join(MODEL_DIR, "salary_reg.joblib"))
    joblib.dump(preprocessor, os.path.join(MODEL_DIR, "preprocessor.joblib"))

    # model_metadata.json — keeps backward compat with existing routes
    metadata = {
        "categorical_cols": categorical_cols,
        "numerical_cols": numerical_cols,
        "engineered_cols": engineered_cols,
        "transformed_feature_names": all_feature_names,
        "optimal_threshold": best_thresh,
        "metrics": {
            "accuracy":         round(float(acc),  4),
            "precision":        round(float(prec), 4),
            "recall":           round(float(rec),  4),
            "f1_score":         round(float(f1),   4),
            "roc_auc":          round(float(auc),  4),
            "confusion_matrix": cm,
            "rmse_lpa":         round(float(rmse), 4),
            "r2_lpa":           round(float(r2),   4),
        },
        "feature_importances": feature_importances,
    }
    with open(os.path.join(MODEL_DIR, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    # model_accuracy.json — dedicated train/test breakdown
    accuracy_report = {
        "last_trained": str(date.today()),
        "dataset": "Student_Dataset.csv",
        "test_size": 0.2,
        "random_state": 42,
        "engineered_features": engineered_cols,
        "placement_classifier": {
            "model": "RandomForestClassifier + CalibratedClassifierCV(isotonic, cv=5)",
            "hyperparameters": {
                "n_estimators": 300,
                "max_depth": "None (full trees)",
                "min_samples_split": 5,
                "min_samples_leaf": 2,
                "max_features": "sqrt",
                "calibration": "isotonic, 5-fold CV",
            },
            "training": {
                "accuracy":  round(float(train_acc),  4),
                "precision": round(float(train_prec), 4),
                "recall":    round(float(train_rec),  4),
                "f1_score":  round(float(train_f1),   4),
            },
            "testing_default_threshold": {
                "threshold": 0.5,
                "accuracy":  round(float(acc),  4),
                "precision": round(float(prec), 4),
                "recall":    round(float(rec),  4),
                "f1_score":  round(float(f1),   4),
                "roc_auc":   round(float(auc),  4),
                "confusion_matrix": cm,
            },
            "testing_optimal_threshold": {
                "threshold": best_thresh,
                "accuracy":  round(float(opt_acc),  4),
                "precision": round(float(opt_prec), 4),
                "recall":    round(float(opt_rec),  4),
                "f1_score":  round(float(opt_f1),   4),
            },
        },
        "salary_regressor": {
            "model": "HistGradientBoostingRegressor",
            "hyperparameters": {
                "max_iter": 500,
                "max_depth": 8,
                "learning_rate": 0.03,
                "min_samples_leaf": 30,
                "l2_regularization": 0.1,
            },
            "subset": "Placed students only",
            "training": {
                "rmse_lpa": round(float(train_rmse), 4),
                "mae_lpa":  round(float(train_mae),  4),
                "r2_score": round(float(train_r2),   4),
            },
            "testing": {
                "rmse_lpa": round(float(rmse), 4),
                "mae_lpa":  round(float(mae),  4),
                "r2_score": round(float(r2),   4),
            },
        },
    }
    with open(os.path.join(MODEL_DIR, "model_accuracy.json"), "w") as f:
        json.dump(accuracy_report, f, indent=2)
    print("Model accuracy saved to backend/models/model_accuracy.json")

    print("\nModel training and export complete!")


if __name__ == "__main__":
    train_and_save_models()
