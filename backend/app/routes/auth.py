from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from ..db import get_db
from ..models.user import create_user, find_user_by_email, find_user_by_id, check_password

auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/register')
def register():
    data = request.get_json(silent=True) or {}
    name     = (data.get('name') or '').strip()
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password', '')
    role     = data.get('role', 'developer')

    if not name or not email or not password:
        return jsonify({'message': 'name, email and password are required'}), 400
    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters'}), 400
    if role not in ('developer', 'recruiter'):
        return jsonify({'message': 'role must be developer or recruiter'}), 400

    try:
        db   = get_db()
        user = create_user(db, name, email, password, role)
    except ValueError as e:
        return jsonify({'message': str(e)}), 409

    access_token  = create_access_token(identity=user['id'])
    refresh_token = create_refresh_token(identity=user['id'])
    return jsonify({'user': user, 'token': access_token, 'refresh_token': refresh_token}), 201


@auth_bp.post('/login')
def login():
    data     = request.get_json(silent=True) or {}
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'message': 'email and password are required'}), 400

    db  = get_db()
    raw = db.users.find_one({'email': email})
    if not raw or not check_password(password, raw.get('password_hash', '')):
        return jsonify({'message': 'Invalid email or password'}), 401

    from ..models.user import _serialize
    user = _serialize(raw)

    access_token  = create_access_token(identity=user['id'])
    refresh_token = create_refresh_token(identity=user['id'])
    return jsonify({'user': user, 'token': access_token, 'refresh_token': refresh_token})


@auth_bp.post('/refresh')
@jwt_required(refresh=True)
def refresh():
    identity     = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({'token': access_token})


@auth_bp.get('/me')
@jwt_required()
def me():
    user_id = get_jwt_identity()
    db      = get_db()
    user    = find_user_by_id(db, user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'user': user})


@auth_bp.patch('/me')
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    allowed = {'name', 'bio', 'location', 'company', 'title', 'github_username'}
    updates = {k: v for k, v in data.items() if k in allowed}

    from ..models.user import update_user
    db   = get_db()
    user = update_user(db, user_id, updates)
    return jsonify({'user': user})
