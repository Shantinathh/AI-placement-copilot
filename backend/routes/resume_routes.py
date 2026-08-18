from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from backend.schemas import ResumeAnalysisOutput
from backend.services.resume_parser import parse_resume_content
from backend.auth import get_current_user_optional
from backend.db import db

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/analyze", response_model=ResumeAnalysisOutput)
async def analyze_resume(
    file: UploadFile = File(...),
    domain: Optional[str] = Form(default=""),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing.")
        
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
    analysis = parse_resume_content(file.filename, content, domain=domain or "")
    
    output = ResumeAnalysisOutput(**analysis)
    
    if current_user and "email" in current_user:
        db.save_resume_analysis(current_user["email"], output.model_dump())
        
    return output
