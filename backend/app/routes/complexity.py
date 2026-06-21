import re
import math
import base64
from pathlib import Path
from flask import Blueprint, jsonify
from github import GithubException
from ..firebase_admin_init import firebase_required
from ..services.github_service import _client as gh_client

complexity_bp = Blueprint('complexity', __name__)

SOURCE_EXTS = {
    '.py':  'Python',
    '.ts':  'TypeScript', '.tsx': 'TypeScript',
    '.js':  'JavaScript', '.jsx': 'JavaScript',
    '.go':  'Go',
    '.java':'Java',
    '.rb':  'Ruby',
    '.rs':  'Rust',
    '.cpp': 'C++', '.cc': 'C++',
    '.c':   'C',
}
SKIP_DIRS  = {'node_modules', '.git', 'dist', 'build', '__pycache__', 'venv', '.venv', 'vendor', '.next', 'coverage'}
MAX_FILES  = 25
MAX_BYTES  = 80_000


def _lang(path: str):
    return SOURCE_EXTS.get(Path(path).suffix.lower())


def _cyclomatic(code: str) -> int:
    patterns = [r'\bif\b', r'\belif\b', r'\belse\s+if\b', r'\bfor\b',
                r'\bwhile\b', r'\bswitch\b', r'\bcase\b', r'\bcatch\b',
                r'\?\s*[^:]', r'&&', r'\|\|']
    return 1 + sum(len(re.findall(p, code)) for p in patterns)


def _mi(loc: int, cc: int) -> int:
    try:
        hv = loc * 4.5
        mi = 171 - 5.2 * math.log(max(hv, 1)) - 0.23 * cc - 16.2 * math.log(max(loc, 1))
        return max(0, min(100, round(mi)))
    except Exception:
        return 50


def _cognitive(code: str) -> int:
    depth, score = 0, 0
    nesting = re.compile(r'\b(if|else|elif|for|while|try|catch|switch|with)\b')
    for line in code.split('\n'):
        s = line.lstrip()
        if nesting.search(s):
            score += 1 + depth
            depth += 1
        elif s in ('', '}', 'end', 'end;'):
            depth = max(0, depth - 1)
    return score


def _duplication(code: str) -> int:
    lines = [l.strip() for l in code.split('\n') if l.strip() and not l.strip().startswith(('#', '//', '*'))]
    if len(lines) < 6:
        return 0
    seen, dups = set(), 0
    for i in range(len(lines) - 2):
        w = '\n'.join(lines[i:i+3])
        if w in seen:
            dups += 3
        seen.add(w)
    return round(min(dups / max(len(lines), 1) * 100, 40))


def _analyze(code: str, lang: str) -> dict:
    loc = len([l for l in code.split('\n') if l.strip()])
    if lang == 'Python':
        try:
            from radon.complexity import cc_visit
            from radon.metrics import mi_visit
            blocks = cc_visit(code)
            cc = max((b.complexity for b in blocks), default=1)
            mi = max(0, min(100, round(mi_visit(code, multi=True))))
        except Exception:
            cc = _cyclomatic(code)
            mi = _mi(loc, cc)
    else:
        cc = _cyclomatic(code)
        mi = _mi(loc, cc)

    return {
        'loc':             loc,
        'complexity':      cc,
        'maintainability': mi,
        'cognitive':       _cognitive(code),
        'duplication':     _duplication(code),
    }


def _risk(cc: int, mi: int) -> str:
    if cc > 20 or mi < 60:
        return 'high'
    if cc > 10 or mi < 75:
        return 'medium'
    return 'low'


@complexity_bp.get('/<owner>/<repo_name>')
@firebase_required
def code_complexity(owner: str, repo_name: str, firebase_uid, firebase_claims):
    try:
        g    = gh_client()
        repo = g.get_repo(f'{owner}/{repo_name}')
    except GithubException as e:
        return jsonify({'error': str(e)}), 404

    try:
        sha  = repo.get_branch(repo.default_branch).commit.sha
        tree = repo.get_git_tree(sha, recursive=True).tree
    except Exception as e:
        return jsonify({'error': f'Could not read file tree: {e}'}), 502

    candidates = []
    for item in tree:
        if item.type != 'blob':
            continue
        parts = item.path.split('/')
        if any(p in SKIP_DIRS for p in parts):
            continue
        lang = _lang(item.path)
        if not lang:
            continue
        if item.size and item.size > MAX_BYTES:
            continue
        candidates.append((item.path, lang, item.size or 0))

    candidates.sort(key=lambda x: x[2], reverse=True)
    candidates = candidates[:MAX_FILES]

    files     = []
    lang_map  = {}

    for path, lang, _ in candidates:
        try:
            obj  = repo.get_contents(path)
            code = base64.b64decode(obj.content).decode('utf-8', errors='ignore')
        except Exception:
            continue

        m    = _analyze(code, lang)
        risk = _risk(m['complexity'], m['maintainability'])

        files.append({
            'path':            path,
            'lang':            lang,
            'loc':             m['loc'],
            'complexity':      m['complexity'],
            'maintainability': m['maintainability'],
            'cognitive':       m['cognitive'],
            'duplication':     m['duplication'],
            'risk':            risk,
        })
        lang_map.setdefault(lang, []).append(m['complexity'])

    if not files:
        return jsonify({'error': 'No analyzable source files found in this repository'}), 404

    avg_mi   = round(sum(f['maintainability'] for f in files) / len(files))
    avg_cc   = round(sum(f['complexity']      for f in files) / len(files), 1)
    avg_dup  = sum(f['duplication']           for f in files) / len(files)
    high_cnt = sum(1 for f in files if f['risk'] == 'high')

    radar = [
        {'dim': 'Readability',     'v': min(100, max(0, round(100 - avg_cc * 2.5)))},
        {'dim': 'Maintainability', 'v': avg_mi},
        {'dim': 'Complexity',      'v': min(100, max(0, round(100 - avg_cc * 3)))},
        {'dim': 'Duplication',     'v': max(0, round(100 - avg_dup * 2.5))},
        {'dim': 'Consistency',     'v': min(100, max(0, round(90 - high_cnt * 6)))},
        {'dim': 'Documentation',   'v': 50},
    ]

    by_lang = [
        {'lang': lang, 'avg': round(sum(v) / len(v), 1), 'files': len(v)}
        for lang, v in lang_map.items()
    ]

    return jsonify({
        'repo':      repo_name,
        'full_name': repo.full_name,
        'files':     files,
        'summary': {
            'overall_maintainability': avg_mi,
            'files_analyzed':          len(files),
            'high_risk_files':         high_cnt,
            'avg_complexity':          avg_cc,
        },
        'radar':    radar,
        'by_lang':  by_lang,
    })
