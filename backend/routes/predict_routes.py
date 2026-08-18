import os
import joblib
import pandas as pd
import numpy as np
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from backend.schemas import StudentProfileInput, ReadinessPredictionOutput, FeatureContribution, CategoryImpact
from backend.auth import get_current_user_optional
from backend.db import db

router = APIRouter(prefix="/predict", tags=["Prediction"])

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
clf_path = os.path.join(MODEL_DIR, "placement_clf.joblib")
reg_path = os.path.join(MODEL_DIR, "salary_reg.joblib")
prep_path = os.path.join(MODEL_DIR, "preprocessor.joblib")

# Load models at module level
clf = joblib.load(clf_path) if os.path.exists(clf_path) else None
reg = joblib.load(reg_path) if os.path.exists(reg_path) else None
preprocessor = joblib.load(prep_path) if os.path.exists(prep_path) else None

# Initialize SHAP TreeExplainer once at startup
explainer = None
if clf is not None:
    try:
        import shap
        explainer = shap.TreeExplainer(clf)
    except Exception as e:
        print(f"Failed to initialize SHAP TreeExplainer: {e}")

FEATURE_CONFIG = {
    'cgpa': {'name': 'CGPA', 'category': 'Academic Record'},
    'backlogs': {'name': 'Backlogs', 'category': 'Academic Record'},
    'college_tier': {'name': 'College Tier', 'category': 'Academic Record'},
    'age': {'name': 'Age', 'category': 'Academic Record'},
    
    'aptitude_score': {'name': 'Aptitude Score', 'category': 'Technical Skills'},
    'github_repos': {'name': 'GitHub Repos', 'category': 'Technical Skills'},
    'projects_count': {'name': 'Projects', 'category': 'Technical Skills'},
    'certifications_count': {'name': 'Certifications', 'category': 'Technical Skills'},
    'branch': {'name': 'Branch', 'category': 'Technical Skills'},
    
    'communication_skill_score': {'name': 'Communication Skill', 'category': 'Soft Skills'},
    'leadership_score': {'name': 'Leadership Score', 'category': 'Soft Skills'},
    'extracurricular_score': {'name': 'Extracurriculars', 'category': 'Soft Skills'},
    'volunteer_experience': {'name': 'Volunteer Experience', 'category': 'Soft Skills'},
    
    'internships_count': {'name': 'Internships', 'category': 'Industry Exposure'},
    'hackathons_participated': {'name': 'Hackathons', 'category': 'Industry Exposure'},
    'linkedin_connections': {'name': 'LinkedIn Connections', 'category': 'Industry Exposure'},
    'study_hours_per_day': {'name': 'Study Hours', 'category': 'Industry Exposure'},
    'sleep_hours': {'name': 'Sleep Hours', 'category': 'Industry Exposure'},
    'gender': {'name': 'Gender', 'category': 'Industry Exposure'},
}

CATEGORIES = ["Academic Record", "Technical Skills", "Soft Skills", "Industry Exposure"]

@router.post("/readiness", response_model=ReadinessPredictionOutput)
def predict_readiness(
    profile: StudentProfileInput,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    if clf is None or preprocessor is None or reg is None:
        raise HTTPException(status_code=500, detail="ML models not trained yet. Run backend/ml/train_models.py")

    profile_dict = profile.model_dump()
    input_df = pd.DataFrame([profile_dict])
    
    # Preprocess feature vector
    X_trans = preprocessor.transform(input_df)
    
    # Classifier probability of placement
    probs = clf.predict_proba(X_trans)[0]
    # Class order in RandomForestClassifier classes_ array
    placed_idx = list(clf.classes_).index('Placed') if 'Placed' in clf.classes_ else 1
    prob_placed = float(probs[placed_idx])
    
    readiness_score = round(prob_placed * 100.0, 2)
    predicted_status = "Placed" if prob_placed >= 0.48 else "Not Placed"
    
    # Regressor predicted salary
    raw_salary = float(reg.predict(X_trans)[0])
    if predicted_status == "Placed":
        predicted_salary_lpa = round(max(3.5, raw_salary), 2)
    else:
        predicted_salary_lpa = round(max(0.0, raw_salary * prob_placed), 2)
        
    # Feature importances mapping
    cat_cols = ['gender', 'branch', 'college_tier', 'volunteer_experience']
    num_cols = [
        'age', 'cgpa', 'internships_count', 'projects_count', 'certifications_count',
        'aptitude_score', 'communication_skill_score', 'hackathons_participated',
        'github_repos', 'linkedin_connections', 'backlogs', 'extracurricular_score',
        'leadership_score', 'sleep_hours', 'study_hours_per_day'
    ]
    
    cat_feature_names = list(preprocessor.named_transformers_['cat'].get_feature_names_out(cat_cols))
    all_feature_names = cat_feature_names + num_cols
    
    raw_importances = dict(zip(all_feature_names, clf.feature_importances_.tolist()))
    
    # Group feature importances for intuitive visual charts
    grouped_importances = {
        "CGPA & Academic Record": round((raw_importances.get('cgpa', 0) + raw_importances.get('backlogs', 0)) * 100, 2),
        "Aptitude & Technical Skills": round((raw_importances.get('aptitude_score', 0) + raw_importances.get('github_repos', 0) + raw_importances.get('projects_count', 0)) * 100, 2),
        "Communication & Leadership": round((raw_importances.get('communication_skill_score', 0) + raw_importances.get('leadership_score', 0)) * 100, 2),
        "Internships & Industry Exposure": round((raw_importances.get('internships_count', 0) + raw_importances.get('certifications_count', 0) + raw_importances.get('hackathons_participated', 0)) * 100, 2),
        "Study Discipline & Habits": round((raw_importances.get('study_hours_per_day', 0) + raw_importances.get('sleep_hours', 0) + raw_importances.get('extracurricular_score', 0)) * 100, 2)
    }

    # SHAP calculation with fallback
    base_value = readiness_score
    top_contributions = []
    category_impacts = []

    if explainer is not None:
        try:
            shap_vals = explainer.shap_values(X_trans)
            
            # Extract shap vector for 'Placed' class
            if isinstance(shap_vals, list):
                sv = shap_vals[placed_idx][0]
                exp_val = explainer.expected_value[placed_idx]
            elif isinstance(shap_vals, np.ndarray) and len(shap_vals.shape) == 3:
                sv = shap_vals[0, :, placed_idx]
                exp_val = explainer.expected_value[placed_idx]
            else:
                sv = shap_vals[0]
                exp_val = explainer.expected_value if isinstance(explainer.expected_value, (float, int)) else explainer.expected_value[0]
            
            # Base value scaled to 0-100 readiness score scale
            base_value = round(float(exp_val) * 100.0, 2)
            
            # Map transformed feature columns back to raw features
            feature_contributions_list = []
            category_totals = {cat: 0.0 for cat in CATEGORIES}

            for raw_key, cfg in FEATURE_CONFIG.items():
                friendly_name = cfg['name']
                category = cfg['category']
                val = profile_dict.get(raw_key, "")

                # Aggregate SHAP contribution across one-hot or numeric column matches
                total_shap_val = 0.0
                for idx, fname in enumerate(all_feature_names):
                    if fname == raw_key or fname.startswith(f"{raw_key}_"):
                        total_shap_val += float(sv[idx])

                # Scaled contribution in readiness score points
                contrib_points = round(total_shap_val * 100.0, 2)
                
                category_totals[category] += contrib_points

                feature_contributions_list.append(FeatureContribution(
                    feature_name=friendly_name,
                    value=val,
                    shap_contribution=contrib_points,
                    category=category
                ))

            # Sort by absolute SHAP contribution descending and pick top 6
            feature_contributions_list.sort(key=lambda x: abs(x.shap_contribution), reverse=True)
            top_contributions = feature_contributions_list[:6]

            # Construct CategoryImpact items
            category_impacts = [
                CategoryImpact(category=cat, total_contribution=round(category_totals[cat], 2))
                for cat in CATEGORIES
            ]

        except Exception as err:
            print(f"SHAP computation error: {err}")
            base_value = readiness_score
            top_contributions = []
            category_impacts = []
    
    output = ReadinessPredictionOutput(
        readiness_score=readiness_score,
        predicted_status=predicted_status,
        predicted_salary_lpa=predicted_salary_lpa,
        feature_importances=grouped_importances,
        base_value=base_value,
        top_contributions=top_contributions,
        category_impacts=category_impacts
    )
    
    if current_user and isinstance(current_user, dict) and "email" in current_user:
        db.save_student_profile(current_user["email"], profile_dict, output.model_dump())
        
    return output

