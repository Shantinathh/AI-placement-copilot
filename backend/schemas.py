from typing import Literal, List, Dict, Optional, Union
from pydantic import BaseModel, Field, EmailStr

class StudentProfileInput(BaseModel):
    age: int = Field(..., ge=18, le=24, description="Age between 18 and 24")
    gender: Literal["Male", "Female"] = Field(..., description="Gender")
    cgpa: float = Field(..., ge=4.5, le=10.0, description="CGPA between 4.5 and 10.0")
    branch: Literal["IT", "CSE", "AIML", "EEE", "Civil", "Mechanical", "ECE"] = Field(..., description="Branch")
    college_tier: Literal["Tier 1", "Tier 2", "Tier 3"] = Field(..., description="College Tier")
    internships_count: int = Field(..., ge=0, le=8, description="Internships count (0-8)")
    projects_count: int = Field(..., ge=0, le=13, description="Projects count (0-13)")
    certifications_count: int = Field(..., ge=0, le=11, description="Certifications count (0-11)")
    aptitude_score: float = Field(..., ge=20.0, le=100.0, description="Aptitude score (20-100)")
    communication_skill_score: float = Field(..., ge=20.0, le=100.0, description="Communication skill score (20-100)")
    hackathons_participated: int = Field(..., ge=0, le=8, description="Hackathons count (0-8)")
    github_repos: int = Field(..., ge=0, le=16, description="GitHub repos (0-16)")
    linkedin_connections: int = Field(..., ge=0, le=100000, description="LinkedIn connections / followers (0-100000)")
    backlogs: int = Field(..., ge=0, le=6, description="Active backlogs (0-6)")
    extracurricular_score: float = Field(..., ge=0.0, le=100.0, description="Extracurricular score (0-100)")
    leadership_score: float = Field(..., ge=0.0, le=100.0, description="Leadership score (0-100)")
    volunteer_experience: Literal["Yes", "No"] = Field(..., description="Volunteer experience")
    sleep_hours: float = Field(..., ge=3.0, le=10.0, description="Sleep hours (3-10)")
    study_hours_per_day: float = Field(..., ge=0.5, le=10.0, description="Study hours per day (0.5-10)")

class FeatureContribution(BaseModel):
    feature_name: str
    value: Union[float, str]
    shap_contribution: float
    category: Literal["Academic Record", "Technical Skills", "Soft Skills", "Industry Exposure"]

class CategoryImpact(BaseModel):
    category: Literal["Academic Record", "Technical Skills", "Soft Skills", "Industry Exposure"]
    total_contribution: float

class ReadinessPredictionOutput(BaseModel):
    readiness_score: float = Field(..., ge=0.0, le=100.0)
    predicted_status: Literal["Placed", "Not Placed"]
    predicted_salary_lpa: float
    feature_importances: Dict[str, float]
    base_value: float = 50.0
    top_contributions: List[FeatureContribution] = Field(default_factory=list)
    category_impacts: List[CategoryImpact] = Field(default_factory=list)

class ResumeAnalysisOutput(BaseModel):
    ats_score: float = Field(..., ge=0.0, le=100.0)
    extracted_skills: List[str]
    missing_skills: List[str]
    quality_checks: Dict[str, bool]
    domain: Optional[str] = "General"

class SkillGapItem(BaseModel):
    area: str
    current_value: Union[float, str]
    benchmark: Union[float, str]
    severity: Literal["Low", "Medium", "High"]
    tip: str
    category: Optional[str] = "Readiness & Profile"

class SkillGapRequestInput(BaseModel):
    profile: Optional[StudentProfileInput] = None
    missing_skills: Optional[List[str]] = Field(default_factory=list)
    extracted_skills: Optional[List[str]] = Field(default_factory=list)
    domain: Optional[str] = "General"

class SkillGapOutput(BaseModel):
    gaps: List[SkillGapItem]
    total_gaps: int = 0
    readiness_gaps_count: int = 0
    resume_gaps_count: int = 0

class CompanyRecommendation(BaseModel):
    name: str
    expected_package_lpa: float
    match_percentage: float = Field(..., ge=0.0, le=100.0)
    readiness_fit_pct: float = Field(..., ge=0.0, le=100.0)
    ats_fit_pct: float = Field(..., ge=0.0, le=100.0)
    matched_skills: List[str] = Field(default_factory=list)
    branch_suitability: Optional[List[str]] = None
    min_tier: Optional[str] = None
    roles: Optional[List[str]] = None
    category: str = "Tier-2 Tech"
    is_stretch_goal: bool = False

class RoadmapWeekTask(BaseModel):
    title: str
    tasks: List[str]

class RoadmapRequestInput(BaseModel):
    readiness_score: float = Field(..., ge=0.0, le=100.0)
    skill_gaps: List[str]
    branch: str
    weak_areas: Optional[List[str]] = Field(default_factory=list)
    force_regenerate: Optional[bool] = False

class RoadmapOutput(BaseModel):
    weeks: List[RoadmapWeekTask]

class SignupInput(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class TokenOutput(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, str]

class DashboardSummaryOutput(BaseModel):
    user_name: str
    readiness: Optional[ReadinessPredictionOutput] = None
    ats: Optional[ResumeAnalysisOutput] = None
    skill_gaps: Optional[List[SkillGapItem]] = None
    top_companies: Optional[List[CompanyRecommendation]] = None
    roadmap: Optional[RoadmapOutput] = None
