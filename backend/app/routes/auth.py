from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from ..db import get_db
from ..firebase_admin_init import firebase_required, verify_firebase_token
from ..services.github_service import analyze_profile
from ..services.trust_engine import compute_trust_score
from ..services.builder_score import compute_builder_score

auth_bp = Blueprint('auth', __name__)


def _upsert_user(db, uid: str, data: dict) -> dict:
    existing = db.users.find_one({'uid': uid})
    if existing:
        updates = {k: v for k, v in data.items() if v is not None and k not in ('uid', 'role')}
        if updates:
            db.users.update_one({'uid': uid}, {'$set': updates})
        doc = db.users.find_one({'uid': uid})
    else:
        doc = {'uid': uid, **data}
        db.users.insert_one(doc)
    doc.pop('_id', None)
    return doc


@auth_bp.post('/sync')
def sync():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing Authorization header'}), 401
    token = auth_header.split(' ', 1)[1]
    try:
        claims = verify_firebase_token(token)
    except Exception as e:
        return jsonify({'message': f'Invalid Firebase token: {e}'}), 401

    data = request.get_json(silent=True) or {}
    uid  = claims['uid']
    db   = get_db()

    user_data = {
        'uid':                 uid,
        'email':               claims.get('email') or data.get('email'),
        'name':                data.get('name') or claims.get('name'),
        'avatar':              data.get('avatar') or claims.get('picture'),
        'role':                data.get('role', 'developer'),
        'github_username':     data.get('github_username'),
        'github_access_token': data.get('github_access_token'),
        'bio':                 data.get('bio'),
        'location':            data.get('location'),
        'company':             data.get('company'),
        'title':               data.get('title'),
        'trust_score':         None,
        'github_score':        None,
        'verified_skills':     [],
    }
    profile = _upsert_user(db, uid, user_data)
    return jsonify({'user': profile})


@auth_bp.get('/me')
@firebase_required
def me(firebase_uid, firebase_claims):
    db   = get_db()
    user = db.users.find_one({'uid': firebase_uid})
    if not user:
        return jsonify({'message': 'User not found — call /sync first'}), 404
    user.pop('_id', None)
    return jsonify({'user': user})


@auth_bp.patch('/me')
@firebase_required
def update_me(firebase_uid, firebase_claims):
    data    = request.get_json(silent=True) or {}
    allowed = {'name', 'bio', 'location', 'company', 'title', 'github_username', 'role'}
    updates = {k: v for k, v in data.items() if k in allowed}
    db      = get_db()
    db.users.update_one({'uid': firebase_uid}, {'$set': updates})
    user = db.users.find_one({'uid': firebase_uid})
    user.pop('_id', None)
    return jsonify({'user': user})


@auth_bp.post('/demo')
def demo():
    """
    Demo login — takes a GitHub username, fetches real data, returns a full profile + JWT.
    No Firebase required.
    """
    data             = request.get_json(silent=True) or {}
    raw_input        = data.get('github_username', '').strip()
    role             = data.get('role', 'developer')

    # Accept full URL or bare username
    github_username = raw_input.rstrip('/').split('/')[-1] if raw_input else ''
    if not github_username:
        return jsonify({'message': 'github_username is required'}), 400

    # Fetch real GitHub profile
    github_data = analyze_profile(github_username)
    if 'error' in github_data:
        return jsonify({'message': f'GitHub user not found: {github_data["error"]}'}), 404

    # Compute real scores
    trust   = compute_trust_score(github_username)
    builder = compute_builder_score(github_username)

    top_skills = [l['name'] for l in github_data.get('languages', [])[:5]]

    profile = {
        'uid':              f'demo-{github_username}',
        'name':             github_data.get('name') or github_username,
        'email':            f'{github_username}@demo.crediq.dev',
        'role':             role,
        'avatar':           github_data.get('avatar'),
        'github_username':  github_username,
        'bio':              github_data.get('bio') or '',
        'location':         github_data.get('location') or '',
        'trust_score':      trust.get('total'),
        'builder_score':    builder.get('total'),
        'github_score':     min(round(github_data.get('total_stars', 0) / 10 + github_data.get('followers', 0) / 5), 100),
        'verified_skills':  top_skills,
        'public_repos':     github_data.get('public_repos', 0),
        'total_stars':      github_data.get('total_stars', 0),
        'followers':        github_data.get('followers', 0),
        'commit_count':     github_data.get('commit_count', 0),
        'languages':        github_data.get('languages', []),
        'top_repos':        github_data.get('top_repos', []),
        'trust_breakdown':  trust.get('dimensions', {}),
        'builder_breakdown': builder.get('dimensions', {}),
        'is_demo':          True,
    }

    token = create_access_token(
        identity=profile['uid'],
        additional_claims={'demo': True, 'role': role}
    )
    return jsonify({'user': profile, 'token': token})
