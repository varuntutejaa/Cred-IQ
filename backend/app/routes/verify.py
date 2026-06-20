from flask import Blueprint, jsonify
from ..firebase_admin_init import firebase_required
from ..services.trust_engine import compute_trust_score
from ..services.builder_score import compute_builder_score

verify_bp = Blueprint('verify', __name__)


@verify_bp.get('/trust-score/<username>')
@firebase_required
def trust_score(username: str, firebase_uid, firebase_claims):
    result = compute_trust_score(username)
    if 'error' in result:
        return jsonify(result), 502
    return jsonify(result)


@verify_bp.get('/builder-score/<username>')
@firebase_required
def builder_score(username: str, firebase_uid, firebase_claims):
    result = compute_builder_score(username)
    if 'error' in result:
        return jsonify(result), 502
    return jsonify(result)
