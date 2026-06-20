from flask import Blueprint, jsonify
from ..firebase_admin_init import firebase_required
from ..services.github_service import analyze_profile, vibe_code_analysis

github_bp = Blueprint('github', __name__)


@github_bp.get('/analyze/<username>')
@firebase_required
def analyze(username: str, firebase_uid, firebase_claims):
    result = analyze_profile(username)
    if 'error' in result:
        return jsonify(result), 502
    return jsonify(result)


@github_bp.get('/vibe/<username>')
@firebase_required
def vibe(username: str, firebase_uid, firebase_claims):
    result = vibe_code_analysis(username)
    if 'error' in result:
        return jsonify(result), 502
    return jsonify(result)
