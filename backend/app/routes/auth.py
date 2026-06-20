from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.post('/register')
def register():
    """Register a new developer or recruiter account."""
    data = request.get_json()
    # TODO: validate, hash password, store in MongoDB
    return jsonify({'message': 'Registration endpoint — connect MongoDB to activate'}), 501

@auth_bp.post('/login')
def login():
    """Login and return a JWT token."""
    data = request.get_json()
    # TODO: validate credentials, issue JWT
    return jsonify({'message': 'Login endpoint — connect MongoDB to activate'}), 501

@auth_bp.get('/me')
@jwt_required()
def me():
    """Return the current authenticated user's profile."""
    user_id = get_jwt_identity()
    return jsonify({'user_id': user_id})

@auth_bp.post('/github/callback')
def github_callback():
    """GitHub OAuth callback — exchange code for access token."""
    code = request.json.get('code')
    # TODO: exchange code with GitHub, create/update user record
    return jsonify({'message': 'GitHub OAuth endpoint — provide GITHUB_CLIENT_ID/SECRET'}), 501
