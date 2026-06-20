from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..services.trust_engine import compute_trust_score
from ..services.builder_score import compute_builder_score

verify_bp = Blueprint('verify', __name__)


@verify_bp.get('/trust-score/<username>')
@jwt_required()
def trust_score(username: str):
    result = compute_trust_score(username)
    if 'error' in result:
        return jsonify(result), 502
    return jsonify(result)


@verify_bp.get('/builder-score/<username>')
@jwt_required()
def builder_score(username: str):
    result = compute_builder_score(username)
    if 'error' in result:
        return jsonify(result), 502
    return jsonify(result)
