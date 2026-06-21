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

def analyze_score_breakdown(username: str, trust: dict, builder: dict, github_data: dict) -> dict:
    """AI explains every dimension of Trust + Builder scores with specific reasoning and tips."""
    cached = _cache_get(username, 'score_breakdown_v1')
    if cached:
        return cached

    td  = trust.get('dimensions', {})
    bd  = builder.get('dimensions', {})
    raw = trust.get('raw', {})

    langs = ', '.join(l['name'] for l in github_data.get('languages', [])[:6]) or 'unknown'
    repos = github_data.get('public_repos', raw.get('public_repos', 0))
    commits = github_data.get('commit_count', raw.get('commit_count', 0))
    stars   = github_data.get('total_stars', raw.get('total_stars', 0))
    forks   = github_data.get('total_forks', raw.get('total_forks', 0))
    followers = github_data.get('followers', raw.get('followers', 0))
    age_days  = github_data.get('account_age_days', raw.get('account_age_days', 0))
    age_yrs   = round(age_days / 365, 1)

    prompt = f"""You are a developer career coach. Analyse this developer's CredIQ scores and explain every dimension with specific reasoning based on their actual data.

DEVELOPER: @{username}
Raw signals: {age_yrs}yr account | {repos} repos | {commits} commits/yr | {stars} stars | {forks} forks | {followers} followers | Languages: {langs}

TRUST SCORE: {trust.get('total', '?')}/100
  github_depth:    {td.get('github_depth', '?')}/30
  skill_evidence:  {td.get('skill_evidence', '?')}/25
  project_quality: {td.get('project_quality', '?')}/20
  consistency:     {td.get('consistency', '?')}/15
  community:       {td.get('community', '?')}/10

BUILDER SCORE: {builder.get('total', '?')}/100
  deployment_signal: {bd.get('deployment_signal', '?')}/35
  code_volume:       {bd.get('code_volume', '?')}/25
  project_diversity: {bd.get('project_diversity', '?')}/20
  recency:           {bd.get('recency', '?')}/20

ALL fields are required. Return ONLY JSON, no markdown:
{{
  "overall": "<2 sentences: honest assessment of both scores combined and what they say about this developer>",
  "trust_summary": "<1-2 sentences: what the trust score reflects about their GitHub presence>",
  "builder_summary": "<1-2 sentences: what the builder score reflects about their shipping ability>",
  "trust_dimensions": {{
    "github_depth":    "<specific reason this dimension scored {td.get('github_depth','?')}/30 — reference actual numbers>",
    "skill_evidence":  "<specific reason this dimension scored {td.get('skill_evidence','?')}/25>",
    "project_quality": "<specific reason this dimension scored {td.get('project_quality','?')}/20>",
    "consistency":     "<specific reason this dimension scored {td.get('consistency','?')}/15>",
    "community":       "<specific reason this dimension scored {td.get('community','?')}/10>"
  }},
  "builder_dimensions": {{
    "deployment_signal": "<specific reason this scored {bd.get('deployment_signal','?')}/35>",
    "code_volume":       "<specific reason this scored {bd.get('code_volume','?')}/25>",
    "project_diversity": "<specific reason this scored {bd.get('project_diversity','?')}/20>",
    "recency":           "<specific reason this scored {bd.get('recency','?')}/20>"
  }},
  "trust_improvements":   ["<specific action to raise trust score>", "<action 2>", "<action 3>"],
  "builder_improvements": ["<specific action to raise builder score>", "<action 2>", "<action 3>"]
}}"""

    raw_resp = _generate(prompt)
    import sys
    print(f'[score_breakdown for {username}]: {raw_resp[:300]}', file=sys.stderr)
    try:
        result = _parse_json(raw_resp)
    except Exception as e:
        raise ValueError(f'Score breakdown parse error: {e}\n{raw_resp[:400]}')

    _cache_set(username, 'score_breakdown_v1', result)
    return result


def analyze_certificate_skills(name: str, issuer: str, date: str) -> dict:
    """AI analysis of skills learned, career value, and insights from a certificate."""
    cache_key = f'{name.lower().replace(" ", "_")}__{issuer.lower().replace(" ", "_")}'

    cached = _cache_get(cache_key, 'cert_v1')
    if cached:
        return cached

    prompt = f"""You are a technical career advisor. Analyse this professional certificate and return detailed insights.

Certificate: {name}
Issuer: {issuer or 'Unknown'}
Date: {date or 'Unknown'}

Return ONLY a JSON object, no markdown, all fields required:
{{
  "skills_learned": ["<specific technical skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "skill_analysis": "<2-3 sentences: what this certificate proves the holder knows and can do in practice>",
  "career_insights": "<2 sentences: how this certificate impacts career prospects and what roles it unlocks>",
  "industry_value": "high",
  "difficulty_level": "intermediate",
  "complementary_skills": ["<related skill to learn next>", "<skill 2>", "<skill 3>"],
  "job_roles": ["<relevant job title 1>", "<title 2>", "<title 3>"],
  "real_world_applications": ["<practical use case 1>", "<use case 2>", "<use case 3>"]
}}
industry_value must be one of: high, medium, low
difficulty_level must be one of: beginner, intermediate, advanced, expert"""

    raw = _generate(prompt)
    try:
        result = _parse_json(raw)
    except Exception as e:
        raise ValueError(f'Certificate AI parse error: {e}\n{raw[:300]}')

    _cache_set(cache_key, 'cert_v1', result)
    return result


def generate_trust_score(github_data: dict, top_repos_raw=None) -> dict:
    """AI-powered trust score — Groq evaluates all signals holistically."""
    username = github_data.get('username', '')

    cached = _cache_get(username, 'trust_v1')
    if cached:
        return cached

    langs = ', '.join(f"{l['name']} ({l['pct']}%)" for l in github_data.get('languages', [])[:8])
    repos_text = '\n'.join(
        f"  - {r['name']} ({r.get('lang','?')}, ⭐{r.get('stars',0)}, {r.get('desc','')[:60]})"
        for r in github_data.get('top_repos', [])[:6]
    ) or '  none'

    commits   = github_data.get('commit_count', 0)
    repos     = github_data.get('public_repos', 0)
    stars     = github_data.get('total_stars', 0)
    forks     = github_data.get('total_forks', 0)
    followers = github_data.get('followers', 0)
    age_yrs   = round(github_data.get('account_age_days', 0) / 365, 1)

    prompt = f"""You are a senior engineering recruiter evaluating a developer's GitHub credibility.
Score each dimension honestly based on ALL signals together — not a rigid formula.

DEVELOPER: @{username}
- Account age: {age_yrs} years
- Public repos: {repos}
- Total stars earned: {stars}
- Total forks: {forks}
- Followers: {followers}
- Commits last 12 months: {commits}
- Languages: {langs or 'unknown'}

TOP REPOS:
{repos_text}

Score these 5 dimensions. Each has a MAX shown. Be realistic and critical — reserve high scores for genuinely impressive profiles. An average active developer should score 45-65 total.

Return ONLY this JSON, no markdown:
{{
  "github_depth": <0-30>,
  "skill_evidence": <0-25>,
  "project_quality": <0-20>,
  "consistency": <0-15>,
  "community": <0-10>,
  "reasoning": "<1-2 sentences explaining the overall score>"
}}

Scoring guide:
- github_depth (0-30): account age, repo count, language variety — 30 = 3+ years, 20+ repos, diverse languages
- skill_evidence (0-25): commit volume + language breadth — 25 = 150+ commits/yr across 4+ languages
- project_quality (0-20): stars, forks, useful repos — 20 = 30+ stars, 10+ forks, impactful projects
- consistency (0-15): regular coding cadence — 15 = coding consistently throughout the year, not just spikes
- community (0-10): followers, recognition — 10 = 25+ followers, community presence"""

    raw = _generate(prompt)
    import sys
    print(f'[trust score raw for {username}]: {raw[:400]}', file=sys.stderr)

    try:
        result = _parse_json(raw)
    except Exception as e:
        raise ValueError(f'AI trust score unparseable: {e}\n{raw[:400]}')

    # Clamp each dimension to its max
    result['github_depth']    = max(0, min(int(result.get('github_depth',    0)), 30))
    result['skill_evidence']  = max(0, min(int(result.get('skill_evidence',  0)), 25))
    result['project_quality'] = max(0, min(int(result.get('project_quality', 0)), 20))
    result['consistency']     = max(0, min(int(result.get('consistency',     0)), 15))
    result['community']       = max(0, min(int(result.get('community',       0)), 10))
    result['total']           = (
        result['github_depth'] + result['skill_evidence'] +
        result['project_quality'] + result['consistency'] + result['community']
    )

    _cache_set(username, 'trust_v1', result)
    return result


def generate_career_insights(github_data: dict, trust_score: dict, builder_score: dict) -> dict:
    username = github_data.get('username', '')

    cached = _cache_get(username, 'career_v3')
    if cached:
        return cached

    languages = ', '.join(f"{l['name']} ({l['pct']}%)" for l in github_data.get('languages', [])[:6])
    top_repos = '\n'.join(
        f"  - {r['name']} ({r['lang']}, ⭐{r['stars']}): {r.get('desc','')[:80]}"
        for r in github_data.get('top_repos', [])[:5]
    )

    prompt = f"""You are a senior engineering career advisor. Analyse this GitHub developer profile and respond with ONLY a JSON object — no markdown, no prose outside the JSON.

PROFILE:
Username: {username}
Account age: {github_data.get('account_age_days', 0) // 365}y {(github_data.get('account_age_days', 0) % 365) // 30}m
Public repos: {github_data.get('public_repos', 0)}, Stars: {github_data.get('total_stars', 0)}, Followers: {github_data.get('followers', 0)}
Commits (12mo): {github_data.get('commit_count', 0)}
Languages: {languages or 'unknown'}
Trust Score: {trust_score.get('total', 'N/A')}/100, Builder Score: {builder_score.get('total', 'N/A')}/100
Top repos:
{top_repos or '  none'}

ALL 11 fields below are REQUIRED. Do not omit any. Output exactly this JSON structure filled with real values:
{{
  "summary": "<3 sentences: honest profile assessment + market positioning>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "gaps": ["<skill gap 1>", "<skill gap 2>", "<skill gap 3>"],
  "recommended_roles": ["<job title 1>", "<job title 2>", "<job title 3>"],
  "learning_path": ["<specific skill to learn + why>", "<skill 2>", "<skill 3>", "<skill 4>"],
  "tech_stack_advice": "<2-3 sentences: what to adopt, what to drop, what fits their trajectory>",
  "profile_improvements": ["<github profile fix 1>", "<fix 2>", "<fix 3>"],
  "open_source_advice": "<2 sentences: how to approach open source given their stack and level>",
  "next_steps": ["<concrete action 1>", "<action 2>", "<action 3>"],
  "market_fit": "high",
  "collaboration_potential": "high",
  "standout_project": "<repo name — one sentence why it stands out>"
}}
market_fit must be one of: high, medium, low
collaboration_potential must be one of: high, medium, low"""

    raw = _generate(prompt)
    import sys
    print(f"[AI raw for {username}]:\n{raw[:1000]}", file=sys.stderr)
    try:
        result = _parse_json(raw)
    except Exception as e:
        raise ValueError(f'AI returned unparseable JSON: {e}\n\nRaw:\n{raw[:600]}')

    _cache_set(username, 'career_v3', result)
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
