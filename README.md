# 🎓 AI Placement Copilot

An AI-powered full-stack web application that predicts student placement readiness, analyzes resumes, identifies skill gaps, recommends companies, and generates personalized learning roadmaps — all in one platform.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Project](#running-the-project)
- [API Endpoints](#-api-endpoints)
- [ML Pipeline](#-ml-pipeline)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **Placement Readiness Prediction** | Predicts placement probability (0–100%), status (Placed / Not Placed), and estimated salary (LPA) using trained ML models with SHAP explainability |
| **ATS Resume Analyzer** | Parses PDF/DOCX resumes, calculates an ATS compatibility score, extracts skills, and highlights missing keywords |
| **Skill Gap Analysis** | Compares student profile & resume against industry benchmarks, categorizing gaps by severity (High/Medium/Low) with actionable tips |
| **Company Recommendations** | Recommends top companies based on readiness score, ATS score, skills, branch, and college tier with match percentages |
| **AI Learning Roadmap** | Generates personalized, step-by-step learning tracks for each skill gap using HuggingFace LLM APIs with progress tracking |
| **Dashboard & Reports** | Consolidated dashboard summarizing all insights with downloadable PDF reports |
| **User Authentication** | Secure signup/login with JWT tokens and bcrypt password hashing |

---

## 🛠 Tech Stack

### Frontend
- **React 19** with Vite 8
- **Lucide React** for icons
- Vanilla CSS with modern design (glassmorphism, gradients, micro-animations)

### Backend
- **FastAPI** — high-performance async Python API framework
- **Uvicorn** — ASGI server
- **Pydantic v2** — data validation and serialization

### Machine Learning
- **scikit-learn** — RandomForestClassifier (placement), HistGradientBoostingRegressor (salary)
- **SHAP** — model explainability
- **pandas / numpy** — data processing
- **joblib** — model serialization

### Database & Auth
- **MongoDB Atlas** — cloud database for users, profiles, and progress
- **PyJWT** + **Passlib/bcrypt** — authentication

### Other
- **HuggingFace Inference API** — GenAI roadmap generation
- **pypdf / python-docx** — resume parsing
- **ReportLab** — PDF report generation

---

## 📁 Project Structure

```
AI-placement-copilot/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Environment & settings
│   ├── auth.py                  # JWT authentication helpers
│   ├── db.py                    # MongoDB database operations
│   ├── schemas.py               # Pydantic request/response models
│   ├── ml/
│   │   └── train_models.py      # ML model training pipeline
│   ├── models/
│   │   ├── placement_clf.joblib # Trained placement classifier
│   │   ├── salary_reg.joblib    # Trained salary regressor
│   │   ├── preprocessor.joblib  # Feature preprocessor
│   │   ├── model_metadata.json  # Feature names, threshold, metrics
│   │   └── model_accuracy.json  # Detailed train/test metrics
│   ├── routes/
│   │   ├── auth_routes.py       # Signup / Login
│   │   ├── predict_routes.py    # Readiness prediction + SHAP
│   │   ├── resume_routes.py     # Resume upload & analysis
│   │   ├── skills_routes.py     # Skill gap analysis
│   │   ├── company_routes.py    # Company recommendations
│   │   ├── roadmap_routes.py    # AI roadmap generation
│   │   └── dashboard_routes.py  # Dashboard summary
│   ├── services/
│   │   ├── resume_parser.py     # PDF/DOCX text extraction
│   │   └── ai_roadmap.py        # HuggingFace LLM integration
│   └── test_backend.py          # Backend tests
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              # Root app with routing
│       ├── App.css
│       ├── index.css            # Global design system
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ScoreGauge.jsx
│       │   └── SplashScreen.jsx
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── AuthModal.jsx
│       │   ├── ProfileForm.jsx
│       │   ├── ReadinessResults.jsx
│       │   ├── ResumeUpload.jsx
│       │   ├── ResumeAnalysis.jsx
│       │   ├── SkillGapView.jsx
│       │   ├── CompanyView.jsx
│       │   ├── RoadmapView.jsx
│       │   └── DashboardView.jsx
│       └── services/            # API client helpers
├── data_cleaning.ipynb          # Data exploration & cleaning notebook
├── Student_Dataset.csv          # Training dataset (~100K records)
├── requirementAnalysis.txt      # Detailed requirement specification
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables (not committed)
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)
- **MongoDB Atlas** account (or local MongoDB instance)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Shantinathh/AI-placement-copilot.git
cd AI-placement-copilot
```

**2. Set up the backend**

```bash
# Install Python dependencies
pip install -r requirements.txt
```

**3. Set up the frontend**

```bash
cd frontend
npm install
cd ..
```

**4. Configure environment variables**

Create a `.env` file in the project root:

```env
HUGGINGFACE_API_TOKEN=your_huggingface_api_token
MONGODB_URI=your_mongodb_connection_string
DB_NAME=placement_copilot
JWT_SECRET=your_jwt_secret_key
PORT=8000
```

**5. Train ML models (first time only)**

> The trained `.joblib` model files are not committed to Git due to size. You must train them locally before running the app.

```bash
python -m backend.ml.train_models
```

This will generate `placement_clf.joblib`, `salary_reg.joblib`, and `preprocessor.joblib` inside `backend/models/`.

### Running the Project

You need **two terminals** — one for the backend and one for the frontend.

**Terminal 1 — Start the Backend (FastAPI)**

```bash
# From the project root directory
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at: **http://localhost:8000**
Interactive API docs at: **http://localhost:8000/docs**

**Terminal 2 — Start the Frontend (Vite + React)**

```bash
cd frontend
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check — returns API status |
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT token |
| `GET` | `/predict/profile` | Get saved student profile |
| `POST` | `/predict/readiness` | Predict placement readiness, salary, and SHAP contributions |
| `POST` | `/resume/analyze` | Upload and analyze resume (PDF/DOCX) |
| `POST` | `/skills/gap-analysis` | Compute skill gaps from profile + resume data |
| `GET` | `/companies/recommend` | Get company recommendations with match scores |
| `POST` | `/roadmap/generate` | Generate AI-powered learning roadmap |
| `GET` | `/roadmap/progress` | Get roadmap completion progress |
| `GET` | `/dashboard/summary` | Full dashboard summary for logged-in user |

> 📖 Full interactive documentation available at `/docs` (Swagger UI) when the backend is running.

---

## 🤖 ML Pipeline

### Placement Classifier

| Property | Value |
|----------|-------|
| **Algorithm** | RandomForestClassifier + CalibratedClassifierCV (isotonic, 5-fold CV) |
| **Features** | 15 raw features + 13 engineered features (28 total) |
| **Target** | `placement_status` (Placed / Not Placed) |
| **Test ROC-AUC** | 0.5576 |
| **Test F1 (optimal threshold)** | 0.7054 |

### Salary Regressor

| Property | Value |
|----------|-------|
| **Algorithm** | HistGradientBoostingRegressor |
| **Trained on** | Placed students only |
| **Target** | `salary_package_lpa` |
| **Test RMSE** | 1.234 LPA |
| **Test R²** | 0.3989 |

### Engineered Features

The raw student inputs are augmented with 13 engineered features before model inference:

- `total_activities` — Sum of internships, projects, certifications, hackathons
- `academic_score` — CGPA × 10 + aptitude score
- `cgpa_sq` — CGPA squared
- `cgpa_per_backlog` — CGPA / (backlogs + 1)
- `soft_skill_score` — Communication + leadership + extracurriculars
- `online_presence` — GitHub repos + LinkedIn connections
- `internship_density` — Internships / career years
- `activity_per_year` — Total activities / career years
- `aptitude_x_cgpa`, `comm_x_leadership`, `aptitude_x_comm` — Interaction terms
- `tier_encoded`, `tier_x_cgpa` — College tier ordinal encoding × CGPA

### Explainability

SHAP (SHapley Additive exPlanations) TreeExplainer is used on the inner RandomForest estimator to provide per-feature contribution breakdowns, helping students understand **which factors** most influence their placement prediction.

---

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `HUGGINGFACE_API_TOKEN` | API token for HuggingFace Inference API (roadmap generation) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `DB_NAME` | Database name (default: `placement_copilot`) |
| `JWT_SECRET` | Secret key for JWT token signing |
| `PORT` | Backend server port (default: `8000`) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Shantinathh">Shantinath</a>
</p>