import os
import re
import json
from datetime import datetime, timezone, timedelta
from groq import Groq

_client = None
CACHE_TTL_HOURS = 6
GROQ_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'gemma2-9b-it',
]


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise RuntimeError('GROQ_API_KEY not set — add it to backend/.env')
        _client = Groq(api_key=api_key)
    return _client


def _generate(prompt: str) -> str:
    client   = _get_client()
    last_err = None
    for model in GROQ_MODELS:
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[{'role': 'user', 'content': prompt}],
                temperature=0.3,
                max_tokens=2048,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            last_err = e
            msg = str(e)
            if '429' in msg or 'rate' in msg.lower():
                continue   # try next model
            raise
    raise last_err


def _parse_json(text: str) -> dict:
    text = re.sub(r'^```[a-z]*\n?', '', text.strip(), flags=re.MULTILINE)
    text = re.sub(r'```$', '', text.strip(), flags=re.MULTILINE)
    text = text.strip()
    m = re.search(r'\{.*\}', text, re.DOTALL)
    if m:
        return json.loads(m.group(0))
    return json.loads(text)


# ─── Cache helpers ─────────────────────────────────────────────────────────────

def _cache_get(username: str, kind: str):
    try:
        from ..db import get_db
        cutoff = datetime.now(timezone.utc) - timedelta(hours=CACHE_TTL_HOURS)
        doc_id = f'{username}__{kind}'
        snap   = get_db().collection('ai_cache').document(doc_id).get()
        if not snap.exists:
            return None
        data = snap.to_dict()
        cached_at = data.get('cached_at')
        if cached_at and cached_at.replace(tzinfo=timezone.utc) > cutoff:
            return data.get('payload')
        return None
    except Exception:
        return None


def _cache_set(username: str, kind: str, payload: dict):
    try:
        from ..db import get_db
        doc_id = f'{username}__{kind}'
        get_db().collection('ai_cache').document(doc_id).set({
            'username':  username,
            'kind':      kind,
            'payload':   payload,
            'cached_at': datetime.now(timezone.utc),
        })
    except Exception:
        pass


# ─── Public API ────────────────────────────────────────────────────────────────

def generate_career_insights(github_data: dict, trust_score: dict, builder_score: dict) -> dict:
    username = github_data.get('username', '')

    cached = _cache_get(username, 'career_v2')
    if cached:
        return cached

    languages = ', '.join(f"{l['name']} ({l['pct']}%)" for l in github_data.get('languages', [])[:6])
    top_repos = '\n'.join(
        f"  - {r['name']} ({r['lang']}, ⭐{r['stars']}): {r.get('desc','')[:80]}"
        for r in github_data.get('top_repos', [])[:5]
    )

    prompt = f"""You are a senior engineering career advisor and technical mentor. Analyse this developer's GitHub profile deeply and return rich, personalised AI insights.

DEVELOPER PROFILE:
- GitHub: @{username}
- Account age: {github_data.get('account_age_days', 0) // 365}y {(github_data.get('account_age_days', 0) % 365) // 30}m
- Public repos: {github_data.get('public_repos', 0)}
- Total stars earned: {github_data.get('total_stars', 0)}
- Followers: {github_data.get('followers', 0)}
- Commits (last 12 months): {github_data.get('commit_count', 0)}
- Languages: {languages or 'unknown'}
- CredIQ Trust Score: {trust_score.get('total', 'N/A')}/100
- CredIQ Builder Score: {builder_score.get('total', 'N/A')}/100

TOP REPOSITORIES:
{top_repos or '  (none)'}

Return ONLY a raw JSON object — no markdown, no code fences, no extra text outside the braces:
{{
  "summary": "3-sentence honest assessment of this developer's profile, skill level, and overall positioning in the job market",
  "strengths": ["specific strength with evidence from the profile", "strength 2", "strength 3", "strength 4"],
  "gaps": ["specific skill gap or weakness 1", "gap 2", "gap 3"],
  "recommended_roles": ["Specific job title 1", "job title 2", "job title 3"],
  "learning_path": ["Specific technology or skill to learn next with a brief why", "learning item 2", "learning item 3", "learning item 4"],
  "tech_stack_advice": "2-3 sentences on which specific technologies to adopt, which to drop, and what emerging tools fit their current stack trajectory",
  "profile_improvements": ["Concrete GitHub profile or repo improvement 1", "improvement 2", "improvement 3"],
  "open_source_advice": "2 sentences on how this developer should approach open source contributions given their current skill level and stack",
  "next_steps": ["Concrete, actionable career step 1", "next step 2", "next step 3"],
  "market_fit": "high",
  "collaboration_potential": "high",
  "standout_project": "repo name — one sentence on why it stands out above the rest"
}}
market_fit must be exactly one of: high, medium, low
collaboration_potential must be exactly one of: high, medium, low"""

    raw = _generate(prompt)
    try:
        result = _parse_json(raw)
    except Exception as e:
        raise ValueError(f'AI returned unparseable JSON: {e}\n\nRaw:\n{raw[:500]}')

    _cache_set(username, 'career_v2', result)
    return result


def generate_vibe_verdict(vibe_data: dict, github_data: dict) -> dict:
    username = github_data.get('username', '')

    cached = _cache_get(username, 'vibe')
    if cached:
        return cached

    flags = ', '.join(vibe_data.get('flags', [])) or 'none detected'

    prompt = f"""You are a code authenticity expert reviewing a developer for a recruiter.

SIGNALS:
- Vibe risk score: {vibe_data.get('risk_score', 0)}/100 (higher = more AI-generated)
- Pattern verdict: {vibe_data.get('verdict')}
- Repos checked: {vibe_data.get('repos_checked', 0)}
- Flags: {flags}
- Total public repos: {github_data.get('public_repos', 0)}
- Commits (12 months): {github_data.get('commit_count', 0)}
- Account age days: {github_data.get('account_age_days', 0)}

Return ONLY a raw JSON object, no markdown, no code fences, no extra text:
{{
  "verdict": "clean",
  "confidence": "high",
  "explanation": "2-3 sentence plain-English explanation for a recruiter",
  "red_flags": ["concern if any"],
  "green_flags": ["positive signal 1", "positive signal 2"],
  "recommendation": "hire"
}}
verdict must be exactly one of: clean, mixed, high_risk
confidence must be exactly one of: high, medium, low
recommendation must be exactly one of: hire, review_further, caution"""

    raw = _generate(prompt)
    try:
        result = _parse_json(raw)
    except Exception as e:
        raise ValueError(f'AI returned unparseable JSON: {e}\n\nRaw:\n{raw[:500]}')

    _cache_set(username, 'vibe', result)
    return result
