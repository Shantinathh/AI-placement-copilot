import re
import io
from typing import Dict, Any, List

CORE_SKILLS_TAXONOMY = {
    "AI & ML": [
        "python", "machine learning", "deep learning", "pytorch", "tensorflow",
        "scikit-learn", "pandas", "numpy", "nlp", "natural language processing",
        "computer vision", "opencv", "mlops", "data science", "keras"
    ],
    "Software Engineering": [
        "java", "c++", "c", "javascript", "typescript", "react", "node.js", "express",
        "sql", "mongodb", "postgresql", "aws", "docker", "kubernetes", "git",
        "data structures", "algorithms", "system design", "html", "css", "linux",
        "fastapi", "spring boot", "rest api", "microservices"
    ],
    "Core Engineering": [
        "circuits", "vlsi", "matlab", "autocad", "cad", "thermodynamics", "signal processing",
        "embedded systems", "embedded c", "microcontrollers", "power systems", "mechanics"
    ],
    "Soft Skills": [
        "communication", "leadership", "problem solving", "teamwork", "agile",
        "time management", "critical thinking", "collaboration"
    ]
}

RECOMMENDED_PLACEMENET_SKILLS = [
    "Data Structures", "Algorithms", "System Design", "Python", "SQL",
    "Git", "Docker", "REST API", "Communication", "Machine Learning"
]

# Domain-specific recommended skill sets for targeted gap analysis
DOMAIN_SKILLS: dict = {
    "Software Engineering": [
        "Data Structures", "Algorithms", "System Design", "Java", "C++",
        "Python", "SQL", "Git", "Docker", "REST API", "Microservices",
        "Linux", "Agile", "Communication"
    ],
    "AI & ML": [
        "Python", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow",
        "Scikit-Learn", "Pandas", "NumPy", "NLP", "Computer Vision",
        "SQL", "Git", "MLOps", "Data Science", "Statistics"
    ],
    "Data Analytics": [
        "Python", "SQL", "Pandas", "NumPy", "Tableau", "Power BI",
        "Excel", "Statistics", "Data Visualization", "Machine Learning",
        "Git", "Communication", "Problem Solving"
    ],
    "Core Engineering": [
        "MATLAB", "AutoCAD", "VLSI", "Embedded Systems", "Embedded C",
        "Microcontrollers", "Signal Processing", "Circuits", "CAD",
        "Thermodynamics", "Power Systems", "Communication"
    ],
    "Cybersecurity": [
        "Linux", "Networking", "Python", "Cryptography", "Penetration Testing",
        "SIEM", "Firewalls", "Ethical Hacking", "SQL", "Git",
        "Risk Assessment", "Communication"
    ],
    "Product Management": [
        "Communication", "Leadership", "Agile", "Problem Solving", "Teamwork",
        "Critical Thinking", "Data Analysis", "SQL", "Product Roadmap",
        "User Research", "Stakeholder Management", "Presentation"
    ],
}

def extract_text_from_pdf(content: bytes) -> str:
    try:
        from pdfminer.high_level import extract_text
        text = extract_text(io.BytesIO(content))
        if text and len(text.strip()) > 10:
            return text
    except Exception as e:
        print(f"pdfminer exception: {e}")
    
    # Fallback printable ASCII text extraction for malformed PDF streams
    try:
        text = re.sub(r'[^\x20-\x7E\n\r\t]', ' ', content.decode('latin-1', errors='ignore'))
        return text
    except Exception:
        return ""

def extract_text_from_docx(content: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(content))
        fullText = [para.text for para in doc.paragraphs]
        return "\n".join(fullText)
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""

def parse_resume_content(filename: str, content: bytes, domain: str = "") -> Dict[str, Any]:
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext == "pdf":
        raw_text = extract_text_from_pdf(content)
    elif ext in ["docx", "doc"]:
        raw_text = extract_text_from_docx(content)
    else:
        # Fallback text decoding for .txt and plain text
        try:
            raw_text = content.decode('utf-8', errors='ignore')
        except Exception:
            raw_text = ""

    text_lower = raw_text.lower()
    
    # 1. Skill Extraction
    extracted_set = set()
    all_taxonomy = [skill for category in CORE_SKILLS_TAXONOMY.values() for skill in category]
    
    for skill in all_taxonomy:
        if len(skill) <= 3:
            pattern = r'\b' + re.escape(skill) + r'\b'
        else:
            pattern = re.escape(skill)
        if re.search(pattern, text_lower):
            extracted_set.add(skill.title() if len(skill) > 3 else skill.upper())
            
    extracted_skills = sorted(list(extracted_set))
    
    # Identify missing skills – use domain-specific list when a domain is provided
    extracted_lowers = [x.lower() for x in extracted_skills]
    recommended = DOMAIN_SKILLS.get(domain, RECOMMENDED_PLACEMENET_SKILLS)
    missing_skills = [s for s in recommended if s.lower() not in extracted_lowers]
    
    # 2. Quality Checks
    has_contact = bool(re.search(r'[\w\.-]+@[\w\.-]+', raw_text)) or bool(re.search(r'\+?\d[\d -]{8,}\d', raw_text))
    has_github_linkedin = "github" in text_lower or "linkedin" in text_lower
    has_experience_section = any(header in text_lower for header in ["experience", "internship", "projects", "work history", "built", "developed"])
    has_education_section = any(header in text_lower for header in ["education", "degree", "university", "college", "cgpa", "gpa", "b.tech", "btech"])
    has_action_verbs = any(verb in text_lower for verb in ["built", "developed", "created", "led", "managed", "designed", "implemented", "optimized", "increased", "reduced", "trained"])
    word_count = len(raw_text.split())
    has_good_length = 50 <= word_count <= 2500
    
    quality_checks = {
        "Contact Info Present": has_contact,
        "LinkedIn / GitHub Links": has_github_linkedin,
        "Experience / Projects Section": has_experience_section,
        "Education Section": has_education_section,
        "Strong Action Verbs": has_action_verbs,
        "Optimal Page Length": has_good_length
    }
    
    # 3. ATS Score Calculation
    skill_score = min(45, max(15, len(extracted_skills) * 5)) # Up to 45 pts
    checks_score = sum([10 if v else 0 for v in quality_checks.values()]) # Up to 60 pts
    
    ats_score = round(min(100.0, max(20.0, skill_score + checks_score * 0.7)), 1)
    
    return {
        "ats_score": ats_score,
        "extracted_skills": extracted_skills if extracted_skills else ["Python", "Problem Solving"],
        "missing_skills": missing_skills,
        "quality_checks": quality_checks,
        "domain": domain or "General"
    }
