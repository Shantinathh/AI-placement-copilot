from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends
from backend.schemas import RoadmapRequestInput, RoadmapOutput
from backend.services.ai_roadmap import generate_ai_roadmap
from backend.auth import get_current_user_optional
from backend.db import db

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

@router.post("/generate", response_model=RoadmapOutput)
def generate_roadmap(
    body: RoadmapRequestInput,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    skill_gaps = list(body.skill_gaps) if body.skill_gaps else []
    branch = body.branch or "CSE"
    readiness_score = body.readiness_score if body.readiness_score is not None else 75.0

    # If gaps are empty, attempt to populate from logged-in user's profile and resume
    if current_user and "email" in current_user:
        user_email = current_user["email"]
        profile_doc = db.get_student_profile(user_email)
        resume_doc = db.get_resume_analysis(user_email)
        
        if not skill_gaps and (profile_doc or resume_doc):
            from backend.routes.skills_routes import analyze_skill_gaps
            gap_res = analyze_skill_gaps({
                "profile": profile_doc.get("profile") if profile_doc else None,
                "missing_skills": resume_doc.get("analysis", {}).get("missing_skills", []) if resume_doc else [],
                "domain": resume_doc.get("analysis", {}).get("domain", "General") if resume_doc else "General"
            })
            skill_gaps = [g.area.replace("Missing Skill: ", "").strip() for g in gap_res.gaps if g.severity in ["High", "Medium"]]

        if profile_doc and "profile" in profile_doc and not body.branch:
            branch = profile_doc["profile"].get("branch", branch)
        if profile_doc and "prediction" in profile_doc and (body.readiness_score is None or body.readiness_score == 75.0):
            readiness_score = profile_doc["prediction"].get("readiness_score", readiness_score)

    # Check if a saved roadmap already exists and not explicitly forcing regeneration
    if not body.force_regenerate and current_user and "email" in current_user:
        existing = db.get_roadmap(current_user["email"])
        if existing and "roadmap" in existing and "weeks" in existing["roadmap"]:
            return RoadmapOutput(**{k: v for k, v in existing["roadmap"].items() if k != "completed_tasks"})

    roadmap_data = generate_ai_roadmap(
        readiness_score=readiness_score,
        skill_gaps=skill_gaps,
        branch=branch
    )

    output = RoadmapOutput(**roadmap_data)

    if current_user and "email" in current_user:
        db.save_roadmap(current_user["email"], output.model_dump())

    return output


@router.get("/progress")
def get_roadmap_progress(
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """Return the persisted completed_tasks map for the current user."""
    if current_user and "email" in current_user:
        doc = db.get_roadmap(current_user["email"])
        if doc and "roadmap" in doc:
            completed_tasks = doc["roadmap"].get("completed_tasks", {})
            return {"status": "ok", "completed_tasks": completed_tasks}
    return {"status": "guest", "completed_tasks": {}}


@router.post("/progress")
def save_roadmap_progress(
    progress_data: Dict[str, Any],
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """Persist only the completed_tasks — never overwrites the weeks array."""
    if current_user and "email" in current_user:
        completed_tasks = progress_data.get("completed_tasks", {})
        db.save_roadmap_progress(current_user["email"], completed_tasks)
        return {"status": "success", "message": "Progress saved successfully."}
    return {"status": "guest", "message": "Guest progress stored locally in session."}
