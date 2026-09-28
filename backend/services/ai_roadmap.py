import os
import json
import re
import requests
from typing import Dict, Any, List, Optional
from backend.config import settings

# Candidate Hugging Face models supported on HF Router (ordered by reliability)
HF_MODELS = [
    "meta-llama/Meta-Llama-3-8B-Instruct",
    "Qwen/Qwen2.5-7B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "HuggingFaceH4/zephyr-7b-beta",
]



def build_roadmap_prompt(
    readiness_score: float,
    skill_gaps: List[str],
    branch: str,
) -> str:
    gaps_str = "\n".join([f"- {g}" for g in skill_gaps]) if skill_gaps else "- General placement preparation"

    return f"""You are an expert campus placement coach for engineering students in India.

STUDENT PROFILE:
- Branch: {branch}
- Placement Readiness Score: {readiness_score}/100
- Skill Gaps to Bridge:
{gaps_str}

YOUR TASK:
Generate a personalized skill-gap-focused placement roadmap. For EACH skill gap listed above, create a dedicated learning track. Break down each skill gap into 3 core concepts, and provide 2-3 highly actionable tasks per concept.

STRICT RULES:
1. Create one track per skill gap.
2. Inside each track, define exactly 3 core concepts relevant to mastering that skill.
3. For each concept, define 2-3 actionable, concrete tasks (e.g., "Solve 20 LeetCode SQL problems focusing on Window Functions").
4. Order concepts and tasks from beginner → advanced within each track.
5. Return ONLY valid JSON — no markdown, no explanation, no text outside the JSON.

Output format (strict JSON):
{{
  "tracks": [
    {{
      "skill": "<Exact skill gap name>",
      "concepts": [
        {{
          "name": "<Concept 1 Name>",
          "tasks": [
            "<Actionable task 1>",
            "<Actionable task 2>"
          ]
        }},
        {{
          "name": "<Concept 2 Name>",
          "tasks": [
            "<Actionable task 1>",
            "<Actionable task 2>"
          ]
        }},
        {{
          "name": "<Concept 3 Name>",
          "tasks": [
            "<Actionable task 1>",
            "<Actionable task 2>"
          ]
        }}
      ]
    }}
  ]
}}"""


def extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
    """Robustly extract and parse a JSON object from raw LLM text output."""
    try:
        parsed = json.loads(text.strip())
        if "tracks" in parsed:
            return parsed
    except json.JSONDecodeError:
        pass

    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            parsed = json.loads(match.group(0))
            if "tracks" in parsed:
                return parsed
        except json.JSONDecodeError:
            pass

    start = text.find("{")
    end = text.rfind("}") + 1
    if start != -1 and end > start:
        try:
            parsed = json.loads(text[start:end])
            if "tracks" in parsed:
                return parsed
        except json.JSONDecodeError:
            pass

    return None


def validate_roadmap(data: Dict[str, Any], expected_skill_count: int) -> bool:
    """Validate the roadmap has the expected per-skill track structure."""
    if not isinstance(data, dict):
        return False
    if "tracks" not in data or not isinstance(data["tracks"], list):
        return False
    if len(data["tracks"]) == 0:
        return False
    for track in data["tracks"]:
        if not isinstance(track, dict):
            return False
        if "skill" not in track or "concepts" not in track:
            return False
        if not isinstance(track["concepts"], list) or len(track["concepts"]) == 0:
            return False
        for concept in track["concepts"]:
            if not isinstance(concept, dict):
                return False
            if "name" not in concept or "tasks" not in concept:
                return False
            if not isinstance(concept["tasks"], list) or len(concept["tasks"]) == 0:
                return False
    return True


def call_huggingface_llm(
    readiness_score: float,
    skill_gaps: List[str],
    branch: str,
    token: str,
) -> Optional[Dict[str, Any]]:
    """Call HuggingFace Router API to generate per-skill roadmap via LLM."""
    prompt = build_roadmap_prompt(readiness_score, skill_gaps, branch)
    chat_url = "https://router.huggingface.co/hf-inference/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    for model in HF_MODELS:
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a campus placement coach. "
                        "Return ONLY a valid JSON object — no markdown, no explanations, "
                        "no text before or after the JSON."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            "max_tokens": 1800,
            "temperature": 0.4,
            "response_format": {"type": "json_object"},
        }

        try:
            resp = requests.post(chat_url, headers=headers, json=payload, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                parsed = extract_json_from_text(content)
                if parsed and validate_roadmap(parsed, len(skill_gaps)):
                    return parsed
        except requests.exceptions.Timeout:
            continue
        except Exception:
            continue

    return None


# Comprehensive placement curriculum providing specific reading topics and concepts per skill
DETAILED_SKILL_CURRICULUM = {
    "python": [
        {
            "name": "Core Syntax, Memory Model & Object-Oriented Programming",
            "tasks": [
                "Read & Study: Python memory model, mutable vs immutable types, list/dict/set comprehensions, and generators (yield).",
                "Read & Study: OOP in Python: __init__, inheritance, dunder methods (__str__, __repr__, __call__), @classmethod and @staticmethod.",
                "Hands-on: Write custom decorators, generators, and context managers using the 'with' statement."
            ]
        },
        {
            "name": "Data Structures with Python Standard Libraries",
            "tasks": [
                "Read & Study: Time complexity of built-ins (list O(n) pop(0) vs deque O(1) popleft); bisect module for binary search.",
                "Read & Study: Mastering collections (Counter, defaultdict, OrderedDict) and heapq for priority queues.",
                "Practice: Solve 15 LeetCode medium questions applying Python collections and hash tables."
            ]
        },
        {
            "name": "Concurrency, Internals & Top Placement Interview Questions",
            "tasks": [
                "Read & Study: Global Interpreter Lock (GIL), Multithreading vs Multiprocessing vs Asyncio event loops.",
                "Read & Study: Top 50 Python placement questions: shallow vs deep copy, lambda functions, args/kwargs, and garbage collection.",
                "Practice: Complete a timed 45-minute Python technical assessment covering OOP and edge cases."
            ]
        }
    ],
    "sql": [
        {
            "name": "Relational Modeling, Schema Design & Advanced Joins",
            "tasks": [
                "Read & Study: Relational schemas, Primary vs Foreign keys, Database Normalization (1NF, 2NF, 3NF, BCNF).",
                "Read & Study: Joins in-depth: INNER, LEFT/RIGHT OUTER, FULL OUTER, CROSS JOIN, and handling NULL values in comparisons.",
                "Practice: Solve 10 queries using GROUP BY, HAVING, and correlated vs non-correlated subqueries."
            ]
        },
        {
            "name": "Advanced Window Functions & Common Table Expressions (CTEs)",
            "tasks": [
                "Read & Study: Window function mechanics: OVER(PARTITION BY ... ORDER BY ...), ROW_NUMBER(), RANK(), DENSE_RANK().",
                "Read & Study: LEAD(), LAG(), NTILE(), running totals, and Recursive CTEs for hierarchical data.",
                "Practice: Complete the LeetCode SQL 50 study plan focusing on top 20 window function questions."
            ]
        },
        {
            "name": "Database Internals, Indexing & Query Optimization",
            "tasks": [
                "Read & Study: B-Tree vs Hash indexing; Clustered vs Non-Clustered index trade-offs.",
                "Read & Study: ACID properties, transaction isolation levels (Dirty Reads, Non-repeatable Reads, Phantom Reads).",
                "Practice: Analyze and optimize slow queries using EXPLAIN / EXPLAIN ANALYZE execution plans."
            ]
        }
    ],
    "communication": [
        {
            "name": "Technical Storytelling & Project Explanation Framework",
            "tasks": [
                "Read & Study: The PAR (Problem-Action-Result) and Architecture-Impact frameworks for project walkthroughs.",
                "Practice: Prepare and record a 2-minute elevator pitch explaining your core project without fillers (um, like, actually).",
                "Practice: Practice explaining how you diagnosed and resolved a difficult software bug under pressure."
            ]
        },
        {
            "name": "The STAR Method for HR & Behavioral Interviews",
            "tasks": [
                "Read & Study: The STAR method (Situation, Task, Action, Result) for answering behavioral and situational questions.",
                "Practice: Prepare structured STAR answers for: 'Tell me about a time you failed' and 'Handling conflict in a team'.",
                "Practice: Rehearse researched answers for 'Why this company?' and 'What are your greatest strengths and weaknesses?'."
            ]
        },
        {
            "name": "Group Discussion (GD) & Just-A-Minute (JAM) Drills",
            "tasks": [
                "Read & Study: GD strategies: initiating discussions effectively, building consensus, using PESTLE framework for points.",
                "Practice: Deliver a 60-second impromptu speech (JAM) on trending tech topics with clear voice modulation.",
                "Practice: Participate in a mock group discussion session and summarize key peer arguments constructively."
            ]
        }
    ],
    "aptitude": [
        {
            "name": "Quantitative Aptitude - Arithmetic Foundations",
            "tasks": [
                "Read & Study: Speed math & mental calculation tricks for percentages, fractions, and ratio & proportions.",
                "Read & Study: Core formulas and shortcuts for Profit & Loss, Time Speed Distance (train problems), and Time & Work.",
                "Practice: Solve 40 arithmetic placement questions on IndiaBix under a strict 45-minute timer."
            ]
        },
        {
            "name": "Modern Quantitative Math, Probability & Number Systems",
            "tasks": [
                "Read & Study: Permutations & Combinations (circular permutations, restrictions) and Probability (Bayes theorem, coins/dice).",
                "Read & Study: Number systems shortcuts: LCM/HCF, divisibility rules, unit digit calculation, and remainders.",
                "Practice: Solve 30 moderate-to-hard probability and combination questions from previous campus placement papers."
            ]
        },
        {
            "name": "Logical & Analytical Reasoning Drills",
            "tasks": [
                "Read & Study: Syllogisms via Venn diagrams; Blood relations; Direction sense tests.",
                "Read & Study: Linear and circular seating arrangements with complex conditional constraints.",
                "Practice: Complete 2 full-length 30-minute campus aptitude mock tests (TCS/Infosys/Accenture pattern)."
            ]
        }
    ],
    "projects": [
        {
            "name": "Production-Grade Full-Stack Project Architecture",
            "tasks": [
                "Read & Study: 3-tier architecture: modular separation of UI, API controllers, service layer, and database models.",
                "Read & Study: Secure authentication workflows: JWT token generation, refresh tokens, and password hashing with bcrypt.",
                "Practice: Implement robust input validation (Pydantic/Zod) and centralized error handling in your backend."
            ]
        },
        {
            "name": "Code Quality, Unit Testing & API Documentation",
            "tasks": [
                "Read & Study: Writing automated test suites (PyTest or Jest) covering critical business logic endpoints.",
                "Read & Study: OpenAPI/Swagger documentation best practices with schema descriptions and status codes.",
                "Practice: Refactor large monolithic files into clean, decoupled service modules with proper type annotations."
            ]
        },
        {
            "name": "GitHub Portfolio Presentation & Live Cloud Deployment",
            "tasks": [
                "Read & Study: Professional README structure: architecture diagram, feature highlights, tech stack badges, and setup guide.",
                "Practice: Deploy the application to cloud platforms (Vercel, Render, or AWS) and obtain live public URLs.",
                "Practice: Configure a GitHub Actions CI pipeline that automatically tests and lints code on every commit."
            ]
        }
    ],
    "docker": [
        {
            "name": "Containerization Fundamentals & Dockerfile Best Practices",
            "tasks": [
                "Read & Study: Docker engine architecture: images vs containers, UnionFS layer caching, and .dockerignore.",
                "Read & Study: Multi-stage Dockerfile builds to minimize production image footprint using lightweight Alpine/Slim bases.",
                "Practice: Containerize your backend API service with explicit ports, environment variables, and non-root users."
            ]
        },
        {
            "name": "Multi-Container Orchestration with Docker Compose",
            "tasks": [
                "Read & Study: Docker Compose specifications: services, bridge networks, and persistent volume management.",
                "Practice: Create a docker-compose.yml running frontend, backend, and MongoDB/PostgreSQL simultaneously.",
                "Practice: Practice inspecting container metrics, tailing logs, and executing interactive shells (docker exec -it)."
            ]
        },
        {
            "name": "Image Registry Publishing & CI/CD Cloud Deployments",
            "tasks": [
                "Read & Study: Semantic version tagging, image vulnerability scanning, and Docker Hub repository management.",
                "Practice: Write a GitHub Actions workflow to build and push container images to Docker Hub automatically.",
                "Practice: Deploy the containerized application to cloud compute (Render, AWS ECS, or DigitalOcean)."
            ]
        }
    ],
    "system design": [
        {
            "name": "High-Level Architecture, Scalability & Load Balancing",
            "tasks": [
                "Read & Study: Horizontal vs Vertical scaling, stateless server architectures, and CDN caching for static assets.",
                "Read & Study: Load Balancer algorithms (Round Robin, Least Connections, Consistent Hashing) and Layer 4 vs Layer 7 routing.",
                "Practice: Diagram a high-availability multi-tier architecture on Excalidraw with reverse proxy and redundancy."
            ]
        },
        {
            "name": "Distributed Caching, Databases & Asynchronous Queues",
            "tasks": [
                "Read & Study: Redis caching strategies: Cache-Aside, Write-Through, Write-Back; eviction policies (LRU, LFU).",
                "Read & Study: CAP Theorem, SQL ACID vs NoSQL BASE, and database sharding / replication.",
                "Read & Study: Asynchronous message brokers (RabbitMQ/Kafka) for event-driven decoupled systems."
            ]
        },
        {
            "name": "Standard Campus System Design Case Studies",
            "tasks": [
                "Read & Study: End-to-end design of TinyURL (URL Shortener): Base62 encoding, unique ID generation, and schema.",
                "Read & Study: End-to-end design of a Rate Limiter using Token Bucket and Sliding Window algorithms.",
                "Practice: Rehearse a 20-minute whiteboarding system design presentation explaining scale and bottlenecks."
            ]
        }
    ],
    "dsa": [
        {
            "name": "Arrays, Strings & Pointer Patterns",
            "tasks": [
                "Read & Study: Big-O time and space complexity, array memory contiguous layout, and Hash Table collision resolution.",
                "Read & Study: Two Pointers, Fast & Slow Pointers, and Sliding Window (fixed and dynamic size) patterns.",
                "Practice: Solve 20 LeetCode problems (Two Sum, 3Sum, Longest Substring Without Repeating Characters, Trapping Rain Water)."
            ]
        },
        {
            "name": "Trees, Graphs & Recursive Traversals",
            "tasks": [
                "Read & Study: Binary Trees, Binary Search Trees (BST), inorder/preorder/postorder traversals, and LCA.",
                "Read & Study: Graph representations (Adjacency list), BFS (Queue), DFS (Recursion), Cycle Detection, and Topological Sort.",
                "Practice: Solve 20 LeetCode medium questions (Number of Islands, Course Schedule, Rotting Oranges, Clone Graph)."
            ]
        },
        {
            "name": "Dynamic Programming & Technical Placement Rounds",
            "tasks": [
                "Read & Study: Identifying overlapping subproblems and optimal substructure; Memoization (Top-down) vs Tabulation (Bottom-up).",
                "Read & Study: Classical DP patterns: 0/1 Knapsack, Coin Change, Longest Common Subsequence, and House Robber.",
                "Practice: Complete 15 placement DP problems and conduct 2 timed 45-minute coding rounds on LeetCode."
            ]
        }
    ],
    "academic": [
        {
            "name": "Operating Systems & Concurrency Foundations",
            "tasks": [
                "Read & Study: Process vs Thread, Process state transitions, CPU scheduling algorithms (SJF, Round Robin).",
                "Read & Study: Deadlocks: 4 necessary conditions, Coffman conditions, and Banker's Algorithm for avoidance.",
                "Read & Study: Virtual Memory, Paging, Segmentation, Page replacement algorithms (FIFO, LRU, Optimal)."
            ]
        },
        {
            "name": "Computer Networks & Protocol Stacks",
            "tasks": [
                "Read & Study: OSI 7-Layer and TCP/IP 4-Layer models: functions of each layer and protocol encapsulation.",
                "Read & Study: TCP 3-Way Handshake, TCP vs UDP comparison, flow control, and congestion control.",
                "Read & Study: Application protocols: DNS resolution step-by-step, HTTP vs HTTPS, and TLS handshake."
            ]
        },
        {
            "name": "Database Management Systems (DBMS) & OOP Concepts",
            "tasks": [
                "Read & Study: ACID properties, transactions, serializability, and 2-Phase Locking protocol.",
                "Read & Study: 4 Pillars of OOP: Abstraction, Encapsulation, Inheritance, Polymorphism with code examples.",
                "Practice: Review the top 50 campus interview questions for OS, DBMS, and Networks on GeeksforGeeks."
            ]
        }
    ],
    "internship": [
        {
            "name": "Enterprise Agile Development & Ticket Workflows",
            "tasks": [
                "Read & Study: Agile & Scrum frameworks: sprints, user stories, acceptance criteria, and daily standups.",
                "Practice: Set up a GitHub Projects board to track tasks across Backlog, In Progress, Review, and Done.",
                "Practice: Follow the Conventional Commits specification (feat:, fix:, docs:, refactor:) on all pull requests."
            ]
        },
        {
            "name": "Open Source Contributions & Collaborative Engineering",
            "tasks": [
                "Read & Study: How to read enterprise codebases, navigate issue trackers, and find 'good first issue' labels.",
                "Practice: Fork an active open source repository, configure local dependencies, and submit a quality PR.",
                "Practice: Engage constructively with repository maintainers and resolve code review comments cleanly."
            ]
        },
        {
            "name": "Quantifying Project Impact for Technical Resumes",
            "tasks": [
                "Read & Study: The Google XYZ resume formula: 'Accomplished [X] as measured by [Y] by doing [Z]'.",
                "Practice: Rewrite project bullet points highlighting quantifiable metrics (e.g. 'Reduced latency by 35%').",
                "Practice: Rehearse technical answers detailing architectural trade-offs made during development."
            ]
        }
    ]
}


def get_curriculum_for_skill(skill_name: str) -> List[Dict[str, Any]]:
    """Match a skill name against curated domain curriculum, or generate a structured syllabus."""
    lower = skill_name.lower().strip()
    
    if any(k in lower for k in ["python"]):
        return DETAILED_SKILL_CURRICULUM["python"]
    elif any(k in lower for k in ["sql", "database", "postgres", "mysql"]):
        return DETAILED_SKILL_CURRICULUM["sql"]
    elif any(k in lower for k in ["communication", "soft", "discussion", "gd", "leadership"]):
        return DETAILED_SKILL_CURRICULUM["communication"]
    elif any(k in lower for k in ["aptitude", "reasoning", "quant", "logical"]):
        return DETAILED_SKILL_CURRICULUM["aptitude"]
    elif any(k in lower for k in ["project", "github", "portfolio", "repo"]):
        return DETAILED_SKILL_CURRICULUM["projects"]
    elif any(k in lower for k in ["docker", "devops", "kubernetes", "k8s", "aws", "cloud"]):
        return DETAILED_SKILL_CURRICULUM["docker"]
    elif any(k in lower for k in ["system design", "architecture", "microservice"]):
        return DETAILED_SKILL_CURRICULUM["system design"]
    elif any(k in lower for k in ["dsa", "data structure", "algorithm", "leetcode"]):
        return DETAILED_SKILL_CURRICULUM["dsa"]
    elif any(k in lower for k in ["academic", "cgpa", "backlog", "os", "network", "dbms"]):
        return DETAILED_SKILL_CURRICULUM["academic"]
    elif any(k in lower for k in ["internship", "experience", "work"]):
        return DETAILED_SKILL_CURRICULUM["internship"]
    else:
        # Dynamic fallback for any arbitrary skill
        return [
            {
                "name": f"Core Foundations & Architectural Principles of {skill_name}",
                "tasks": [
                    f"Read & Study: Official documentation and comprehensive overview of {skill_name} core mechanics.",
                    f"Read & Study: Fundamental design patterns, memory usage, and industry best practices for {skill_name}.",
                    f"Hands-on: Set up a dedicated local environment and build a hello-world proof of concept in {skill_name}."
                ]
            },
            {
                "name": f"Practical Application & Problem Solving in {skill_name}",
                "tasks": [
                    f"Hands-on: Build a modular mini-project applying key concepts of {skill_name} with unit testing.",
                    f"Practice: Solve 10 standard engineering placement problems and exercises related to {skill_name}.",
                    f"Practice: Refactor and optimize code implementation for performance and maintainability in {skill_name}."
                ]
            },
            {
                "name": f"Top Placement Interview Questions & Speed Drills for {skill_name}",
                "tasks": [
                    f"Read & Study: Top 40 campus placement interview questions and technical edge cases in {skill_name}.",
                    f"Practice: Complete a timed technical mock interview round explaining design trade-offs in {skill_name}.",
                    f"Practice: Review common errors, debugging strategies, and production pitfalls in {skill_name}."
                ]
            }
        ]


def build_dynamic_fallback(skill_gaps: List[str], branch: str, pace: str = "Standard") -> Dict[str, Any]:
    """Generates a fallback concept-based roadmap tailored to student gaps and learning pace with exact reading topics."""
    tracks = []
    gaps = skill_gaps if skill_gaps else ["Aptitude & Logical Reasoning", "Communication & Group Discussions", "Projects & GitHub Portfolio"]
    
    for skill in gaps:
        curriculum = get_curriculum_for_skill(skill)
        concepts = []
        
        for c in curriculum:
            tasks = c.get("tasks", [])
            if pace == "Relaxed":
                # 1 task per concept = 3 tasks per skill
                selected_tasks = tasks[:1]
            elif pace == "Intensive":
                # Up to 3 tasks per concept = ~7-9 tasks per skill
                selected_tasks = tasks[:3]
                if len(selected_tasks) < 2 and tasks:
                    selected_tasks.append(f"Deep-dive challenge: Complete advanced placement drills for {c['name']}.")
            else:
                # Standard: 2 tasks per concept = 5-6 tasks per skill
                selected_tasks = tasks[:2]

            concepts.append({
                "name": c["name"],
                "tasks": selected_tasks
            })

        tracks.append({
            "skill": skill,
            "concepts": concepts
        })

    return {"tracks": tracks, "pace": pace}


def generate_dynamic_roadmap(
    readiness_score: float,
    skill_gaps: List[str],
    branch: str,
    pace: str = "Standard",
) -> Dict[str, Any]:
    """Orchestrates roadmap generation using HF API with fallback."""
    hf_token = getattr(settings, "HUGGINGFACE_API_TOKEN", None)
    if hf_token:
        try:
            print(f"Attempting to generate concept roadmap for gaps: {skill_gaps}")
            data = call_huggingface_llm(readiness_score, skill_gaps, branch, hf_token)
            if data and validate_roadmap(data, len(skill_gaps)):
                print("Successfully generated valid LLM concept roadmap.")
                data["pace"] = pace
                return data
        except Exception as e:
            print(f"LLM roadmap generation failed: {e}")

    print("Falling back to dynamic concept template.")
    return build_dynamic_fallback(skill_gaps, branch, pace)


def generate_ai_roadmap(
    readiness_score: float,
    skill_gaps: List[str],
    branch: str,
    pace: str = "Standard",
) -> Dict[str, Any]:
    """Public interface for generating placement roadmap."""
    return generate_dynamic_roadmap(readiness_score, skill_gaps, branch, pace)
