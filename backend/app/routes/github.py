from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

github_bp = Blueprint('github', __name__)

@github_bp.get('/analyze/<username>')
@jwt_required()
def analyze(username: str):
    """
    Deep-analyze a GitHub profile.
    Returns: repos, commits, language distribution, score dimensions, radar data.
    """
    from ..services.github_service import analyze_profile
    result = analyze_profile(username)
    return jsonify(result)

@github_bp.get('/contributions/<username>')
@jwt_required()
def contributions(username: str):
    """Return the contribution heatmap grid for the last 12 months."""
    # TODO: scrape GitHub contribution SVG or use GitHub GraphQL API
    return jsonify({'message': 'contributions endpoint', 'username': username}), 501

@github_bp.get('/repos/<username>')
@jwt_required()
def repos(username: str):
    """Return all public repositories with authenticity scores."""
    return jsonify({'message': 'repos endpoint', 'username': username}), 501
