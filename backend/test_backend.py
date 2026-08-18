import requests

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("Testing Backend API...")
    
    # 1. Root
    res = requests.get(f"{BASE_URL}/")
    print(f"[GET /] Status: {res.status_code}, Response: {res.json()}")
    assert res.status_code == 200

    # 2. Auth Signup
    signup_payload = {
        "name": "Alex Student",
        "email": "alex.student@example.com",
        "password": "Password123!"
    }
    res = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
    print(f"[POST /auth/signup] Status: {res.status_code}")
    
    # 3. Auth Login
    login_payload = {
        "email": "alex.student@example.com",
        "password": "Password123!"
    }
    res = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    print(f"[POST /auth/login] Status: {res.status_code}")
    token = res.json().get("access_token", "") if res.status_code == 200 else ""
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 4. Predict Readiness
    profile_payload = {
        "age": 21,
        "gender": "Male",
        "cgpa": 8.4,
        "branch": "CSE",
        "college_tier": "Tier 2",
        "internships_count": 2,
        "projects_count": 4,
        "certifications_count": 3,
        "aptitude_score": 82.5,
        "communication_skill_score": 88.0,
        "hackathons_participated": 2,
        "github_repos": 7,
        "linkedin_connections": 450,
        "backlogs": 0,
        "extracurricular_score": 75.0,
        "leadership_score": 80.0,
        "volunteer_experience": "Yes",
        "sleep_hours": 7.0,
        "study_hours_per_day": 5.5
    }
    res = requests.post(f"{BASE_URL}/predict/readiness", json=profile_payload, headers=headers)
    print(f"[POST /predict/readiness] Status: {res.status_code}, Score: {res.json().get('readiness_score') if res.status_code == 200 else res.text}")
    assert res.status_code == 200

    # 5. Skill Gap Analysis
    res = requests.post(f"{BASE_URL}/skills/gap-analysis", json=profile_payload)
    print(f"[POST /skills/gap-analysis] Status: {res.status_code}, Gaps Count: {len(res.json().get('gaps', []))}")
    assert res.status_code == 200

    # 6. Company Recommendations
    res = requests.get(f"{BASE_URL}/companies/recommend?readiness_score=85.0&branch=CSE&college_tier=Tier2")
    print(f"[GET /companies/recommend] Status: {res.status_code}, Companies Count: {len(res.json())}")
    assert res.status_code == 200

    # 7. GenAI Roadmap
    roadmap_payload = {
        "readiness_score": 82.5,
        "skill_gaps": ["Projects & GitHub Portfolio"],
        "branch": "CSE"
    }
    res = requests.post(f"{BASE_URL}/roadmap/generate", json=roadmap_payload, headers=headers)
    print(f"[POST /roadmap/generate] Status: {res.status_code}, Weeks Count: {len(res.json().get('weeks', []))}")
    assert res.status_code == 200

    # 8. Dashboard Summary
    res = requests.get(f"{BASE_URL}/dashboard/summary", headers=headers)
    print(f"[GET /dashboard/summary] Status: {res.status_code}, User: {res.json().get('user_name')}")
    assert res.status_code == 200

    print("\nALL BACKEND API ENDPOINTS TESTED AND PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
