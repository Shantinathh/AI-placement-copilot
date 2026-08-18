from typing import List, Optional, Union, Dict, Any
from fastapi import APIRouter, Body
from backend.schemas import StudentProfileInput, SkillGapOutput, SkillGapItem, SkillGapRequestInput

router = APIRouter(prefix="/skills", tags=["Skills"])

BENCHMARKS = {
    "Tier 1": {
        "cgpa": 8.0,
        "aptitude": 80.0,
        "communication": 80.0,
        "internships": 2,
        "projects": 4,
        "github_repos": 8,
        "leadership": 70.0,
        "backlogs": 0
    },
    "Tier 2": {
        "cgpa": 7.5,
        "aptitude": 75.0,
        "communication": 75.0,
        "internships": 2,
        "projects": 3,
        "github_repos": 6,
        "leadership": 65.0,
        "backlogs": 0
    },
    "Tier 3": {
        "cgpa": 7.0,
        "aptitude": 70.0,
        "communication": 70.0,
        "internships": 1,
        "projects": 3,
        "github_repos": 5,
        "leadership": 60.0,
        "backlogs": 0
    }
}

SKILL_SPECIFIC_TIPS = {
    "docker": ("High", "Learn containerization basics; write a Dockerfile and docker-compose.yml for your backend service, and add the repository badge to your resume."),
    "kubernetes": ("Medium", "Understand cluster architecture, Pods, Services, and Deployments. Deploy a multi-container app locally using Minikube or k3s."),
    "system design": ("High", "Master high-level architecture: load balancers, CDN, caching (Redis), horizontal scaling, and SQL vs NoSQL trade-offs for technical interview rounds."),
    "redis": ("High", "Implement in-memory caching, rate-limiting, and session store in an API project to demonstrate backend performance optimization."),
    "graphql": ("Medium", "Build a GraphQL API with queries, mutations, and resolvers as a modern alternative to RESTful endpoints."),
    "ci/cd": ("High", "Configure automated CI/CD pipelines via GitHub Actions to run linters, unit tests, and automated Docker build deployments."),
    "typescript": ("High", "Strengthen frontend/backend type safety by building a full-stack project utilizing TypeScript with strict type checking."),
    "aws": ("High", "Deploy a live project using AWS EC2, S3, and Lambda/RDS; understand IAM roles and cloud cost management basics."),
    "sql": ("High", "Practice advanced SQL: indexing, window functions, query plans, ACID transactions, and normalization on LeetCode/HackerRank."),
    "mongodb": ("Medium", "Build schema models with aggregation pipelines, indexing, and replica sets for unstructured data handling."),
    "microservices": ("High", "Decompose a monolithic application into modular services communicating via REST/gRPC or message queues (Kafka/RabbitMQ)."),
    "kafka": ("Medium", "Build event-driven data streaming pipelines with producers, consumer groups, and topic partitions."),
    "fastapi": ("Medium", "Build high-throughput asynchronous REST APIs with Pydantic validation, dependency injection, and auto-generated OpenAPI docs."),
    "react": ("High", "Master modern React with Hooks, context state management, reusable UI component patterns, and responsive design."),
    "machine learning": ("High", "Implement end-to-end ML pipelines: feature engineering, model tuning (XGBoost/LightGBM), and inference API deployment.")
}

def get_skill_tip(skill_name: str, domain: str = "General") -> tuple[str, str]:
    skill_clean = skill_name.lower().strip()
    for key, (sev, tip) in SKILL_SPECIFIC_TIPS.items():
        if key in skill_clean or skill_clean in key:
            return sev, tip
    return "Medium", f"Learn core fundamentals of {skill_name}, build a feature/mini-project demonstrating practical implementation, and highlight it on your resume."

def evaluate_profile_gaps(profile: StudentProfileInput) -> List[SkillGapItem]:
    tier = profile.college_tier if profile.college_tier in BENCHMARKS else "Tier 2"
    bench = BENCHMARKS[tier]
    gaps: List[SkillGapItem] = []
    
    # 1. Communication & Soft Skills (Primary User Focus)
    comm_gap = bench["communication"] - profile.communication_skill_score
    if comm_gap > 0:
        sev = "High" if comm_gap > 20 else ("Medium" if comm_gap > 8 else "Low")
        gaps.append(SkillGapItem(
            area="Communication & Group Discussions",
            current_value=profile.communication_skill_score,
            benchmark=bench["communication"],
            severity=sev,
            category="Readiness & Soft Skills",
            tip="Participate in mock HR interviews, technical presentation sessions, and group discussions to boost fluency and articulation."
        ))
    else:
        gaps.append(SkillGapItem(
            area="Communication & Group Discussions",
            current_value=profile.communication_skill_score,
            benchmark=bench["communication"],
            severity="Low",
            category="Readiness & Soft Skills",
            tip="Excellent communication skills! Continue practicing elevator pitches and behavioral STAR-method responses."
        ))

    # 2. Aptitude & Logical Reasoning
    apt_gap = bench["aptitude"] - profile.aptitude_score
    if apt_gap > 0:
        sev = "High" if apt_gap > 20 else ("Medium" if apt_gap > 10 else "Low")
        gaps.append(SkillGapItem(
            area="Aptitude & Logical Reasoning",
            current_value=profile.aptitude_score,
            benchmark=bench["aptitude"],
            severity=sev,
            category="Readiness & Soft Skills",
            tip="Practice quantitative aptitude, data interpretation, and logical reasoning tests daily on IndiaBIX or LeetCode."
        ))
    else:
        gaps.append(SkillGapItem(
            area="Aptitude & Logical Reasoning",
            current_value=profile.aptitude_score,
            benchmark=bench["aptitude"],
            severity="Low",
            category="Readiness & Soft Skills",
            tip="Strong analytical skills. Continue timed speed tests to maintain speed and accuracy during company online rounds."
        ))

    # 3. Internships
    if profile.internships_count < bench["internships"]:
        sev = "High" if profile.internships_count == 0 else "Medium"
        gaps.append(SkillGapItem(
            area="Internship Experience",
            current_value=float(profile.internships_count),
            benchmark=float(bench["internships"]),
            severity=sev,
            category="Readiness & Soft Skills",
            tip="Target virtual internships, open-source programs (GSoC/MLH), or industry research projects to gain practical experience."
        ))

    # 4. GitHub & Coding Projects
    if profile.github_repos < bench["github_repos"] or profile.projects_count < bench["projects"]:
        gaps.append(SkillGapItem(
            area="Projects & GitHub Portfolio",
            current_value=float(profile.projects_count),
            benchmark=float(bench["projects"]),
            severity="Medium",
            category="Readiness & Soft Skills",
            tip="Build 2 full-stack/AI deployed projects with live URLs, documentation, and clean GitHub repositories."
        ))

    # 5. Leadership & Extracurriculars
    if profile.leadership_score < bench.get("leadership", 65.0):
        gaps.append(SkillGapItem(
            area="Leadership & Team Collaboration",
            current_value=profile.leadership_score,
            benchmark=bench.get("leadership", 65.0),
            severity="Medium",
            category="Readiness & Soft Skills",
            tip="Take up team lead roles in hackathons or college technical clubs to build verifiable leadership credentials for HR rounds."
        ))

    # 6. Academic CGPA
    cgpa_gap = bench["cgpa"] - profile.cgpa
    if cgpa_gap > 0:
        sev = "High" if cgpa_gap > 1.2 else ("Medium" if cgpa_gap > 0.5 else "Low")
        gaps.append(SkillGapItem(
            area="Academic CGPA",
            current_value=profile.cgpa,
            benchmark=bench["cgpa"],
            severity=sev,
            category="Readiness & Soft Skills",
            tip=f"Your CGPA is below the target benchmark of {bench['cgpa']}. Focus on semester exams to maintain a clean academic record."
        ))

    # 7. Active Backlogs
    if profile.backlogs > 0:
        gaps.append(SkillGapItem(
            area="Active Backlogs",
            current_value=float(profile.backlogs),
            benchmark=0.0,
            severity="High",
            category="Readiness & Soft Skills",
            tip="Clear all active backlogs before placement season begins, as top product/service companies mandate 0 active backlogs."
        ))

    return gaps

def evaluate_resume_gaps(missing_skills: List[str], domain: str = "General") -> List[SkillGapItem]:
    gaps: List[SkillGapItem] = []
    for skill in missing_skills:
        clean_name = skill.strip()
        if not clean_name:
            continue
        severity, tip = get_skill_tip(clean_name, domain)
        gaps.append(SkillGapItem(
            area=f"Missing Skill: {clean_name}",
            current_value="Not in Resume",
            benchmark="Industry Standard",
            severity=severity, # type: ignore
            category="Resume & Technical Skills",
            tip=tip
        ))
    return gaps

@router.post("/gap-analysis", response_model=SkillGapOutput)
def analyze_skill_gaps(payload: Union[SkillGapRequestInput, StudentProfileInput, Dict[str, Any]] = Body(...)):
    # 1. Parse Profile
    profile_data = None
    missing_skills: List[str] = []
    domain: str = "General"

    if isinstance(payload, SkillGapRequestInput):
        profile_data = payload.profile
        missing_skills = payload.missing_skills or []
        domain = payload.domain or "General"
    elif isinstance(payload, StudentProfileInput):
        profile_data = payload
    elif isinstance(payload, dict):
        if "profile" in payload and payload["profile"]:
            try:
                profile_data = StudentProfileInput(**payload["profile"])
            except Exception:
                profile_data = None
        elif "cgpa" in payload:
            try:
                profile_data = StudentProfileInput(**payload)
            except Exception:
                profile_data = None
        missing_skills = payload.get("missing_skills", []) or []
        domain = payload.get("domain", "General")

    all_gaps: List[SkillGapItem] = []
    readiness_count = 0
    resume_count = 0

    # 2. Add Profile / Readiness Gaps (e.g. Communication, Aptitude, Projects)
    if profile_data is not None:
        p_gaps = evaluate_profile_gaps(profile_data)
        all_gaps.extend(p_gaps)
        readiness_count = len(p_gaps)

    # 3. Add Resume Missing Skills Gaps (e.g. Docker, Redis, Kubernetes)
    if missing_skills:
        r_gaps = evaluate_resume_gaps(missing_skills, domain)
        all_gaps.extend(r_gaps)
        resume_count = len(r_gaps)

    return SkillGapOutput(
        gaps=all_gaps,
        total_gaps=len(all_gaps),
        readiness_gaps_count=readiness_count,
        resume_gaps_count=resume_count
    )
