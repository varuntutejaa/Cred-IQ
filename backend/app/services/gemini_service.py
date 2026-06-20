import os
import json
from google import genai
from google.genai import types

_client = None

def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise RuntimeError('GEMINI_API_KEY not set in .env')
        _client = genai.Client(api_key=api_key)
    return _client


def _generate(prompt: str) -> str:
    client   = _get_client()
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.3),
    )
    text = response.text.strip()
    # Strip markdown code fences if present
    if text.startswith('```'):
        text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()
    return text


def generate_career_insights(github_data: dict, trust_score: dict, builder_score: dict) -> dict:
    languages = ', '.join(f"{l['name']} ({l['pct']}%)" for l in github_data.get('languages', [])[:6])
    top_repos = '\n'.join(
        f"  - {r['name']} ({r['lang']}, ⭐{r['stars']}): {r['desc'][:80]}"
        for r in github_data.get('top_repos', [])[:5]
    )

    prompt = f"""You are a senior engineering hiring consultant. Analyse this developer's GitHub profile and give concise, actionable career insights.

DEVELOPER PROFILE:
- GitHub: {github_data.get('username')}
- Account age: {github_data.get('account_age_days', 0) // 365}y {(github_data.get('account_age_days', 0) % 365) // 30}m
- Public repos: {github_data.get('public_repos', 0)}
- Total stars: {github_data.get('total_stars', 0)}
- Followers: {github_data.get('followers', 0)}
- Commits (last 12 months): {github_data.get('commit_count', 0)}
- Languages: {languages}
- Trust Score: {trust_score.get('total', 'N/A')}/100
- Builder Score: {builder_score.get('total', 'N/A')}/100

TOP REPOSITORIES:
{top_repos}

Respond ONLY with valid JSON, no markdown:
{{
  "summary": "2-3 sentence honest assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2"],
  "recommended_roles": ["role 1", "role 2", "role 3"],
  "salary_range": "₹X-Y LPA (India) / $X-$Yk (US)",
  "next_steps": ["step 1", "step 2", "step 3"],
  "market_fit": "high|medium|low",
  "standout_project": "repo name and why in 1 sentence"
}}"""

    return json.loads(_generate(prompt))


def generate_vibe_verdict(vibe_data: dict, github_data: dict) -> dict:
    flags = ', '.join(vibe_data.get('flags', [])) or 'none detected'

    prompt = f"""You are a code authenticity expert. Analyse these signals and give a recruiter-friendly verdict on whether this developer's work looks human-written or AI/vibe-coded.

SIGNALS:
- Vibe risk score: {vibe_data.get('risk_score', 0)}/100
- Raw verdict: {vibe_data.get('verdict')}
- Repos checked: {vibe_data.get('repos_checked', 0)}
- Flags: {flags}
- Total public repos: {github_data.get('public_repos', 0)}
- Commits (12 months): {github_data.get('commit_count', 0)}
- Account age days: {github_data.get('account_age_days', 0)}

Respond ONLY with valid JSON, no markdown:
{{
  "verdict": "clean|mixed|high_risk",
  "confidence": "high|medium|low",
  "explanation": "2-3 sentence plain-English explanation for a recruiter",
  "red_flags": ["flag 1", "flag 2"],
  "green_flags": ["positive signal 1", "positive signal 2"],
  "recommendation": "hire|review_further|caution"
}}"""

    return json.loads(_generate(prompt))
