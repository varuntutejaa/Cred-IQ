import os
from datetime import datetime, timezone, timedelta
from github import Github, GithubException

_gh: "Optional[Github]" = None

def _client() -> Github:
    global _gh
    if _gh is None:
        token = os.getenv('GITHUB_ACCESS_TOKEN')
        _gh   = Github(token, per_page=50) if token else Github(per_page=50)
    return _gh


def analyze_profile(username: str) -> dict:
    try:
        g    = _client()
        user = g.get_user(username)
    except GithubException as e:
        return {'error': str(e), 'username': username}

    # Fetch up to 50 repos in one call
    pub_repos = [r for r in user.get_repos()[:50] if not r.private]

    lang_bytes: dict[str, int] = {}
    total_stars = 0
    total_forks = 0

    for repo in pub_repos:
        total_stars += repo.stargazers_count
        total_forks += repo.forks_count
        if repo.language:
            lang_bytes[repo.language] = lang_bytes.get(repo.language, 0) + 1

    # Commit count from events (one fast API call, no per-repo loop)
    since         = datetime.now(timezone.utc) - timedelta(days=365)
    commit_count  = 0
    try:
        for event in user.get_events():
            if event.type == 'PushEvent' and event.created_at.replace(tzinfo=timezone.utc) >= since:
                commit_count += event.payload.get('size', 0)
            elif event.created_at.replace(tzinfo=timezone.utc) < since:
                break
    except Exception:
        pass

    total_lang_repos = sum(lang_bytes.values()) or 1
    languages = sorted(
        [{'name': l, 'repos': c, 'pct': round(c / total_lang_repos * 100)} for l, c in lang_bytes.items()],
        key=lambda x: x['repos'], reverse=True
    )[:10]

    URL_RE = __import__('re').compile(r'https?://[^\s"\'<>]+')
    top_repos = [
        {
            'name':       r.name,
            'desc':       r.description or '',
            'stars':      r.stargazers_count,
            'forks':      r.forks_count,
            'lang':       r.language or 'Unknown',
            'url':        r.html_url,
            'homepage':   r.homepage or '',
            'updated':    r.pushed_at.isoformat() if r.pushed_at else None,
            'created_at': r.created_at.isoformat() if r.created_at else None,
        }
        for r in sorted(pub_repos, key=lambda r: r.stargazers_count, reverse=True)[:8]
    ]

    account_age_days   = (datetime.now(timezone.utc) - user.created_at).days
    account_created_at = user.created_at.isoformat() if user.created_at else None

    return {
        'username':         username,
        'name':             user.name or username,
        'avatar':           user.avatar_url,
        'bio':              user.bio or '',
        'location':         user.location or '',
        'followers':        user.followers,
        'following':        user.following,
        'public_repos':     user.public_repos,
        'total_stars':      total_stars,
        'total_forks':      total_forks,
        'commit_count':     commit_count,
        'account_age_days':   account_age_days,
        'account_created_at': account_created_at,
        'languages':        languages,
        'top_repos':        top_repos,
        '_raw_repos':       pub_repos,   # internal — used by builder_score to skip re-fetch
    }


def vibe_code_analysis(username: str) -> dict:
    try:
        g    = _client()
        user = g.get_user(username)
    except GithubException as e:
        return {'error': str(e)}

    # Only check top 5 repos by stars — fast
    repos      = sorted([r for r in user.get_repos()[:30]], key=lambda r: r.stargazers_count, reverse=True)[:5]
    flags      = []
    risk_score = 0

    for repo in repos:
        try:
            commits  = list(repo.get_commits()[:30])
            if not commits:
                continue

            if len(commits) <= 3:
                flags.append(f'{repo.name}: only {len(commits)} commit(s)')
                risk_score += 20

            if len(commits) >= 5:
                times = [c.commit.author.date for c in commits[:10]]
                span  = (max(times) - min(times)).total_seconds()
                if span < 86400:
                    flags.append(f'{repo.name}: {len(commits[:10])} commits within 24 hours')
                    risk_score += 15

            messages = [c.commit.message.lower().strip() for c in commits[:20]]
            generic  = sum(1 for m in messages if m in ('initial commit', 'add files', 'update', 'done', 'test', 'fix'))
            if generic / max(len(messages), 1) > 0.6:
                flags.append(f'{repo.name}: {generic}/{len(messages)} generic commit messages')
                risk_score += 10

        except Exception:
            continue

    risk_score = min(risk_score, 100)
    verdict    = 'clean' if risk_score < 25 else ('mixed' if risk_score < 60 else 'high_risk')

    return {
        'username':      username,
        'risk_score':    risk_score,
        'verdict':       verdict,
        'flags':         flags,
        'repos_checked': len(repos),
    }
