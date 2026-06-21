import io
import re
import base64
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask import Blueprint, request, jsonify
from ..firebase_admin_init import firebase_required
from ..services.github_service import analyze_profile, _client as gh_client
from ..services.gemini_service import _generate, _parse_json

resume_bp = Blueprint('resume', __name__)


def _extract_pdf_text(file_obj) -> str:
    import PyPDF2
    reader = PyPDF2.PdfReader(io.BytesIO(file_obj.read()))
    return '\n'.join(page.extract_text() or '' for page in reader.pages)


def _extract_claims(resume_text: str) -> dict:
    prompt = f"""Extract all technical skills, tools, frameworks, and technologies from this resume.
Also extract any experience-duration claims (e.g. "5 years Python", "2+ years React").

RESUME (first 3000 chars):
{resume_text[:3000]}

Return ONLY raw JSON, no markdown:
{{
  "skills": ["Python", "React", "AWS"],
  "experience_claims": [
    {{"claim": "5 years of Python", "skill": "Python", "years": 5}}
  ]
}}
skills: individual technologies/tools only, not phrases like "problem solving".
experience_claims: only where a specific number of years is stated."""
    try:
        return _parse_json(_generate(prompt))
    except Exception:
        return {'skills': [], 'experience_claims': []}


def _fetch_readmes(github_data: dict) -> dict:
    """Fetch README text for each top repo. Returns {repo_name: readme_text}."""
    username = github_data.get('username', '')
    g = gh_client()

    def _get(repo_name):
        try:
            r = g.get_repo(f'{username}/{repo_name}')
            readme = r.get_readme()
            text = base64.b64decode(readme.content).decode('utf-8', errors='ignore')
            return repo_name, text[:5000]
        except Exception:
            return repo_name, ''

    readmes = {}
    repos = [r['name'] for r in github_data.get('top_repos', [])[:6]]
    with ThreadPoolExecutor(max_workers=4) as ex:
        for name, text in ex.map(_get, repos):
            if text:
                readmes[name] = text
    return readmes


def _build_corpus(github_data: dict, readmes: dict = None) -> set:
    corpus = set()
    for lang in github_data.get('languages', []):
        corpus.add(lang['name'].lower())
    for repo in github_data.get('top_repos', []):
        corpus.add(repo['name'].lower())
        corpus.add((repo.get('lang') or '').lower())
        for word in (repo.get('desc') or '').lower().split():
            corpus.add(word)
    if readmes:
        for text in readmes.values():
            # pull out all tech-looking tokens (letters+digits+.+#)
            for tok in re.findall(r'\b[a-zA-Z][a-zA-Z0-9.+#\-]{1,}\b', text.lower()):
                corpus.add(tok)
    return corpus


# Common aliases so "Node.js" matches "node", "js", etc.
ALIASES = {
    'node.js': ['node', 'nodejs', 'express'],
    'react':   ['react', 'reactjs', 'react.js'],
    'vue':     ['vue', 'vuejs'],
    'c++':     ['cpp', 'c++'],
    'ts':      ['typescript'],
    'js':      ['javascript'],
    'ml':      ['machine learning', 'sklearn', 'scikit'],
    'ai':      ['artificial intelligence'],
    'rest':    ['api', 'rest', 'fastapi', 'flask', 'express'],
    'sql':     ['mysql', 'postgres', 'postgresql', 'sqlite'],
    'nosql':   ['mongodb', 'mongo', 'redis', 'dynamodb'],
    'aws':     ['aws', 'amazon', 's3', 'ec2', 'lambda'],
    'gcp':     ['gcp', 'google cloud'],
    'azure':   ['azure', 'microsoft azure'],
    'docker':  ['docker', 'dockerfile', 'container'],
    'k8s':     ['kubernetes', 'k8s', 'helm'],
    'ci/cd':   ['github actions', 'jenkins', 'circleci', 'pipeline', 'workflow'],
    'git':     ['git', 'github', 'gitlab', 'version control'],
}


def _tokens(skill: str) -> list[str]:
    base = re.split(r'[\s/\-_.]+', skill.lower())
    extras = []
    for k, v in ALIASES.items():
        if any(t in v or t == k for t in base):
            extras += v + [k]
    return list(set(base + extras))


def _check_skill(skill: str, github_data: dict, corpus: set, readmes: dict = None) -> dict:
    tokens = _tokens(skill)

    lang_matches = [
        l for l in github_data.get('languages', [])
        if any(t in l['name'].lower() for t in tokens)
    ]
    repo_matches = [
        r for r in github_data.get('top_repos', [])
        if any(
            t in r['name'].lower()
            or t in (r.get('desc') or '').lower()
            or t in (r.get('lang') or '').lower()
            for t in tokens
        )
    ]
    readme_hits = []
    if readmes:
        for repo_name, text in readmes.items():
            tl = text.lower()
            if any(t in tl for t in tokens if len(t) > 2):
                readme_hits.append(repo_name)

    corpus_hit = any(t in corpus for t in tokens if len(t) > 2)

    if lang_matches or repo_matches or readme_hits or corpus_hit:
        parts = []
        if lang_matches:
            top = lang_matches[0]
            parts.append(f"{top['pct']}% of codebase ({top['name']})")
        if repo_matches:
            names = ', '.join(r['name'] for r in repo_matches[:2])
            parts.append(f"{len(repo_matches)} repo(s): {names}")
        if readme_hits:
            parts.append(f"README of {', '.join(readme_hits[:2])}")

        confidence = 60
        if lang_matches:
            confidence = max(confidence, 80 + min(lang_matches[0].get('pct', 0) // 5, 15))
        if repo_matches:
            confidence = min(confidence + len(repo_matches) * 5, 99)
        if readme_hits and not lang_matches and not repo_matches:
            confidence = max(confidence, 65)

        return {
            'verified':   True,
            'evidence':   ', '.join(parts) or 'Found in GitHub activity',
            'confidence': confidence,
        }

    return {
        'verified': False,
        'reason':   f'No evidence of {skill} found in languages, repos, READMEs, or descriptions',
    }


def _find_missing(github_data: dict, resume_skills: list, readmes: dict = None) -> list:
    """Return GitHub technologies that are NOT mentioned in the resume."""
    resume_tokens = set()
    for skill in resume_skills:
        resume_tokens.update(_tokens(skill))

    missing = []

    # 1. GitHub languages not in resume — only include if meaningful (≥5% of codebase
    #    OR primary language of at least one repo)
    primary_langs = {(r.get('lang') or '').lower() for r in github_data.get('top_repos', [])}

    for lang in github_data.get('languages', []):
        name = lang['name']
        if name.lower() in ('unknown', 'other', ''):
            continue
        is_primary = name.lower() in primary_langs
        if lang['pct'] < 5 and not is_primary:
            continue          # skip incidental languages (build files, config, etc.)
        if not any(t in resume_tokens for t in _tokens(name)):
            # Build evidence
            repos = [r for r in github_data.get('top_repos', [])
                     if (r.get('lang') or '').lower() == name.lower()]
            evidence = f"{lang['pct']}% of codebase"
            if repos:
                evidence += f", {len(repos)} repo(s): {', '.join(r['name'] for r in repos[:2])}"
            missing.append({
                'skill':    name,
                'evidence': evidence,
                'pct':      lang['pct'],
                'source':   'language',
            })

    # 2. Common tech keywords in repo descriptions AND READMEs not in resume
    TECH_KEYWORDS = [
        'docker', 'kubernetes', 'k8s', 'redis', 'postgresql', 'mysql', 'sqlite',
        'mongodb', 'graphql', 'grpc', 'fastapi', 'django', 'flask', 'express',
        'next.js', 'nextjs', 'tailwind', 'prisma', 'supabase', 'firebase',
        'aws', 'gcp', 'azure', 'terraform', 'ansible', 'nginx', 'celery',
        'tensorflow', 'pytorch', 'scikit', 'pandas', 'numpy', 'langchain',
        'openai', 'huggingface', 'websocket', 'oauth', 'jwt',
        'stripe', 'twilio', 'elasticsearch', 'kafka', 'rabbitmq',
    ]
    found_in_repos = {}
    for repo in github_data.get('top_repos', []):
        desc_text = f"{repo['name']} {repo.get('desc', '')}".lower()
        readme_text = (readmes or {}).get(repo['name'], '').lower()
        combined = desc_text + ' ' + readme_text
        for kw in TECH_KEYWORDS:
            if kw in combined:
                source = 'README' if kw in readme_text and kw not in desc_text else 'desc'
                found_in_repos.setdefault(kw, []).append((repo['name'], source))

    for kw, hits in found_in_repos.items():
        if not any(t in resume_tokens for t in _tokens(kw)):
            if any(m['skill'].lower() == kw for m in missing):
                continue
            readme_repos = [r for r, s in hits if s == 'README']
            desc_repos   = [r for r, s in hits if s == 'desc']
            parts = []
            if readme_repos:
                parts.append(f"README of {', '.join(readme_repos[:2])}")
            if desc_repos:
                parts.append(f"description of {', '.join(desc_repos[:2])}")
            missing.append({
                'skill':    kw.title().replace('.Js', '.js'),
                'evidence': ', '.join(parts) or f"Found in {len(hits)} repo(s)",
                'pct':      0,
                'source':   'readme' if readme_repos else 'repo',
            })

    # Sort: languages (with pct) first, then repo keywords
    missing.sort(key=lambda x: (-x['pct'], x['source']))
    return missing[:12]


def _check_experience_claims(claims: list, github_data: dict) -> list:
    flagged = []
    account_years = round(github_data.get('account_age_days', 0) / 365, 1)
    for c in claims:
        years = c.get('years', 0)
        if years and account_years and years > account_years + 1:
            flagged.append({
                'claim':  c['claim'],
                'reason': f'GitHub account is only {account_years}y old — claimed {years}y of experience is unlikely',
            })
    return flagged


@resume_bp.post('/verify')
@firebase_required
def verify_resume(firebase_uid, firebase_claims):
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    github_username = request.form.get('github_username', '').strip()
    if not github_username:
        return jsonify({'error': 'github_username is required'}), 400

    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are accepted'}), 400

    # 1. Extract PDF text
    try:
        resume_text = _extract_pdf_text(file)
    except Exception as e:
        return jsonify({'error': f'Could not read PDF: {e}'}), 422

    if len(resume_text.strip()) < 50:
        return jsonify({'error': 'PDF appears to be empty or image-only (no extractable text)'}), 422

    # 2. Extract claims via Groq
    claims = _extract_claims(resume_text)
    skills            = claims.get('skills', [])
    experience_claims = claims.get('experience_claims', [])

    if not skills:
        return jsonify({'error': 'No technical skills could be extracted from the resume'}), 422

    # 3. Fetch GitHub data
    github_data = analyze_profile(github_username)
    if 'error' in github_data:
        return jsonify({'error': f'GitHub lookup failed: {github_data["error"]}'}), 502
    github_data.pop('_raw_repos', None)

    # 3b. Fetch READMEs for deeper evidence
    readmes = _fetch_readmes(github_data)

    corpus = _build_corpus(github_data, readmes)

    # 4. Cross-reference each skill
    verified   = []
    unverified = []

    for skill in skills:
        check = _check_skill(skill, github_data, corpus, readmes)
        if check['verified']:
            verified.append({
                'skill':      skill,
                'evidence':   check['evidence'],
                'confidence': check['confidence'],
            })
        else:
            unverified.append({
                'skill':  skill,
                'reason': check['reason'],
            })

    # 5. CP / DSA bonus — if resume mentions competitive programming, LeetCode, etc.
    #    boost or rescue C++, C, Java, Python, Python3 skills
    CP_SIGNALS = [
        'leetcode', 'leet code', 'codeforces', 'codechef', 'hackerrank',
        'hackerearth', 'atcoder', 'topcoder', 'spoj', 'geeksforgeeks',
        'competitive programming', 'competitive coding',
        'dsa', 'data structures and algorithms', 'data structures & algorithms',
        'algorithm', 'problem solving', 'cp rating', 'cp profile',
    ]
    CP_LANGS = {'c++', 'cpp', 'c', 'java', 'python', 'python3'}

    resume_lower = resume_text.lower()
    cp_hits = [sig for sig in CP_SIGNALS if sig in resume_lower]
    cp_bonus = bool(cp_hits)
    cp_note  = cp_hits[0].title() if cp_hits else ''

    if cp_bonus:
        # Boost already-verified CP languages
        for v in verified:
            if any(t in CP_LANGS for t in _tokens(v['skill'])):
                v['confidence'] = min(99, v['confidence'] + 12)
                v['evidence'] += f' · {cp_note} mentioned in resume (+bonus)'
                v['cp_bonus'] = True

        # Rescue unverified CP languages — move them to verified
        still_unverified = []
        for u in unverified:
            if any(t in CP_LANGS for t in _tokens(u['skill'])):
                verified.append({
                    'skill':      u['skill'],
                    'evidence':   f'{cp_note} mentioned in resume — commonly used for competitive programming',
                    'confidence': 70,
                    'cp_bonus':   True,
                })
            else:
                still_unverified.append(u)
        unverified = still_unverified

    # 6. Flag contradictory experience claims
    flagged = _check_experience_claims(experience_claims, github_data)

    # 6. Skills in GitHub but not in resume
    missing_from_resume = _find_missing(github_data, skills, readmes)

    # 7. Compute trust score
    total = len(skills)
    v_pct = round(len(verified) / max(total, 1) * 100)
    flag_penalty = len(flagged) * 8
    trust_score  = max(0, min(100, round(
        v_pct * 0.7
        + min(github_data.get('commit_count', 0) / 10, 20)
        + (5 if github_data.get('total_stars', 0) > 10 else 0)
        - flag_penalty
    )))

    breakdown = {
        'skills': {
            'verified': len(verified),
            'total':    total,
            'pct':      v_pct,
        },
        'experience': {
            'verified': max(0, len(experience_claims) - len(flagged)),
            'total':    max(len(experience_claims), 1),
            'pct':      round(max(0, len(experience_claims) - len(flagged)) / max(len(experience_claims), 1) * 100),
        },
    }

    return jsonify({
        'github_username': github_username,
        'trust_score':     trust_score,
        'cp_detected':     cp_bonus,
        'cp_signal':       cp_note,
        'verified':        sorted(verified,   key=lambda x: x['confidence'], reverse=True),
        'unverified':      unverified,
        'flagged':            flagged,
        'missing_from_resume': missing_from_resume,
        'breakdown':       breakdown,
        'account_age_years': round(github_data.get('account_age_days', 0) / 365, 1),
        'total_commits':     github_data.get('commit_count', 0),
        'public_repos':      github_data.get('public_repos', 0),
    })
