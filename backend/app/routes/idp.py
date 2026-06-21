from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import hashlib

idp_bp = Blueprint('idp', __name__)

# Sample recruiter accounts — password hashed with sha256 for demo simplicity
# All sample accounts use password: Recruit@123
def _hash(pwd: str) -> str:
    return hashlib.sha256(pwd.encode()).hexdigest()

SAMPLE_PASSWORD_HASH = _hash('Recruit@123')

SAMPLE_RECRUITERS = {
    'sarah@techcorp.com': {
        'uid':     'idp-sarah-techcorp',
        'name':    'Sarah Johnson',
        'email':   'sarah@techcorp.com',
        'company': 'TechCorp Inc.',
        'title':   'Senior Technical Recruiter',
        'avatar':  'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        'role':    'recruiter',
    },
    'raj@hirevision.io': {
        'uid':     'idp-raj-hirevision',
        'name':    'Raj Patel',
        'email':   'raj@hirevision.io',
        'company': 'HireVision',
        'title':   'Head of Engineering Recruitment',
        'avatar':  'https://api.dicebear.com/7.x/avataaars/svg?seed=raj',
        'role':    'recruiter',
    },
    'priya@recruitpro.co': {
        'uid':     'idp-priya-recruitpro',
        'name':    'Priya Nair',
        'email':   'priya@recruitpro.co',
        'company': 'RecruitPro',
        'title':   'Tech Talent Acquisition Lead',
        'avatar':  'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
        'role':    'recruiter',
    },
    'demo@crediq.dev': {
        'uid':     'idp-demo-crediq',
        'name':    'Demo Recruiter',
        'email':   'demo@crediq.dev',
        'company': 'CredIQ Demo',
        'title':   'Recruiter',
        'avatar':  'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        'role':    'recruiter',
    },
}


@idp_bp.post('/login')
def idp_login():
    data     = request.get_json(silent=True) or {}
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    recruiter = SAMPLE_RECRUITERS.get(email)
    if not recruiter or _hash(password) != SAMPLE_PASSWORD_HASH:
        return jsonify({'message': 'Invalid credentials'}), 401

    token = create_access_token(
        identity=recruiter['uid'],
        additional_claims={'role': 'recruiter', 'company': recruiter['company']}
    )
    return jsonify({'user': recruiter, 'token': token})


@idp_bp.get('/accounts')
def idp_accounts():
    """Return sample account list for the login hint UI (emails only)."""
    return jsonify([
        {'email': email, 'name': r['name'], 'company': r['company']}
        for email, r in SAMPLE_RECRUITERS.items()
    ])
