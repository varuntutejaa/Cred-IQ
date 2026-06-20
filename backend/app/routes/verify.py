from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

verify_bp = Blueprint('verify', __name__)

@verify_bp.get('/trust-score/<username>')
@jwt_required()
def trust_score(username: str):
    """
    Compute and return the full CredIQ Trust Score.
    Runs all 6 verification engines and returns a weighted composite.
    """
    from ..services.trust_engine import compute_trust_score
    score = compute_trust_score(username)
    return jsonify(score)

@verify_bp.get('/builder-score/<username>')
@jwt_required()
def builder_score(username: str):
    """
    Compute the Builder Confidence Score — the signature CredIQ metric.
    Answers: "Can this person actually build production software?"
    """
    from ..services.builder_score import compute_builder_score
    score = compute_builder_score(username)
    return jsonify(score)

@verify_bp.get('/deployments/<username>')
@jwt_required()
def deployments(username: str):
    """Ping all linked deployment URLs, check HTTPS, uptime, response time."""
    return jsonify({'message': 'deployment verification endpoint'}), 501

@verify_bp.get('/certificates/<username>')
@jwt_required()
def certificates(username: str):
    """Validate all listed certificates against issuer databases."""
    return jsonify({'message': 'certificate verification endpoint'}), 501

@verify_bp.get('/vibe-code/<username>')
@jwt_required()
def vibe_code(username: str):
    """
    Detect AI-generated / vibe-coded repositories.
    Analyses commit patterns, naming entropy, timing distribution.
    """
    return jsonify({'message': 'vibe code detection endpoint'}), 501
