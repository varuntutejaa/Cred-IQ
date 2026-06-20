from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..services.github_service import analyze_profile, vibe_code_analysis

github_bp = Blueprint('github', __name__)


@github_bp.get('/analyze/<username>')
@jwt_required()
def analyze(username: str):
    result = analyze_profile(username)
    if 'error' in result:
        return jsonify(result), 502
    return jsonify(result)


@github_bp.get('/vibe/<username>')
@jwt_required()
def vibe(username: str):
    result = vibe_code_analysis(username)
    if 'error' in result:
        return jsonify(result), 502
    return jsonify(result)
