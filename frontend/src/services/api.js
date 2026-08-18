const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("copilot_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const api = {
  // 1. Auth
  signup: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Signup failed");
    }
    return res.json();
  },

  login: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }
    return res.json();
  },

  // 2. Predict Readiness
  predictReadiness: async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/predict/readiness`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(profileData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ? (typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail)) : "Prediction failed");
    }
    return res.json();
  },

  // 3. Resume Analysis
  analyzeResume: async (file, domain = "") => {
    const formData = new FormData();
    formData.append("file", file);
    if (domain) formData.append("domain", domain);

    const res = await fetch(`${API_BASE_URL}/resume/analyze`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Resume analysis failed");
    }
    return res.json();
  },

  // 4. Skill Gap Analysis (Readiness soft skills + Resume technical gaps)
  getSkillGaps: async (params) => {
    let payload = params;
    if (params && !params.profile && !params.missing_skills && params.cgpa !== undefined) {
      payload = { profile: params, missing_skills: [] };
    }
    const res = await fetch(`${API_BASE_URL}/skills/gap-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Skill gap analysis failed");
    }
    return res.json();
  },

  // 5. Dual Company Recommendations (Readiness + ATS Score + Skills)
  getCompanyRecommendations: async (score, branch, tier, atsScore, skills) => {
    const params = new URLSearchParams({
      readiness_score: score || 75.0,
      ats_score: atsScore || 80.0,
      skills: Array.isArray(skills) ? skills.join(",") : (skills || ""),
      branch: branch || "CSE",
      college_tier: tier || "Tier 2"
    });
    const res = await fetch(`${API_BASE_URL}/companies/recommend?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Company recommendation failed");
    }
    return res.json();
  },

  // 6. GenAI Roadmap
  generateRoadmap: async (score, skillGaps, branch, forceRegenerate = false) => {
    const res = await fetch(`${API_BASE_URL}/roadmap/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        readiness_score: score || 75.0,
        skill_gaps: skillGaps || [],
        branch: branch || "CSE",
        force_regenerate: forceRegenerate
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Roadmap generation failed");
    }
    return res.json();
  },

  // 6b. Fetch persisted task completion state
  getRoadmapProgress: async () => {
    const token = localStorage.getItem("copilot_token");
    if (!token) return { completed_tasks: {} };
    const res = await fetch(`${API_BASE_URL}/roadmap/progress`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) return { completed_tasks: {} };
    return res.json();
  },

  // 7. Save Progress
  saveProgress: async (progressData) => {
    const res = await fetch(`${API_BASE_URL}/roadmap/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(progressData)
    });
    return res.json();
  },

  // 8. Dashboard Summary
  getDashboardSummary: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Dashboard fetch failed");
    }
    return res.json();
  },

  // 9. Download PDF Report
  downloadReportPdf: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/report/pdf`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) {
      throw new Error("Failed to generate PDF report.");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Placement_Readiness_Report.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};
