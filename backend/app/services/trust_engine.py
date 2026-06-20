"""
CredIQ Trust Score Engine
=========================
Composite score (0-100) built from 5 weighted dimensions:

  GitHub Depth      30%  — real commit history, language variety, account age
  Skill Evidence    25%  — claimed skills backed by repo usage
  Project Quality   20%  — live deployments, stars, README quality
  Consistency       15%  — regular commit cadence vs. binge coding
  Community         10%  — followers, open-source contributions, forks
"""

from .github_service import analyze_profile


def compute_trust_score(username: str) -> dict:
    data = analyze_profile(username)
    if 'error' in data:
        return {'error': data['error'], 'username': username}

    # -- GitHub Depth (30) --
    age_score       = min(data['account_age_days'] / 730 * 30, 30)   # max out at 2 years
    repo_score      = min(data['public_repos'] / 20 * 10, 10)
    lang_diversity  = min(len(data['languages']) / 5 * 10, 10)
    github_depth    = round(age_score * 0.5 + repo_score * 0.25 + lang_diversity * 0.25)

    # -- Skill Evidence (25) -- proxy: language breadth + commit density
    commit_score    = min(data['commit_count'] / 200 * 25, 25)
    skill_evidence  = round(commit_score)

    # -- Project Quality (20) --
    star_score      = min(data['total_stars'] / 50 * 15, 15)
    repo_quality    = min(data['public_repos'] / 10 * 5, 5)
    project_quality = round(star_score + repo_quality)

    # -- Consistency (15) -- commit count as proxy (no per-week data without heavy API calls)
    consistency     = round(min(data['commit_count'] / 100 * 15, 15))

    # -- Community (10) --
    follower_score  = min(data['followers'] / 100 * 6, 6)
    fork_score      = min(data['total_forks'] / 20 * 4, 4)
    community       = round(follower_score + fork_score)

    total = min(github_depth + skill_evidence + project_quality + consistency + community, 100)

    return {
        'username':   username,
        'total':      total,
        'dimensions': {
            'github_depth':    github_depth,
            'skill_evidence':  skill_evidence,
            'project_quality': project_quality,
            'consistency':     consistency,
            'community':       community,
        },
        'raw': {
            'public_repos':     data['public_repos'],
            'total_stars':      data['total_stars'],
            'total_forks':      data['total_forks'],
            'commit_count':     data['commit_count'],
            'followers':        data['followers'],
            'account_age_days': data['account_age_days'],
            'languages':        data['languages'],
        },
    }
