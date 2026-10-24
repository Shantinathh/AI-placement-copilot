from typing import Dict, Any

def calculate_derived_scores(profile_data: Dict[str, Any]) -> Dict[str, float]:
    """
    Intelligently calculate Aptitude Score, Leadership Score, and Extracurricular Score
    from objective academic, technical, and extracurricular student profile inputs.
    """
    cgpa = float(profile_data.get("cgpa", 7.5))
    backlogs = int(profile_data.get("backlogs", 0))
    study_hours = float(profile_data.get("study_hours_per_day", 3.5))
    certs = int(profile_data.get("certifications_count", 2))
    tier = str(profile_data.get("college_tier", "Tier 2"))
    hackathons = int(profile_data.get("hackathons_participated", 1))
    projects = int(profile_data.get("projects_count", 3))
    volunteer = str(profile_data.get("volunteer_experience", "No")).strip().lower() == "yes"
    internships = int(profile_data.get("internships_count", 1))
    comm_score = float(profile_data.get("communication_skill_score", 70.0))
    linkedin = int(profile_data.get("linkedin_connections", 200))
    repos = int(profile_data.get("github_repos", 4))

    # 1. Aptitude Score Calculation (Bounded 20.0 - 100.0)
    # Driven by academic record (CGPA), study rigor, analytical certifications, tier benchmark, and backlog penalty
    apt_base = 35.0
    cgpa_pts = ((max(4.5, min(10.0, cgpa)) - 4.5) / 5.5) * 40.0
    study_pts = min(study_hours * 1.5, 10.0)
    cert_pts = min(certs * 2.0, 10.0)
    tier_bonus = 5.0 if tier == "Tier 1" else (2.5 if tier == "Tier 2" else 0.0)
    backlog_penalty = backlogs * 4.0

    aptitude = round(apt_base + cgpa_pts + study_pts + cert_pts + tier_bonus - backlog_penalty, 1)
    aptitude = max(20.0, min(100.0, aptitude))

    # 2. Leadership Score Calculation (Bounded 0.0 - 100.0)
    # Driven by hackathon leadership, project ownership, volunteerism, internship ownership, communication, and networking
    lead_base = 25.0
    hack_pts = min(hackathons * 5.0, 20.0)
    proj_pts = min(projects * 2.5, 15.0)
    vol_pts = 15.0 if volunteer else 0.0
    intern_pts = min(internships * 3.0, 12.0)
    comm_pts = (comm_score / 100.0) * 15.0
    net_pts = min(linkedin / 50.0, 8.0)

    leadership = round(lead_base + hack_pts + proj_pts + vol_pts + intern_pts + comm_pts + net_pts, 1)
    leadership = max(0.0, min(100.0, leadership))

    # 3. Extracurricular Score Calculation (Bounded 0.0 - 100.0)
    # Driven by community volunteerism, competitive hackathons, open-source repositories, self-certifications, and networking
    extra_base = 20.0
    vol_extra_pts = 20.0 if volunteer else 0.0
    hack_extra_pts = min(hackathons * 6.0, 24.0)
    repo_pts = min(repos * 2.5, 20.0)
    cert_extra_pts = min(certs * 3.0, 15.0)
    net_extra_pts = min(linkedin / 80.0, 10.0)

    extracurricular = round(extra_base + vol_extra_pts + hack_extra_pts + repo_pts + cert_extra_pts + net_extra_pts, 1)
    extracurricular = max(0.0, min(100.0, extracurricular))

    return {
        "aptitude_score": aptitude,
        "leadership_score": leadership,
        "extracurricular_score": extracurricular
    }


def get_score_breakdown(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Returns calculated scores along with factor details, qualitative assessment levels,
    and explanatory insights for UI display.
    """
    scores = calculate_derived_scores(profile_data)
    apt = scores["aptitude_score"]
    lead = scores["leadership_score"]
    extra = scores["extracurricular_score"]

    # Assessment levels
    if apt >= 85:
        apt_level = "Exceptional Analytical"
    elif apt >= 75:
        apt_level = "High Analytical"
    elif apt >= 60:
        apt_level = "Proficient"
    else:
        apt_level = "Needs Practice"

    if lead >= 80:
        lead_level = "Team Lead Ready"
    elif lead >= 65:
        lead_level = "High Initiative"
    elif lead >= 50:
        lead_level = "Active Contributor"
    else:
        lead_level = "Emerging Leader"

    if extra >= 80:
        extra_level = "Well-Rounded Contributor"
    elif extra >= 65:
        extra_level = "Highly Involved"
    elif extra >= 50:
        extra_level = "Moderate Involvement"
    else:
        extra_level = "Developing Portfolio"

    cgpa = profile_data.get("cgpa", 7.5)
    certs = profile_data.get("certifications_count", 0)
    study_hrs = profile_data.get("study_hours_per_day", 0)
    tier = profile_data.get("college_tier", "Tier 2")
    backlogs = profile_data.get("backlogs", 0)

    hackathons = profile_data.get("hackathons_participated", 0)
    projects = profile_data.get("projects_count", 0)
    volunteer = profile_data.get("volunteer_experience", "No")
    internships = profile_data.get("internships_count", 0)
    comm = profile_data.get("communication_skill_score", 70.0)
    repos = profile_data.get("github_repos", 0)
    linkedin = profile_data.get("linkedin_connections", 0)

    return {
        "aptitude_score": apt,
        "leadership_score": lead,
        "extracurricular_score": extra,
        "breakdown": {
            "aptitude": {
                "score": apt,
                "level": apt_level,
                "factors": [
                    f"CGPA: {cgpa} / 10",
                    f"{certs} Technical Certifications",
                    f"{study_hrs}h Daily Study",
                    f"{tier} Academic Rigor",
                    *( [f"{backlogs} Backlog Penalty"] if backlogs > 0 else [] )
                ],
                "summary": "Calculated from your academic consistency, daily study discipline, technical certifications, and institutional benchmark."
            },
            "leadership": {
                "score": lead,
                "level": lead_level,
                "factors": [
                    f"{hackathons} Team Hackathons",
                    f"{projects} Technical Projects",
                    f"Volunteer Experience: {volunteer}",
                    f"{internships} Internships Completed",
                    f"Communication Skill: {comm}/100"
                ],
                "summary": "Calculated from collaborative hackathons, project ownership, community volunteer initiatives, and verified soft skills."
            },
            "extracurricular": {
                "score": extra,
                "level": extra_level,
                "factors": [
                    f"Volunteer Service: {volunteer}",
                    f"{hackathons} Hackathon Competitions",
                    f"{repos} GitHub Public Repos",
                    f"{certs} Self-Driven Certifications",
                    f"{linkedin} LinkedIn Network Reach"
                ],
                "summary": "Calculated from active volunteerism, open-source portfolio repositories, competitive hackathons, and professional networking."
            }
        }
    }
