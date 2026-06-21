import re
import time
import requests as http_requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone, date
from flask import Blueprint, jsonify
from github import GithubException
from ..firebase_admin_init import firebase_required
from ..services.github_service import analyze_profile, vibe_code_analysis, _client as gh_client

github_bp = Blueprint('github', __name__)

URL_RE = re.compile(r'https?://[^\s"\'<>]+')
PLATFORM_MAP = [
    ('vercel.app',   'Vercel'),
    ('netlify.app',  'Netlify'),
    ('render.com',   'Render'),
    ('railway.app',  'Railway'),
    ('github.io',    'GH Pages'),
    ('fly.dev',      'Fly.io'),
    ('onrender.com', 'Render'),
    ('herokuapp.com','Heroku'),
    ('pages.dev',    'CF Pages'),
]


def _detect_platform(url: str) -> str:
    for pat, name in PLATFORM_MAP:
        if pat in url:
            return name
    return 'Custom'


def _ping(url: str) -> dict:
    if not url:
        return {'status': 'unknown', 'https': False, 'response_ms': None}
    if not url.startswith('http'):
        url = 'https://' + url
    t0 = time.time()
    try:
        r = http_requests.head(url, timeout=5, allow_redirects=True, headers={'User-Agent': 'CredIQ/1.0'})
        ms = round((time.time() - t0) * 1000)
        is_https = r.url.startswith('https')
        if r.status_code < 400:
            status = 'slow' if ms > 1500 else 'online'
        else:
            status = 'offline'
        return {'status': status, 'https': is_https, 'response_ms': ms, 'http_code': r.status_code}
    except Exception:
        return {'status': 'offline', 'https': url.startswith('https'), 'response_ms': None}


@github_bp.get('/analyze/<username>')
@firebase_required
def analyze(username: str, firebase_uid, firebase_claims):
    result = analyze_profile(username)
    if 'error' in result:
        return jsonify(result), 502
    result.pop('_raw_repos', None)
    return jsonify(result)


@github_bp.get('/vibe/<username>')
@firebase_required
def vibe(username: str, firebase_uid, firebase_claims):
    result = vibe_code_analysis(username)
    if 'error' in result:
        return jsonify(result), 502
    return jsonify(result)


@github_bp.get('/deployments/<username>')
@firebase_required
def deployments(username: str, firebase_uid, firebase_claims):
    """
    Return deployment URLs extracted from repos + ping each one for live status.
    """
    profile = analyze_profile(username)
    if 'error' in profile:
        return jsonify(profile), 502

    candidates = []
    for repo in profile.get('top_repos', []):
        hp = (repo.get('homepage') or '').strip()
        if hp and hp.startswith('http'):
            candidates.append({
                'name':     repo['name'],
                'desc':     repo.get('desc', ''),
                'lang':     repo.get('lang', ''),
                'repo_url': repo.get('url', ''),
                'deploy_url': hp,
                'platform': _detect_platform(hp),
            })
        else:
            # also scan desc for URLs
            desc_urls = URL_RE.findall(repo.get('desc', ''))
            for u in desc_urls[:1]:
                if 'github.com' not in u:
                    candidates.append({
                        'name':       repo['name'],
                        'desc':       repo.get('desc', ''),
                        'lang':       repo.get('lang', ''),
                        'repo_url':   repo.get('url', ''),
                        'deploy_url': u,
                        'platform':   _detect_platform(u),
                    })
                    break

    # Ping all candidates in parallel (max 8)
    candidates = candidates[:8]
    results = []
    if candidates:
        with ThreadPoolExecutor(max_workers=6) as ex:
            future_to_c = {ex.submit(_ping, c['deploy_url']): c for c in candidates}
            for future in as_completed(future_to_c):
                c    = future_to_c[future]
                ping = future.result()
                health = 0
                if ping['status'] == 'online':
                    health = max(50, 100 - (ping['response_ms'] or 0) // 30)
                elif ping['status'] == 'slow':
                    health = 40
                results.append({**c, **ping, 'health': health})

    # Sort online first
    order = {'online': 0, 'slow': 1, 'offline': 2, 'unknown': 3}
    results.sort(key=lambda x: order.get(x['status'], 3))

    return jsonify({'username': username, 'deployments': results, 'count': len(results)})


GENERIC_MSGS = {
    'initial commit', 'init', 'first commit', 'add files', 'add file',
    'update', 'updates', 'done', 'test', 'fix', 'wip', 'changes',
    'change', 'commit', 'work', 'stuff', 'misc', 'temp',
}


def _score_repo(repo) -> dict:
    now = datetime.now(timezone.utc)
    age_days         = (now - repo.created_at).days
    last_active_days = (now - repo.pushed_at).days if repo.pushed_at else 999
    has_deployment   = bool(repo.homepage)

    # Commit analysis — one API call, capped at 50
    commit_count   = 0
    bulk_pattern   = False
    generic_ratio  = 0.0
    try:
        commits = list(repo.get_commits()[:50])
        commit_count = len(commits)
        if commit_count >= 5:
            times = [c.commit.author.date for c in commits[:10]]
            span  = (max(times) - min(times)).total_seconds()
            bulk_pattern = span < 3600
        if commits:
            msgs = [c.commit.message.lower().split('\n')[0].strip() for c in commits[:20]]
            generic_ratio = sum(1 for m in msgs if m in GENERIC_MSGS) / max(len(msgs), 1)
    except Exception:
        pass

    # README — one API call
    has_readme = False
    try:
        repo.get_readme()
        has_readme = True
    except Exception:
        pass

    # Score (start 100, deduct for red flags)
    score = 100
    flags = []

    # Very low commits for repo size
    if commit_count > 0 and repo.size > 0:
        kb_per_commit = repo.size / commit_count
        if kb_per_commit > 200 and commit_count <= 10:
            flags.append(f'Only {commit_count} commit(s) for {repo.size:,} KB of code — suspicious ratio')
            score -= 35
        elif kb_per_commit > 100 and commit_count <= 5:
            flags.append(f'Very few commits ({commit_count}) relative to code size ({repo.size:,} KB)')
            score -= 25

    if commit_count == 0:
        flags.append('No commits found')
        score -= 40

    # Brand new repo
    if age_days < 3:
        flags.append(f'Repository created only {age_days} day(s) ago')
        score -= 20
    elif age_days < 14:
        flags.append(f'Repository only {age_days} days old')
        score -= 10

    # Bulk commit pattern
    if bulk_pattern:
        flags.append('Multiple commits pushed within 1 hour — possible bulk upload')
        score -= 20

    # Generic commit messages
    if generic_ratio > 0.5:
        flags.append(f'{round(generic_ratio * 100)}% generic commit messages (init, update, fix, etc.)')
        score -= 15

    # No README
    if not has_readme:
        flags.append('No README file')
        score -= 10

    # Long inactivity
    if last_active_days > 365:
        flags.append(f'No commits for {last_active_days // 30} months')
        score -= 5

    score = max(score, 0)
    verdict = 'authentic' if score >= 70 else ('warning' if score >= 45 else 'suspicious')

    # Generate plain-text analysis
    if verdict == 'authentic':
        analysis = f'Organic commit history with {commit_count} commits across {age_days} days. No suspicious patterns detected.'
    elif verdict == 'warning':
        analysis = f'Some minor concerns detected. {len(flags)} flag(s) raised — manual review recommended.'
    else:
        analysis = f'High probability of copied or AI-generated code. {len(flags)} red flag(s) raised. Recommend manual review before listing on a resume.'

    return {
        'name':             repo.name,
        'url':              repo.html_url,
        'commits':          commit_count,
        'age_days':         age_days,
        'size_kb':          repo.size,
        'has_readme':       has_readme,
        'has_deployment':   has_deployment,
        'last_active_days': last_active_days,
        'languages':        [repo.language] if repo.language else [],
        'stars':            repo.stargazers_count,
        'forks':            repo.forks_count,
        'score':            score,
        'verdict':          verdict,
        'flags':            flags,
        'analysis':         analysis,
    }


@github_bp.get('/scan-repos/<username>')
@firebase_required
def scan_repos(username: str, firebase_uid, firebase_claims):
    """Scan all public repos of a user for fake-project signals."""
    try:
        g    = gh_client()
        user = g.get_user(username)
    except GithubException as e:
        return jsonify({'error': str(e)}), 502

    repos = sorted(
        [r for r in user.get_repos() if not r.private],
        key=lambda r: r.stargazers_count, reverse=True
    )[:8]

    results = []
    with ThreadPoolExecutor(max_workers=4) as ex:
        futures = {ex.submit(_score_repo, r): r for r in repos}
        for fut in as_completed(futures):
            try:
                results.append(fut.result())
            except Exception:
                pass

    results.sort(key=lambda x: x['score'])
    return jsonify({'username': username, 'repos': results})


@github_bp.get('/scan-repo/<owner>/<repo_name>')
@firebase_required
def scan_single_repo(owner: str, repo_name: str, firebase_uid, firebase_claims):
    """Scan a single specific repository."""
    try:
        g    = gh_client()
        repo = g.get_repo(f'{owner}/{repo_name}')
    except GithubException as e:
        return jsonify({'error': str(e)}), 404

    return jsonify(_score_repo(repo))


CONTRIBUTOR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']


@github_bp.get('/team/<owner>/<repo_name>')
@firebase_required
def team_analysis(owner: str, repo_name: str, firebase_uid, firebase_claims):
    """Real contributor breakdown for any public repo."""
    try:
        g    = gh_client()
        repo = g.get_repo(f'{owner}/{repo_name}')
    except GithubException as e:
        return jsonify({'error': str(e)}), 404

    # GitHub may need a moment to compute stats — retry up to 3 times
    stats = None
    for _ in range(3):
        stats = repo.get_stats_contributors()
        if stats:
            break
        time.sleep(1)

    if not stats:
        return jsonify({'error': 'GitHub is still computing contributor stats — try again in a moment'}), 202

    total_commits = sum(s.total for s in stats)
    top_stats     = sorted(stats, key=lambda s: s.total, reverse=True)[:6]

    contributors  = []
    week_map      = {}   # ISO date str → {handle: commit_count}

    for i, s in enumerate(top_stats):
        handle    = s.author.login
        additions = sum(w.a for w in s.weeks)
        deletions = sum(w.d for w in s.weeks)
        pct       = round(s.total / max(total_commits, 1) * 100)

        contributors.append({
            'name':      s.author.name or handle,
            'handle':    handle,
            'commits':   s.total,
            'pct':       pct,
            'additions': additions,
            'deletions': deletions,
            'avatar':    s.author.avatar_url,
            'color':     CONTRIBUTOR_COLORS[i % len(CONTRIBUTOR_COLORS)],
        })

        # Last 8 active weeks
        active_weeks = [w for w in s.weeks if w.c > 0][-8:]
        for w in active_weeks:
            dt    = w.w if hasattr(w.w, 'strftime') else datetime.fromtimestamp(w.w, tz=timezone.utc)
            label = dt.strftime('%m/%d')
            if label not in week_map:
                week_map[label] = {}
            week_map[label][handle] = w.c

    # Fix percentages to sum to 100
    if contributors:
        diff = 100 - sum(c['pct'] for c in contributors)
        contributors[0]['pct'] = max(0, contributors[0]['pct'] + diff)

    timeline = [{'week': w, **commits} for w, commits in sorted(week_map.items())[-8:]]
    handles  = [c['handle'] for c in contributors]

    return jsonify({
        'repo':          repo_name,
        'full_name':     repo.full_name,
        'description':   repo.description or '',
        'total_commits': total_commits,
        'contributors':  contributors,
        'timeline':      timeline,
        'handles':       handles,
    })


@github_bp.get('/activity/<username>')
@firebase_required
def user_activity(username: str, firebase_uid, firebase_claims):
    """
    Build real per-day commit heatmap by iterating the user's public repos
    and collecting author-filtered commits over the last 52 weeks.
    """
    try:
        g    = gh_client()
        user = g.get_user(username)
    except GithubException as e:
        return jsonify({'error': str(e)}), 502

    one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)

    repos = sorted(
        [r for r in user.get_repos() if not r.private],
        key=lambda r: r.stargazers_count + r.forks_count,
        reverse=True,
    )[:10]

    def _fetch_repo(repo):
        day_counts = {}
        try:
            for c in repo.get_commits(author=username, since=one_year_ago)[:150]:
                d = c.commit.author.date.strftime('%Y-%m-%d')
                day_counts[d] = day_counts.get(d, 0) + 1
        except Exception:
            pass
        return day_counts

    daily = {}
    with ThreadPoolExecutor(max_workers=5) as ex:
        for result in ex.map(_fetch_repo, repos):
            for day, count in result.items():
                daily[day] = daily.get(day, 0) + count

    # Build 52-week grid starting on the Monday 52 weeks ago
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(weeks=52)
    start = start - timedelta(days=start.weekday())

    MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    monthly = {m: 0 for m in MONTH_LABELS}
    weeks   = []

    for w in range(52):
        days = []
        for d in range(7):
            day = start + timedelta(weeks=w, days=d)
            count = daily.get(day.isoformat(), 0)
            days.append(count)
            monthly[MONTH_LABELS[day.month - 1]] += count
        weeks.append({'days': days, 'total': sum(days)})

    monthly_list = [{'month': m, 'commits': monthly[m]} for m in MONTH_LABELS]
    total = sum(monthly.values())

    return jsonify({
        'username':      username,
        'weeks':         weeks,
        'monthly':       monthly_list,
        'total':         total,
        'has_real_data': bool(daily),
        'repos_scanned': len(repos),
    })


# ── Achievements ────────────────────────────────────────────────────────────

def _tier(value, thresholds):
    """Return (tier_name, tier_index 0-3, next_threshold) given ascending thresholds list."""
    names = ['Bronze', 'Silver', 'Gold', 'Platinum']
    for i, t in enumerate(reversed(thresholds)):
        if value >= t:
            idx = len(thresholds) - 1 - i
            nxt = thresholds[idx + 1] if idx + 1 < len(thresholds) else None
            return names[idx], idx, nxt
    return None, -1, thresholds[0]


@github_bp.get('/achievements/<username>')
@firebase_required
def user_achievements(username: str, firebase_uid, firebase_claims):
    try:
        g    = gh_client()
        user = g.get_user(username)
    except GithubException as e:
        return jsonify({'error': str(e)}), 502

    pub_repos   = [r for r in user.get_repos() if not r.private]
    max_stars   = max((r.stargazers_count for r in pub_repos), default=0)
    total_stars = sum(r.stargazers_count for r in pub_repos)
    total_forks = sum(r.forks_count for r in pub_repos)
    lang_set    = {r.language for r in pub_repos if r.language}
    has_deploy  = any(r.homepage for r in pub_repos)
    account_days = (datetime.now(timezone.utc) - user.created_at).days

    # Merged PRs (GitHub search API)
    merged_prs = 0
    try:
        merged_prs = g.search_issues(f'type:pr is:merged author:{username}').totalCount
    except Exception:
        pass

    # Co-authored commits (commit search API)
    co_authored = 0
    try:
        co_authored = g.search_commits(f'author:{username} "Co-Authored-By"').totalCount
    except Exception:
        pass

    # Total commits in last year (from repo stats)
    one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)
    year_commits = 0
    def _count_commits(repo):
        try:
            return sum(1 for _ in repo.get_commits(author=username, since=one_year_ago)[:200])
        except Exception:
            return 0
    with ThreadPoolExecutor(max_workers=4) as ex:
        year_commits = sum(ex.map(_count_commits, pub_repos[:6]))

    achievements = []

    # ── Official GitHub Badges ──────────────────────────────────────────────

    # Starstruck — highest star count on a single repo
    star_tiers = [16, 128, 512, 4096]
    tier, tidx, nxt = _tier(max_stars, star_tiers)
    achievements.append({
        'id':       'starstruck',
        'title':    'Starstruck',
        'desc':     'Created a repository with many stars',
        'category': 'GitHub Badge',
        'earned':   tier is not None,
        'tier':     tier,
        'value':    max_stars,
        'next':     nxt,
        'progress': f'{max_stars} / {nxt or star_tiers[-1]} stars on a single repo',
        'emoji':    '⭐',
    })

    # Pull Shark — merged pull requests
    pr_tiers = [2, 16, 128, 1024]
    tier, tidx, nxt = _tier(merged_prs, pr_tiers)
    achievements.append({
        'id':       'pull_shark',
        'title':    'Pull Shark',
        'desc':     'Opened pull requests that have been merged',
        'category': 'GitHub Badge',
        'earned':   tier is not None,
        'tier':     tier,
        'value':    merged_prs,
        'next':     nxt,
        'progress': f'{merged_prs} / {nxt or pr_tiers[-1]} merged PRs',
        'emoji':    '🦈',
    })

    # Pair Extraordinaire — co-authored commits
    pair_tiers = [10, 24, 48, 100]
    tier, tidx, nxt = _tier(co_authored, pair_tiers)
    achievements.append({
        'id':       'pair_extraordinaire',
        'title':    'Pair Extraordinaire',
        'desc':     'Co-authored commits on merged pull requests',
        'category': 'GitHub Badge',
        'earned':   tier is not None,
        'tier':     tier,
        'value':    co_authored,
        'next':     nxt,
        'progress': f'{co_authored} / {nxt or pair_tiers[-1]} co-authored commits',
        'emoji':    '👥',
    })

    # YOLO — has merged PRs but zero review requests (approximation)
    achievements.append({
        'id':       'yolo',
        'title':    'YOLO',
        'desc':     'Merged a pull request without a review',
        'category': 'GitHub Badge',
        'earned':   merged_prs >= 1,
        'tier':     'Earned' if merged_prs >= 1 else None,
        'value':    merged_prs,
        'next':     1,
        'progress': f'Merge your first PR · {merged_prs} merged so far',
        'emoji':    '🤠',
    })

    # Quickdraw — closed issue/PR within 5 min (hard to detect; check via recent events)
    quickdraw = False
    try:
        for event in user.get_events()[:100]:
            if event.type in ('IssuesEvent', 'PullRequestEvent'):
                payload = event.payload
                if payload.get('action') == 'closed':
                    quickdraw = True
                    break
    except Exception:
        pass
    achievements.append({
        'id':       'quickdraw',
        'title':    'Quickdraw',
        'desc':     'Closed an issue or pull request within 5 minutes of opening',
        'category': 'GitHub Badge',
        'earned':   quickdraw,
        'tier':     'Earned' if quickdraw else None,
        'value':    1 if quickdraw else 0,
        'next':     1,
        'progress': 'Close an issue or PR within 5 minutes of opening',
        'emoji':    '⚡',
    })

    # ── Computed Developer Achievements ────────────────────────────────────

    # Prolific Developer — year commits
    commit_tiers = [10, 100, 500, 1000]
    tier, tidx, nxt = _tier(year_commits, commit_tiers)
    achievements.append({
        'id':       'prolific',
        'title':    'Prolific Developer',
        'desc':     'Commits made in the last 12 months',
        'category': 'Activity',
        'earned':   tier is not None,
        'tier':     tier,
        'value':    year_commits,
        'next':     nxt,
        'progress': f'{year_commits} / {nxt or commit_tiers[-1]} commits this year',
        'emoji':    '🔥',
    })

    # Star Collector — total stars across all repos
    total_star_tiers = [5, 25, 100, 500]
    tier, tidx, nxt = _tier(total_stars, total_star_tiers)
    achievements.append({
        'id':       'star_collector',
        'title':    'Star Collector',
        'desc':     'Total stars earned across all repositories',
        'category': 'Popularity',
        'earned':   tier is not None,
        'tier':     tier,
        'value':    total_stars,
        'next':     nxt,
        'progress': f'{total_stars} / {nxt or total_star_tiers[-1]} total stars',
        'emoji':    '🌟',
    })

    # Polyglot — unique languages
    lang_tiers = [2, 4, 6, 10]
    lang_count  = len(lang_set)
    tier, tidx, nxt = _tier(lang_count, lang_tiers)
    achievements.append({
        'id':       'polyglot',
        'title':    'Polyglot',
        'desc':     'Codes in multiple programming languages',
        'category': 'Skills',
        'earned':   tier is not None,
        'tier':     tier,
        'value':    lang_count,
        'next':     nxt,
        'progress': f'{lang_count} / {nxt or lang_tiers[-1]} languages used',
        'emoji':    '🌐',
    })

    # Veteran — account age
    age_months = account_days // 30
    age_tiers  = [6, 12, 36, 60]   # months
    tier, tidx, nxt = _tier(age_months, age_tiers)
    achievements.append({
        'id':       'veteran',
        'title':    'Veteran',
        'desc':     'GitHub account standing',
        'category': 'Seniority',
        'earned':   tier is not None,
        'tier':     tier,
        'value':    age_months,
        'next':     nxt,
        'progress': f'{age_months} / {nxt or age_tiers[-1]} months on GitHub',
        'emoji':    '🎖️',
    })

    # Open Sourcerer — public repos
    repo_tiers = [1, 5, 10, 20]
    repo_count  = len(pub_repos)
    tier, tidx, nxt = _tier(repo_count, repo_tiers)
    achievements.append({
        'id':       'open_sourcerer',
        'title':    'Open Sourcerer',
        'desc':     'Created public repositories on GitHub',
        'category': 'Contribution',
        'earned':   tier is not None,
        'tier':     tier,
        'value':    repo_count,
        'next':     nxt,
        'progress': f'{repo_count} / {nxt or repo_tiers[-1]} public repos',
        'emoji':    '🪄',
    })

    # Deployer — has live projects
    achievements.append({
        'id':       'deployer',
        'title':    'Deployer',
        'desc':     'Has at least one live deployment linked from GitHub',
        'category': 'Activity',
        'earned':   has_deploy,
        'tier':     'Earned' if has_deploy else None,
        'value':    1 if has_deploy else 0,
        'next':     1,
        'progress': 'Add a homepage URL to any public repository',
        'emoji':    '🚀',
    })

    # Forked — others forked your work
    fork_tiers = [1, 5, 20, 100]
    tier, tidx, nxt = _tier(total_forks, fork_tiers)
    achievements.append({
        'id':       'forked',
        'title':    'Forked',
        'desc':     'Others have forked your repositories',
        'category': 'Popularity',
        'earned':   tier is not None,
        'tier':     tier,
        'value':    total_forks,
        'next':     nxt,
        'progress': f'{total_forks} / {nxt or fork_tiers[-1]} total forks',
        'emoji':    '🍴',
    })

    earned_count = sum(1 for a in achievements if a['earned'])
    return jsonify({
        'username':     username,
        'achievements': achievements,
        'earned':       earned_count,
        'total':        len(achievements),
    })
