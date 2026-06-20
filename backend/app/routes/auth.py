from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from ..db import get_db
from ..firebase_admin_init import firebase_required, verify_firebase_token

auth_bp = Blueprint('auth', __name__)

DEMO_DEVELOPER = {
    'uid':            'demo-dev-001',
    'name':           'Varun Tuteja',
    'email':          'demo@crediq.dev',
    'role':           'developer',
    'avatar':         'V',
    'github_username': 'varun-dev',
    'bio':            'Full Stack Developer | Open Source Enthusiast',
    'location':       'Bangalore, IN',
    'trust_score':    87,
    'github_score':   92,
    'verified_skills': ['Python', 'React', 'Flask', 'MongoDB', 'TypeScript'],
}

DEMO_RECRUITER = {
    'uid':      'demo-rec-001',
    'name':     'Anjali Mehta',
    'email':    'recruiter@techcorp.com',
    'role':     'recruiter',
    'avatar':   'A',
    'company':  'TechCorp India',
    'title':    'Senior Technical Recruiter',
    'location': 'Mumbai, IN',
}


def _upsert_user(db, uid: str, data: dict) -> dict:
    """Create or update user by Firebase UID. Returns the full profile."""
    existing = db.users.find_one({'uid': uid})
    if existing:
        # Only update fields that are explicitly provided
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
    """
    Called by the frontend after every Firebase sign-in.
    Verifies the Firebase ID token, then creates/updates the MongoDB user record.
    Returns the full user profile.
    """
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
    Issue a short-lived JWT for demo accounts (no Firebase required).
    Only works when FLASK_ENV=development.
    """
    import os
    if os.getenv('FLASK_ENV') != 'development':
        return jsonify({'message': 'Demo mode only available in development'}), 403

    data = request.get_json(silent=True) or {}
    role = data.get('role', 'developer')
    profile = DEMO_RECRUITER if role == 'recruiter' else DEMO_DEVELOPER
    token = create_access_token(identity=profile['uid'], additional_claims={'demo': True, 'role': role})
    return jsonify({'user': profile, 'token': token})
