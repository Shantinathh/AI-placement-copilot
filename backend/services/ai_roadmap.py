import os
import json
import requests
from typing import Dict, Any, List, Optional
from backend.config import settings

# Candidate Hugging Face models supported on HF Router
HF_MODELS = [
    "meta-llama/Meta-Llama-3-8B-Instruct",
    "Qwen/Qwen2.5-7B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "HuggingFaceH4/zephyr-7b-beta"
]

SKILL_MODULES: Dict[str, Dict[int, str]] = {
    "communication": {
        1: "Speech & Articulation Audit: Record a 2-minute video pitch explaining a technical project; refine pacing and eliminate filler words.",
        2: "Group Discussion (GD) Practice: Participate in 2 live mock GD sessions on tech & economy topics; practice assertive point-building.",
        3: "Behavioral STAR Interview Drills: Structure 15 behavioral answers using the STAR method (Situation, Task, Action, Result).",
        4: "Executive Mock HR Round: Conduct a 45-minute mock HR & managerial interview with a mentor to refine presence and confidence."
    },
    "aptitude": {
        1: "Quantitative Speed Drills: Solve 35 problems on Percentages, Profit & Loss, and Time & Work under timed conditions on IndiaBIX.",
        2: "Logical Reasoning Puzzles: Solve 25 puzzles on Seating Arrangement, Syllogisms, and Blood Relations under 2 minutes per question.",
        3: "Data Interpretation & OA Drills: Solve 20 complex chart/table sets and learn mental calculation estimation shortcuts.",
        4: "Company OA Simulation: Complete two 60-minute timed placement online assessment tests (aim for 85%+ score)."
    },
    "docker": {
        1: "Docker Fundamentals: Write a multi-stage Dockerfile for your primary backend project, configuring minimal base images.",
        2: "Docker Compose Orchestration: Create docker-compose.yml to run your API, database (PostgreSQL/MySQL), and environment variables.",
        3: "Container Best Practices: Optimize image sizes, configure non-root user permissions, and test local container health checks.",
        4: "Docker Registry & Showcase: Push images to Docker Hub and document step-by-step container execution in your project README."
    },
    "system design": {
        1: "High-Level Architecture (HLD): Study client-server scaling, DNS resolution, CDN caching, Load Balancers, and Reverse Proxies.",
        2: "Database Scaling & Caching: Master SQL Indexing (B-Trees), Read Replicas, Sharding, and in-memory caching with Redis.",
        3: "Architecture Blueprints: Design scalable architectures for real systems (e.g. URL Shortener, Rate Limiter, or Notification Engine).",
        4: "System Design Mock Walkthrough: Practice whiteboarding trade-offs (Latency vs Throughput, CAP Theorem, ACID vs BASE) in 45-min rounds."
    },
    "redis": {
        1: "Redis In-Memory Foundations: Master Strings, Hashes, Lists, Sets, and Key Expiration (TTL) using Redis CLI.",
        2: "API Caching Implementation: Integrate Redis caching into your REST API endpoints to dramatically cut database read latency.",
        3: "Rate Limiting & Sessions: Implement sliding-window rate limiting and distributed session storage using Redis.",
        4: "Cache Optimization: Design cache invalidation strategies (Cache-Aside, Write-Through) and configure LRU eviction policies."
    },
    "kubernetes": {
        1: "K8s Architecture Core: Learn Control Plane, Kubelet, Pods, ReplicaSets, and Deployments using Minikube or k3s.",
        2: "Service Discovery & Networking: Configure ClusterIP, NodePort, and Ingress controllers with YAML manifests.",
        3: "ConfigMaps & Secrets: Manage external environment configurations and secret credentials securely in Kubernetes manifests.",
        4: "Local Cluster Deployment: Deploy a multi-service containerized application and verify horizontal pod autoscaling (HPA)."
    },
    "sql": {
        1: "Advanced SQL Queries: Solve 20 LeetCode/HackerRank SQL problems focusing on Window Functions (ROW_NUMBER, RANK) and CTEs.",
        2: "Database Normalization & ACID: Review 1NF to 3NF, Foreign Keys, Transaction Isolation Levels, and ACID guarantees.",
        3: "Query Performance Tuning: Analyze execution plans using EXPLAIN ANALYZE, B-Tree vs Hash indexing, and query restructuring.",
        4: "Complex Aggregations & Joins: Build reporting views combining Inner/Left/Full Outer Joins with GROUP BY and HAVING clauses."
    },
    "project": {
        1: "Project Architecture & Scope: Define system architecture, clean folder structure, database schema, and Git branching workflow.",
        2: "Core Feature & API Build: Build secure RESTful API endpoints with JWT authentication, request validation, and database ORM.",
        3: "Testing & Documentation: Write automated unit tests (pytest/jest) and create an interactive README with screenshots and API docs.",
        4: "Live Production Deployment: Deploy the full-stack application on Render/Vercel/AWS and verify live public demo availability."
    },
    "github": {
        1: "GitHub Profile Overhaul: Create a compelling profile README.md featuring pinned repositories, tech stack badges, and contribution stats.",
        2: "Repository Polish: Add detailed README files with architecture diagrams, installation instructions, and API specifications to top 3 repos.",
        3: "CI/CD Automation: Set up a GitHub Actions workflow to run automated linting, test suites, and Docker builds on pull requests.",
        4: "Open-Source Contributions: Submit 2 pull requests to open-source repositories or document reproducible bug reports."
    },
    "internship": {
        1: "Target Company Mapping: Identify 15 tech startups and product companies actively recruiting interns on Wellfound and LinkedIn.",
        2: "Tailored Outreach: Craft personalized outreach messages and reach out to 5 engineering leads highlighting project live demos.",
        3: "Assignment Preparation: Solve take-home coding challenges and build clean, well-tested code samples for hiring managers.",
        4: "Follow-Up & Interview Ready: Conduct follow-ups on active applications and prepare technical discussion points for your projects."
    },
    "cgpa": {
        1: "Academic Syllabus Audit: Review syllabus and allocate 90 minutes daily to core high-weightage subjects.",
        2: "Previous Year Question Papers: Solve previous 3 years' semester question papers under exam-simulated conditions.",
        3: "Professor & Peer Clarification: Clarify challenging theoretical concepts and submit all internal lab assignments on time.",
        4: "Semester Score Maximization: Review summary revision notes and consolidate subject formulas for final semester examinations."
    },
    "backlog": {
        1: "Backlog Roadmap Strategy: List all active backlog subjects and create a dedicated 2-hour daily remediation study schedule.",
        2: "Core Topic Mastery: Focus intensely on passing-criteria units and previous years' repeated questions for backlog papers.",
        3: "Mock Exam Papers: Solve 2 full-length previous backlog exams to ensure speed, accuracy, and clear conceptual mastery.",
        4: "Backlog Clearance Prep: Finalize revision and ensure 0 active backlogs before campus placement drives begin."
    },
    "leadership": {
        1: "Leadership Reflection: Identify 3 technical or organizational initiatives you led; summarize key impact metrics.",
        2: "Technical Mentorship: Help peers in coding problem-solving or lead a mini-hackathon project team.",
        3: "Conflict Resolution STAR Stories: Prepare 3 structured STAR responses about handling deadlines, technical disagreements, and team blockers.",
        4: "Managerial Presence: Practice communicating trade-offs and decision-making rationale in mock leadership interviews."
    },
    "typescript": {
        1: "TypeScript Foundations: Master static typing, interfaces, type aliases, union types, and generics in TypeScript.",
        2: "Refactoring & Type Safety: Migrate a JavaScript module or build a typed REST API / React UI with strict compiler checks.",
        3: "Advanced Types & Utility Types: Master Partial, Record, Pick, Omit, and type guards for complex state management.",
        4: "Full-Stack TS Deployment: Build and deploy a full-stack TypeScript application with end-to-end type safety."
    },
    "react": {
        1: "Modern React & Hooks: Master useState, useEffect, useMemo, useCallback, and custom reusable hook patterns.",
        2: "State Management & Routing: Implement global state with Context API / Zustand and handle dynamic nested routing.",
        3: "Performance & UI Polish: Optimize component renders, implement skeleton loading states, and ensure mobile responsiveness.",
        4: "Production React Build: Deploy the frontend on Vercel/Netlify with custom domain routing and optimized bundle size."
    },
    "aws": {
        1: "AWS Core Infrastructure: Learn IAM permissions, EC2 virtual instances, security groups, and SSH remote management.",
        2: "Storage & Serverless: Deploy static frontend assets to S3 and configure serverless functions with AWS Lambda / API Gateway.",
        3: "Database & Networking: Provision RDS PostgreSQL/MySQL instances in private subnets and configure VPC security rules.",
        4: "Cloud Architecture Showcase: Document your AWS cloud architecture diagram and deployment cost model in your project README."
    }
}

def match_skill_module(gap_text: str) -> Optional[Dict[int, str]]:
    clean = gap_text.lower().strip()
    for key, module in SKILL_MODULES.items():
        if key in clean or clean in key:
            return module
    return None

def build_custom_fallback_task(gap_text: str, week_num: int) -> str:
    clean = gap_text.replace("Missing Skill:", "").replace("Missing:", "").strip()
    if week_num == 1:
        return f"{clean} Core Foundations: Study key concepts, architecture, and syntax of {clean}; build a simple hello-world experiment."
    elif week_num == 2:
        return f"{clean} Practical Implementation: Build a functioning feature utilizing {clean} and integrate it with your database or API."
    elif week_num == 3:
        return f"{clean} Optimization & Testing: Write unit tests and test edge cases for your {clean} integration."
    else:
        return f"{clean} Resume & Interview Showcase: Document {clean} implementation in your GitHub project and prepare 3 interview talking points."

def generate_adaptive_skill_gap_roadmap(readiness_score: float, skill_gaps: List[str], branch: str) -> Dict[str, Any]:
    branch = (branch or "CSE").upper().strip()
    score = float(readiness_score) if readiness_score is not None else 70.0
    
    # 1. Normalize Skill Gaps
    normalized_gaps = []
    seen = set()
    for g in (skill_gaps or []):
        c = g.replace("Missing Skill:", "").replace("Missing:", "").strip()
        if c and c.lower() not in seen:
            seen.add(c.lower())
            normalized_gaps.append(c)

    # 2. Week Generation
    weeks_data = []

    # If user has specific skill gaps, structure EVERY week directly around those gaps!
    if normalized_gaps:
        # Collect matched modules for each gap
        gap_modules = []
        for g in normalized_gaps:
            mod = match_skill_module(g)
            gap_modules.append((g, mod))

        for week_num in range(1, 5):
            tasks = []
            
            # Primary Focus for this week from the gaps
            for g_name, mod in gap_modules:
                if mod and week_num in mod:
                    tasks.append(mod[week_num])
                else:
                    tasks.append(build_custom_fallback_task(g_name, week_num))

            # Add branch / score foundational task if space
            if len(tasks) < 3:
                if week_num == 1:
                    tasks.append(f"Solve 10 LeetCode problem patterns (Two-Pointers & HashMaps) applicable to {branch} campus rounds.")
                elif week_num == 2:
                    tasks.append(f"Review core {branch} technical questions and practice data structures (Trees & Graphs / Microcontrollers).")
                elif week_num == 3:
                    tasks.append("Complete a full-length 60-minute timed Aptitude & Logical Reasoning speed test (aim for 85%+).")
                elif week_num == 4:
                    tasks.append("Conduct a 45-minute peer mock technical coding interview and tailor resume keywords for target companies.")

            # Dynamic Week Title reflecting the skills addressed
            top_gap_names = [g for g, _ in gap_modules[:2]]
            gaps_title_str = " & ".join(top_gap_names) if top_gap_names else "Placement Core"
            
            if week_num == 1:
                title = f"Week 1: Core Foundations & {gaps_title_str}"
            elif week_num == 2:
                title = f"Week 2: Applied Implementation & {gaps_title_str}"
            elif week_num == 3:
                title = f"Week 3: Advanced Architecture, Aptitude & {gaps_title_str}"
            else:
                title = f"Week 4: Mock Interviews, Assessment & {gaps_title_str} Showcase"

            weeks_data.append({
                "title": title,
                "tasks": tasks[:4]
            })

    else:
        # Default track when no gaps detected
        weeks_data = [
            {
                "title": f"Week 1: {branch} Core Foundations & Problem Solving",
                "tasks": [
                    "Master Arrays, Strings, and HashMaps on LeetCode (Solve 15 problems).",
                    "Review Object-Oriented Programming (OOP) principles: Encapsulation, Inheritance, and Polymorphism.",
                    "Review Big-O Time & Space Complexity analysis for common algorithms."
                ]
            },
            {
                "title": f"Week 2: Advanced Data Structures & {branch} Projects",
                "tasks": [
                    "Implement Binary Trees, Graphs (BFS/DFS), and Heap Priority Queues.",
                    "Build and test asynchronous REST API endpoints with database ORM integration.",
                    "Review core database indexing and ACID transaction properties."
                ]
            },
            {
                "title": "Week 3: High-Level System Design & Aptitude Mastery",
                "tasks": [
                    "Complete 2 full-length timed Quantitative Aptitude & Logical Reasoning speed tests.",
                    "Study High-Level System Design: Load Balancers, Redis Caching, and CDN architecture.",
                    "Audit and polish project GitHub README files with architecture diagrams."
                ]
            },
            {
                "title": "Week 4: Mock Technical Coding & HR Behavioral Rounds",
                "tasks": [
                    "Conduct 2 peer mock technical coding interviews focusing on problem breakdown.",
                    "Practice 15 behavioral HR interview questions using the STAR framework.",
                    "Tailor resume ATS keywords to match target company job descriptions."
                ]
            }
        ]

    return {"weeks": weeks_data}

def build_roadmap_prompt(readiness_score: float, skill_gaps: List[str], branch: str) -> str:
    gaps_str = "\n".join([f"- {g}" for g in skill_gaps]) if skill_gaps else "- General placement preparation"
    
    return f"""You are an elite campus placement mentor.
Create a structured, 100% relevant 4-week preparation roadmap for an engineering student.

STUDENT INFO:
- Branch: {branch}
- Readiness Score: {readiness_score}/100
- CRITICAL SKILL GAPS TO FIX (The entire roadmap MUST resolve these exact skills):
{gaps_str}

CRITICAL RULES:
1. Every single week MUST have milestone tasks that directly resolve the student's listed skill gaps (e.g. if Communication is lacking, schedule video self-reviews & mock group discussions; if Docker is lacking, schedule Dockerfile & Compose builds; if Aptitude is lacking, schedule quantitative speed drills).
2. Do NOT fill the roadmap with unrelated generic topics. Make every task directly target what the student is missing.
3. Structure exactly 4 weeks, with 3-4 actionable tasks per week.

Output ONLY valid JSON matching this schema:
{{
  "weeks": [
    {{
      "title": "Week 1: <Title directly mentioning target gaps>",
      "tasks": ["<Task 1 targeting gap>", "<Task 2 targeting gap>", "<Task 3 targeting gap>"]
    }},
    {{
      "title": "Week 2: <Title directly mentioning target gaps>",
      "tasks": ["<Task 1 targeting gap>", "<Task 2 targeting gap>", "<Task 3 targeting gap>"]
    }},
    {{
      "title": "Week 3: <Title directly mentioning target gaps>",
      "tasks": ["<Task 1 targeting gap>", "<Task 2 targeting gap>", "<Task 3 targeting gap>"]
    }},
    {{
      "title": "Week 4: <Title directly mentioning target gaps>",
      "tasks": ["<Task 1 targeting gap>", "<Task 2 targeting gap>", "<Task 3 targeting gap>"]
    }}
  ]
}}"""

def call_huggingface_llm(readiness_score: float, skill_gaps: List[str], branch: str, token: str) -> Optional[Dict[str, Any]]:
    prompt = build_roadmap_prompt(readiness_score, skill_gaps, branch)
    chat_url = "https://router.huggingface.co/hf-inference/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    for model in HF_MODELS:
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a placement preparation coach. Return ONLY valid, parseable JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 900,
            "temperature": 0.3,
            "response_format": {"type": "json_object"}
        }

        try:
            resp = requests.post(chat_url, headers=headers, json=payload, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                if "{" in content:
                    start = content.find("{")
                    end = content.rfind("}") + 1
                    parsed = json.loads(content[start:end])
                    if "weeks" in parsed and len(parsed["weeks"]) == 4:
                        return parsed
        except Exception:
            pass

    return None

def generate_ai_roadmap(readiness_score: float, skill_gaps: List[str], branch: str) -> Dict[str, Any]:
    token = settings.HUGGINGFACE_API_TOKEN or os.getenv("HUGGINGFACE_API_TOKEN", "")
    
    # 1. Try Hugging Face LLM if token is available
    if token:
        ai_result = call_huggingface_llm(readiness_score, skill_gaps, branch, token)
        if ai_result:
            return ai_result

    # 2. Use our precision skill-gap-driven roadmap builder
    return generate_adaptive_skill_gap_roadmap(readiness_score, skill_gaps, branch)
