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


def build_roadmap_prompt(readiness_score: float, skill_gaps: List[str], branch: str) -> str:
    gaps_str = "\n".join([f"- {g}" for g in skill_gaps]) if skill_gaps else "- General placement preparation"

    return f"""You are an elite campus placement mentor for engineering students in India.
Create a structured, 100% relevant 4-week preparation roadmap for a {branch} student.

STUDENT PROFILE:
- Branch: {branch}
- Placement Readiness Score: {readiness_score}/100
- SKILL GAPS TO BRIDGE (Every week MUST address these directly):
{gaps_str}

STRICT RULES:
1. Each week must have EXACTLY 3 to 4 highly actionable, specific tasks.
2. Every task must directly target one of the listed skill gaps — do NOT add unrelated generic tasks.
3. Tasks must be concrete and measurable (e.g., "Solve 20 LeetCode SQL problems focusing on Window Functions" not "Practice SQL").
4. Week titles must name the specific skills being addressed that week.
5. Progress from fundamentals (Week 1) to advanced application and mock interviews (Week 4).
6. Return ONLY valid JSON — no explanations, no markdown, no text outside the JSON.

Output format (strict JSON):
{{
  "weeks": [
    {{
      "title": "Week 1: <Specific skill gap names> Foundations",
      "tasks": ["<Highly specific task 1>", "<Highly specific task 2>", "<Highly specific task 3>"]
    }},
    {{
      "title": "Week 2: <Specific skill gap names> Applied Practice",
      "tasks": ["<Highly specific task 1>", "<Highly specific task 2>", "<Highly specific task 3>"]
    }},
    {{
      "title": "Week 3: <Specific skill gap names> Advanced & System Design",
      "tasks": ["<Highly specific task 1>", "<Highly specific task 2>", "<Highly specific task 3>"]
    }},
    {{
      "title": "Week 4: <Specific skill gap names> Mock Interviews & Showcase",
      "tasks": ["<Highly specific task 1>", "<Highly specific task 2>", "<Highly specific task 3>"]
    }}
  ]
}}"""


def extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
    """Robustly extract and parse a JSON object from raw LLM text output."""
    # Try direct parse first
    try:
        parsed = json.loads(text.strip())
        if "weeks" in parsed:
            return parsed
    except json.JSONDecodeError:
        pass

    # Try extracting via regex (first full {...} block)
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            parsed = json.loads(match.group(0))
            if "weeks" in parsed:
                return parsed
        except json.JSONDecodeError:
            pass

    # Try first { to last }
    start = text.find("{")
    end = text.rfind("}") + 1
    if start != -1 and end > start:
        try:
            parsed = json.loads(text[start:end])
            if "weeks" in parsed:
                return parsed
        except json.JSONDecodeError:
            pass

    return None


def validate_roadmap(data: Dict[str, Any]) -> bool:
    """Validate the roadmap has the expected 4-week structure."""
    if not isinstance(data, dict):
        return False
    if "weeks" not in data or not isinstance(data["weeks"], list):
        return False
    if len(data["weeks"]) != 4:
        return False
    for week in data["weeks"]:
        if not isinstance(week, dict):
            return False
        if "title" not in week or "tasks" not in week:
            return False
        if not isinstance(week["tasks"], list) or len(week["tasks"]) < 2:
            return False
    return True


def call_huggingface_llm(
    readiness_score: float,
    skill_gaps: List[str],
    branch: str,
    token: str,
) -> Optional[Dict[str, Any]]:
    """Call HuggingFace Router API to generate roadmap via LLM."""
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
                        "You MUST return ONLY a valid JSON object — no markdown, no explanations, "
                        "no text before or after the JSON."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            "max_tokens": 1200,
            "temperature": 0.4,
            "response_format": {"type": "json_object"},
        }

        try:
            resp = requests.post(chat_url, headers=headers, json=payload, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                parsed = extract_json_from_text(content)
                if parsed and validate_roadmap(parsed):
                    return parsed
        except requests.exceptions.Timeout:
            continue
        except Exception:
            continue

    return None


def build_minimal_dynamic_fallback(skill_gaps: List[str], branch: str) -> Dict[str, Any]:
    """
    Minimal structural fallback used ONLY when all LLM calls fail.
    Fully dynamic — uses the student's actual skill gaps with no hardcoded task text.
    """
    gaps = skill_gaps if skill_gaps else ["Placement Preparation"]
    gaps_title = " & ".join(gaps[:2])

    week_configs = [
        ("Foundations", "Study core concepts and fundamentals of {gap} from official documentation and beginner tutorials."),
        ("Applied Practice", "Build a working mini-project or feature that demonstrates {gap} in a real-world context."),
        ("Advanced & Testing", "Write unit tests, optimize performance, and handle edge cases for your {gap} implementation."),
        ("Mock Interviews & Showcase", "Document your {gap} work on GitHub with a clear README and prepare 3 interview talking points about it."),
    ]

    weeks = []
    for i, (theme, task_template) in enumerate(week_configs, start=1):
        tasks = [task_template.replace("{gap}", g) for g in gaps[:3]]
        if len(tasks) < 3:
            tasks.append(
                f"Complete a timed self-assessment quiz on {gaps_title} and identify remaining weak points."
            )
        weeks.append({
            "title": f"Week {i}: {gaps_title} {theme}",
            "tasks": tasks[:4],
        })

    return {"weeks": weeks}


def generate_ai_roadmap(
    readiness_score: float,
    skill_gaps: List[str],
    branch: str,
) -> Dict[str, Any]:
    """
    Generate a placement preparation roadmap using the HuggingFace LLM.
    Falls back to a fully dynamic gap-driven template ONLY if all LLM calls fail.
    """
    token = settings.HUGGINGFACE_API_TOKEN or os.getenv("HUGGINGFACE_API_TOKEN", "")

    # Primary: LLM-generated roadmap via HuggingFace
    if token:
        ai_result = call_huggingface_llm(readiness_score, skill_gaps, branch, token)
        if ai_result:
            return ai_result

    # Fallback: gap-driven structural template (no hardcoded task text)
    return build_minimal_dynamic_fallback(skill_gaps, branch)
