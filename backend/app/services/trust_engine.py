"""
CredIQ Trust Score Engine
=========================
Primary path: Groq AI evaluates all GitHub signals holistically and scores
each dimension — no rigid formula, just reasoning from the full picture.

Fallback (if AI is unavailable): calibrated formula with realistic thresholds.

Dimensions:
  GitHub Depth      30 pts  — account maturity, repo volume, language variety
  Skill Evidence    25 pts  — commit activity + language breadth
  Project Quality   20 pts  — stars, forks (peer validation)
  Consistency       15 pts  — regular cadence vs. binge coding
  Community         10 pts  — followers, recognition
"""

from .github_service import analyze_profile


def _formula_fallback(data: dict, username: str) -> dict:
    """Formula-based scoring used when AI is unavailable."""
    commits   = data.get('commit_count', 0)
    repos     = data.get('public_repos', 0)
    stars     = data.get('total_stars', 0)
    forks     = data.get('total_forks', 0)
    followers = data.get('followers', 0)
    age_days  = data.get('account_age_days', 0)
    n_langs   = len(data.get('languages', []))

    github_depth    = round(min(age_days / 730, 1.0) * 15 + min(repos / 15, 1.0) * 10 + min(n_langs / 3, 1.0) * 5)
    skill_evidence  = round(min(commits / 100, 1.0) * 20 + min(n_langs / 4, 1.0) * 5)
    project_quality = round(min(stars / 30, 1.0) * 12 + min(forks / 10, 1.0) * 8)
    consistency     = round(min(commits / 75, 1.0) * 10 + min(repos / 8, 1.0) * 5)
    community       = round(min(followers / 25, 1.0) * 7 + min(stars / 50, 1.0) * 3)

    return {
        'github_depth':    github_depth,
        'skill_evidence':  skill_evidence,
        'project_quality': project_quality,
        'consistency':     consistency,
        'community':       community,
        'total':           min(github_depth + skill_evidence + project_quality + consistency + community, 100),
        'reasoning':       None,
    }


def compute_trust_score(username: str, github_data: dict = None) -> dict:
    """AI-powered trust score with formula fallback."""
    data = github_data or analyze_profile(username)
    if 'error' in data:
        return {'error': data['error'], 'username': username}

    try:
        from .gemini_service import generate_trust_score
        ai = generate_trust_score(data)
        dims = {
            'github_depth':    ai['github_depth'],
            'skill_evidence':  ai['skill_evidence'],
            'project_quality': ai['project_quality'],
            'consistency':     ai['consistency'],
            'community':       ai['community'],
        }
        total     = ai['total']
        reasoning = ai.get('reasoning')
        ai_scored = True
    except Exception:
        fb        = _formula_fallback(data, username)
        dims      = {k: fb[k] for k in ('github_depth', 'skill_evidence', 'project_quality', 'consistency', 'community')}
        total     = fb['total']
        reasoning = None
        ai_scored = False

    return {
        'username':   username,
        'total':      total,
        'ai_scored':  ai_scored,
        'reasoning':  reasoning,
        'dimensions': dims,
        'raw': {
            'public_repos':     data.get('public_repos', 0),
            'total_stars':      data.get('total_stars', 0),
            'total_forks':      data.get('total_forks', 0),
            'commit_count':     data.get('commit_count', 0),
            'followers':        data.get('followers', 0),
            'account_age_days': data.get('account_age_days', 0),
            'languages':        data.get('languages', []),
        },
    }
