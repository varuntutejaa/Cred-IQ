"""
Builder Confidence Score
========================
Answers: "Can this person actually ship production software?"

  Deployment Signal   35%  — live URLs found in repo descriptions / topics
  Code Volume         25%  — lines of code proxy via repo sizes
  Project Diversity   20%  — different domains (web, cli, api, ml, mobile)
  Recency             20%  — how recently they shipped something
"""

import re
from datetime import datetime, timezone, timedelta
from .github_service import _client
from github import GithubException

DOMAIN_KEYWORDS = {
    'web':    ['frontend', 'react', 'vue', 'angular', 'html', 'css', 'tailwind', 'nextjs', 'svelte'],
    'api':    ['api', 'flask', 'fastapi', 'django', 'express', 'node', 'rest', 'graphql'],
    'ml':     ['ml', 'ai', 'model', 'pytorch', 'tensorflow', 'sklearn', 'notebook', 'data'],
    'cli':    ['cli', 'terminal', 'shell', 'bash', 'tool', 'automation', 'script'],
    'mobile': ['android', 'ios', 'flutter', 'react-native', 'swift', 'kotlin'],
    'devops': ['docker', 'kubernetes', 'ci', 'deploy', 'infra', 'terraform', 'aws'],
}

URL_PATTERN = re.compile(r'https?://[^\s"]+')


def compute_builder_score(username: str, repos=None) -> dict:
    """Pass repos list to skip a redundant API call."""
    if repos is None:
        try:
            g    = _client()
            user = g.get_user(username)
        except GithubException as e:
            return {'error': str(e)}
        repos = [r for r in user.get_repos() if not r.private]

    # -- Deployment Signal (35) --
    deployed = 0
    for r in repos:
        topics = r.topics if hasattr(r, 'topics') else []
        text   = f"{r.description or ''} {r.homepage or ''} {' '.join(topics)}"
        if URL_PATTERN.search(text) or r.homepage:
            deployed += 1
    deploy_score = min(deployed / max(len(repos) * 0.3, 1) * 35, 35)

    # -- Code Volume (25) --
    total_kb  = sum(r.size for r in repos)
    vol_score = min(total_kb / 50000 * 25, 25)

    # -- Project Diversity (20) --
    domains_hit = set()
    for r in repos:
        topics = r.topics if hasattr(r, 'topics') else []
        text = f"{r.name} {r.description or ''} {r.language or ''} {' '.join(topics)}".lower()
        for domain, keywords in DOMAIN_KEYWORDS.items():
            if any(k in text for k in keywords):
                domains_hit.add(domain)
    diversity_score = min(len(domains_hit) / 3 * 20, 20)

    # -- Recency (20) --
    ninety_days_ago = datetime.now(timezone.utc) - timedelta(days=90)
    recent = sum(1 for r in repos if r.pushed_at and r.pushed_at > ninety_days_ago)
    recency_score = min(recent / 3 * 20, 20)

    total = round(min(deploy_score + vol_score + diversity_score + recency_score, 100))

    return {
        'username': username,
        'total':    total,
        'dimensions': {
            'deployment_signal': round(deploy_score),
            'code_volume':       round(vol_score),
            'project_diversity': round(diversity_score),
            'recency':           round(recency_score),
        },
        'signals': {
            'deployed_repos':  deployed,
            'total_repos':     len(repos),
            'domains_covered': list(domains_hit),
            'recently_active': recent,
        },
    }
