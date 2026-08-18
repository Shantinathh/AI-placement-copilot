from typing import List, Optional
from fastapi import APIRouter, Query
from backend.schemas import CompanyRecommendation

router = APIRouter(prefix="/companies", tags=["Companies"])

COMPANY_DATABASE = [
    # 1. Product Giants / MAANG
    {
        "name": "Google",
        "category": "Product Giants / MAANG",
        "expected_package_lpa": 32.0,
        "branches": ["CSE", "IT", "AIML", "ECE"],
        "min_readiness": 78,
        "min_aptitude": 80,
        "min_comm": 75,
        "target_skills": ["Python", "C++", "Java", "System Design", "Algorithms", "Machine Learning", "Git"],
        "roles": ["Software Engineer", "Systems Engineer", "ML Engineer"]
    },
    {
        "name": "Microsoft",
        "category": "Product Giants / MAANG",
        "expected_package_lpa": 28.5,
        "branches": ["CSE", "IT", "AIML", "ECE", "EEE"],
        "min_readiness": 75,
        "min_aptitude": 78,
        "min_comm": 75,
        "target_skills": ["C++", "Java", "Python", "SQL", "Azure", "System Design", "REST API"],
        "roles": ["Software Development Engineer", "Cloud Solution Architect"]
    },
    {
        "name": "Amazon",
        "category": "Product Giants / MAANG",
        "expected_package_lpa": 26.0,
        "branches": ["CSE", "IT", "AIML", "ECE", "EEE"],
        "min_readiness": 72,
        "min_aptitude": 75,
        "min_comm": 70,
        "target_skills": ["Java", "Python", "Data Structures", "AWS", "SQL", "System Design"],
        "roles": ["SDE-1", "Operations Analyst", "Support Engineer"]
    },
    {
        "name": "Atlassian",
        "category": "Product Giants / MAANG",
        "expected_package_lpa": 30.0,
        "branches": ["CSE", "IT", "AIML"],
        "min_readiness": 80,
        "min_aptitude": 82,
        "min_comm": 80,
        "target_skills": ["React", "Node.js", "Java", "Python", "Git", "Docker", "REST API"],
        "roles": ["Site Reliability Engineer", "Full Stack Developer"]
    },

    # 2. Tier-2 Tech
    {
        "name": "Qualcomm",
        "category": "Tier-2 Tech",
        "expected_package_lpa": 18.0,
        "branches": ["ECE", "EEE", "CSE", "AIML"],
        "min_readiness": 68,
        "min_aptitude": 70,
        "min_comm": 65,
        "target_skills": ["C", "C++", "Embedded Systems", "Linux", "Signal Processing", "VLSI", "Python"],
        "roles": ["Hardware Engineer", "Firmware Engineer", "Embedded Systems Dev"]
    },
    {
        "name": "Oracle",
        "category": "Tier-2 Tech",
        "expected_package_lpa": 16.5,
        "branches": ["CSE", "IT", "AIML", "ECE"],
        "min_readiness": 65,
        "min_aptitude": 68,
        "min_comm": 65,
        "target_skills": ["SQL", "Java", "PostgreSQL", "Database", "Python", "REST API"],
        "roles": ["Applications Developer", "Database Administrator"]
    },
    {
        "name": "Cisco",
        "category": "Tier-2 Tech",
        "expected_package_lpa": 17.5,
        "branches": ["CSE", "IT", "ECE", "EEE"],
        "min_readiness": 66,
        "min_aptitude": 70,
        "min_comm": 70,
        "target_skills": ["Networking", "Python", "C++", "Linux", "Cybersecurity"],
        "roles": ["Network Engineer", "Software Engineer"]
    },
    {
        "name": "Salesforce",
        "category": "Tier-2 Tech",
        "expected_package_lpa": 20.0,
        "branches": ["CSE", "IT", "AIML"],
        "min_readiness": 70,
        "min_aptitude": 72,
        "min_comm": 75,
        "target_skills": ["Apex", "Java", "JavaScript", "Cloud Architecture", "REST API"],
        "roles": ["Cloud Developer", "Software Engineer"]
    },

    # 3. Product Startups
    {
        "name": "Razorpay",
        "category": "Product Startups",
        "expected_package_lpa": 22.0,
        "branches": ["CSE", "IT", "AIML", "ECE"],
        "min_readiness": 68,
        "min_aptitude": 70,
        "min_comm": 70,
        "target_skills": ["Node.js", "React", "Go", "Python", "Distributed Systems", "SQL"],
        "roles": ["Backend Developer", "Frontend Developer"]
    },
    {
        "name": "Swiggy",
        "category": "Product Startups",
        "expected_package_lpa": 19.0,
        "branches": ["CSE", "IT", "AIML"],
        "min_readiness": 64,
        "min_aptitude": 68,
        "min_comm": 65,
        "target_skills": ["Java", "Python", "Kafka", "Redis", "Microservices", "Docker"],
        "roles": ["Software Engineer", "Data Engineer"]
    },
    {
        "name": "Postman",
        "category": "Product Startups",
        "expected_package_lpa": 21.0,
        "branches": ["CSE", "IT", "AIML", "ECE"],
        "min_readiness": 66,
        "min_aptitude": 70,
        "min_comm": 72,
        "target_skills": ["JavaScript", "TypeScript", "Node.js", "API Testing", "Electron"],
        "roles": ["Product Engineer", "API Specialist"]
    },
    {
        "name": "Zerodha",
        "category": "Product Startups",
        "expected_package_lpa": 18.5,
        "branches": ["CSE", "IT", "AIML", "ECE", "EEE"],
        "min_readiness": 62,
        "min_aptitude": 66,
        "min_comm": 65,
        "target_skills": ["Python", "Go", "PostgreSQL", "Vue.js", "Linux"],
        "roles": ["Systems Engineer", "Full Stack Developer"]
    },

    # 4. Global IT Services
    {
        "name": "TCS Digital",
        "category": "Global IT Services",
        "expected_package_lpa": 7.5,
        "branches": ["IT", "CSE", "AIML", "EEE", "Civil", "Mechanical", "ECE"],
        "min_readiness": 50,
        "min_aptitude": 55,
        "min_comm": 55,
        "target_skills": ["Python", "Java", "SQL", "Data Structures", "Git", "Communication"],
        "roles": ["Digital Engineer", "System Associate"]
    },
    {
        "name": "Infosys Power Programmer",
        "category": "Global IT Services",
        "expected_package_lpa": 9.5,
        "branches": ["IT", "CSE", "AIML", "ECE", "EEE"],
        "min_readiness": 58,
        "min_aptitude": 60,
        "min_comm": 60,
        "target_skills": ["Java", "Python", "SQL", "Full Stack", "Data Structures", "Git"],
        "roles": ["Specialist Programmer", "Digital Specialist Engineer"]
    },
    {
        "name": "Accenture Innovation",
        "category": "Global IT Services",
        "expected_package_lpa": 6.5,
        "branches": ["IT", "CSE", "AIML", "EEE", "Civil", "Mechanical", "ECE"],
        "min_readiness": 42,
        "min_aptitude": 45,
        "min_comm": 50,
        "target_skills": ["Python", "Java", "Communication", "Problem Solving", "Agile"],
        "roles": ["Advanced Application Engineering Associate"]
    },
    {
        "name": "Cognizant GenC Next",
        "category": "Global IT Services",
        "expected_package_lpa": 6.8,
        "branches": ["IT", "CSE", "AIML", "ECE", "EEE"],
        "min_readiness": 45,
        "min_aptitude": 50,
        "min_comm": 50,
        "target_skills": ["Java", "React", "SQL", "Git", "Communication"],
        "roles": ["Full Stack Trainee"]
    },
    {
        "name": "TCS Ninja / Wipro Elite",
        "category": "Global IT Services",
        "expected_package_lpa": 4.0,
        "branches": ["IT", "CSE", "AIML", "EEE", "Civil", "Mechanical", "ECE"],
        "min_readiness": 20,
        "min_aptitude": 35,
        "min_comm": 40,
        "target_skills": ["Communication", "Problem Solving", "Python", "Java"],
        "roles": ["Project Engineer", "Associate Software Engineer"]
    },

    # 5. Core Engineering
    {
        "name": "Tata Motors",
        "category": "Core Engineering",
        "expected_package_lpa": 9.0,
        "branches": ["Mechanical", "EEE", "Civil"],
        "min_readiness": 52,
        "min_aptitude": 55,
        "min_comm": 55,
        "target_skills": ["AutoCAD", "Thermodynamics", "Mechanics", "CAD", "Matlab"],
        "roles": ["Graduate Engineer Trainee", "Design Engineer"]
    },
    {
        "name": "Larsen & Toubro (L&T)",
        "category": "Core Engineering",
        "expected_package_lpa": 7.0,
        "branches": ["Civil", "Mechanical", "EEE"],
        "min_readiness": 48,
        "min_aptitude": 50,
        "min_comm": 50,
        "target_skills": ["Civil", "Structural Analysis", "AutoCAD", "Project Management"],
        "roles": ["Project Engineer", "Structural Analyst"]
    }
]

@router.get("/recommend", response_model=List[CompanyRecommendation])
def recommend_companies(
    readiness_score: float = 75.0,
    ats_score: float = 75.0,
    aptitude_score: float = 75.0,
    comm_score: float = 75.0,
    skills: Optional[str] = "",
    branch: str = "CSE",
    college_tier: str = "Tier 2"
):
    branch_upper = branch.upper().strip() if isinstance(branch, str) else "CSE"
    tier_upper = college_tier.strip() if isinstance(college_tier, str) else "Tier 2"

    # Parse candidate resume skills safely
    if not isinstance(skills, str):
        skills = ""
    candidate_skills = [s.strip().lower() for s in skills.split(",") if s.strip()] if skills else []

    recommendations = []

    for c in COMPANY_DATABASE:
        cat = c["category"]
        min_r = c["min_readiness"]

        # 1. Primary Weight: Readiness Score Fit (~40%)
        readiness_diff = readiness_score - min_r
        if readiness_diff >= 0:
            readiness_fit = min(100.0, 80.0 + (readiness_diff * 0.9))
        else:
            readiness_fit = max(5.0, 75.0 + (readiness_diff * 2.2))

        # 2. Branch Relevance Fit (~25%)
        branch_matches = branch_upper in c["branches"]
        is_non_it = branch_upper in ["CIVIL", "MECHANICAL"]
        is_software_cat = cat in ["Product Giants / MAANG", "Product Startups"]
        
        if branch_matches:
            branch_fit = 100.0
        elif is_non_it and is_software_cat:
            # Check if student has software skills
            has_coding_skills = any(k in candidate_skills for k in ["python", "java", "c++", "react", "sql", "git"])
            branch_fit = 65.0 if has_coding_skills else 25.0
        else:
            branch_fit = 50.0

        # 3. College Tier Alignment (~15%)
        if cat == "Product Giants / MAANG":
            if tier_upper == "Tier 1":
                tier_fit = 100.0
            elif readiness_score >= 78.0:
                tier_fit = 90.0
            elif tier_upper == "Tier 2":
                tier_fit = 70.0
            else:
                tier_fit = 45.0
        elif cat in ["Tier-2 Tech", "Product Startups"]:
            tier_fit = 100.0 if tier_upper in ["Tier 1", "Tier 2"] else 80.0
        else:
            tier_fit = 100.0

        # 4. Threshold Alignment (~10%)
        apt_pass = aptitude_score >= c.get("min_aptitude", 50)
        comm_pass = comm_score >= c.get("min_comm", 50)
        threshold_fit = 100.0 if (apt_pass and comm_pass) else (65.0 if (apt_pass or comm_pass) else 40.0)

        # 5. ATS Resume Fit (~10%)
        ats_fit = min(100.0, max(30.0, ats_score))

        # Composite Weighted Match Calculation
        composite_match = (
            (0.40 * readiness_fit) +
            (0.25 * branch_fit) +
            (0.15 * tier_fit) +
            (0.10 * threshold_fit) +
            (0.10 * ats_fit)
        )

        # Determine Stretch Goal status:
        # A company is a Stretch Goal if readiness is >15 pts below requirement OR branch mismatch for high-tier software
        is_stretch = (readiness_score < (min_r - 12.0)) or (is_non_it and is_software_cat and not branch_matches and readiness_score < 75.0)

        if is_stretch:
            # Cap composite match realistically for stretch goals
            composite_match = min(48.0, composite_match)

        composite_match = round(min(98.5, max(12.0, composite_match)), 1)

        # Matched Skills calculation
        company_target_skills = c.get("target_skills", [])
        matched_list = []
        if candidate_skills:
            for s in company_target_skills:
                if any(cs in s.lower() or s.lower() in cs for cs in candidate_skills):
                    matched_list.append(s)

        if not matched_list:
            matched_list = company_target_skills[:2]

        recommendations.append(CompanyRecommendation(
            name=c["name"],
            expected_package_lpa=c["expected_package_lpa"],
            match_percentage=composite_match,
            readiness_fit_pct=round(readiness_fit, 1),
            ats_fit_pct=round(ats_fit, 1),
            matched_skills=matched_list,
            branch_suitability=c["branches"],
            roles=c["roles"],
            category=cat,
            is_stretch_goal=is_stretch
        ))

    # Sort recommendations by match percentage descending
    recommendations.sort(key=lambda x: x.match_percentage, reverse=True)
    return recommendations
