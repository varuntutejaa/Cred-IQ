import os
from datetime import datetime, timezone, timedelta
from github import Github, GithubException

_gh: Github | None = None

def _client() -> Github:
    global _gh
    if _gh is None:
        token = os.getenv('GITHUB_ACCESS_TOKEN')
        _gh   = Github(token) if token else Github()
    return _gh


def analyze_profile(username: str) -> dict:
    try:
        g    = _client()
        user = g.get_user(username)
    except GithubException as e:
        return {'error': str(e), 'username': username}

    repos      = list(user.get_repos())
    pub_repos  = [r for r in repos if not r.private]

    lang_bytes: dict[str, int] = {}
    total_stars  = 0
    total_forks  = 0
    commit_count = 0

    since = datetime.now(timezone.utc) - timedelta(days=365)
    recent_repos = sorted(pub_repos, key=lambda r: r.pushed_at or datetime.min.replace(tzinfo=timezone.utc), reverse=True)[:20]

    for repo in recent_repos:
        total_stars += repo.stargazers_count
        total_forks += repo.forks_count
        if repo.language:
            lang_bytes[repo.language] = lang_bytes.get(repo.language, 0) + 1
        try:
            stats = repo.get_stats_commit_activity()
            if stats:
                commit_count += sum(w.total for w in stats if w.week >= since)
        except Exception:
            pass

    total_lang_repos = sum(lang_bytes.values()) or 1
    languages = sorted(
        [{'name': l, 'repos': c, 'pct': round(c / total_lang_repos * 100)} for l, c in lang_bytes.items()],
        key=lambda x: x['repos'], reverse=True
    )[:10]

    top_repos = [
        {
            'name':     r.name,
            'desc':     r.description or '',
            'stars':    r.stargazers_count,
            'forks':    r.forks_count,
            'lang':     r.language or 'Unknown',
            'url':      r.html_url,
            'updated':  r.pushed_at.isoformat() if r.pushed_at else None,
        }
        for r in sorted(pub_repos, key=lambda r: r.stargazers_count, reverse=True)[:8]
    ]

    account_age_days = (datetime.now(timezone.utc) - user.created_at).days

    return {
        'username':        username,
        'name':            user.name or username,
        'avatar':          user.avatar_url,
        'bio':             user.bio or '',
        'location':        user.location or '',
        'followers':       user.followers,
        'following':       user.following,
        'public_repos':    user.public_repos,
        'total_stars':     total_stars,
        'total_forks':     total_forks,
        'commit_count':    commit_count,
        'account_age_days': account_age_days,
        'languages':       languages,
        'top_repos':       top_repos,
    }


def vibe_code_analysis(username: str) -> dict:
    """
    Heuristically detect AI-generated / vibe-coded repos.
    Signals: bulk commits, late-night bursts, single large commits, low commit diversity.
    """
    try:
        g    = _client()
        user = g.get_user(username)
    except GithubException as e:
        return {'error': str(e)}

    repos       = list(user.get_repos())[:10]
    flags       = []
    risk_score  = 0

    for repo in repos:
        try:
            commits = list(repo.get_commits()[:100])
            if not commits:
                continue

            # Single massive commit detection
            if len(commits) <= 3:
                flags.append(f'{repo.name}: only {len(commits)} commit(s) — possible paste job')
                risk_score += 20

            # Bulk commit timing (all within 24h)
            if len(commits) >= 5:
                times = [c.commit.author.date for c in commits[:10]]
                span  = (max(times) - min(times)).total_seconds()
                if span < 86400:
                    flags.append(f'{repo.name}: {len(commits[:10])} commits within 24 hours')
                    risk_score += 15

            # Generic commit messages
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
        'username':   username,
        'risk_score': risk_score,
        'verdict':    verdict,
        'flags':      flags,
        'repos_checked': len(repos),
    }
