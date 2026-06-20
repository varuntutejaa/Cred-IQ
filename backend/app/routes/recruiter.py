from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from ..db import get_db
from ..services.trust_engine import compute_trust_score
from ..services.builder_score import compute_builder_score
from ..services.github_service import vibe_code_analysis

recruiter_bp = Blueprint('recruiter', __name__)


@recruiter_bp.get('/quick-verify/<username>')
@jwt_required()
def quick_verify(username: str):
    """Full one-click verification report."""
    trust   = compute_trust_score(username)
    builder = compute_builder_score(username)
    vibe    = vibe_code_analysis(username)
    return jsonify({
        'username':      username,
        'trust_score':   trust,
        'builder_score': builder,
        'vibe_analysis': vibe,
    })


@recruiter_bp.post('/shortlists')
@jwt_required()
def create_shortlist():
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    name    = (data.get('name') or '').strip()
    if not name:
        return jsonify({'message': 'name is required'}), 400

    db  = get_db()
    doc = {'recruiter_id': user_id, 'name': name, 'candidates': [], }
    res = db.shortlists.insert_one(doc)
    doc['id'] = str(res.inserted_id)
    doc.pop('_id', None)
    return jsonify(doc), 201


@recruiter_bp.get('/shortlists')
@jwt_required()
def get_shortlists():
    user_id = get_jwt_identity()
    db      = get_db()
    lists   = []
    for doc in db.shortlists.find({'recruiter_id': user_id}):
        doc['id'] = str(doc.pop('_id'))
        lists.append(doc)
    return jsonify(lists)


@recruiter_bp.post('/shortlists/<list_id>/candidates')
@jwt_required()
def add_candidate(list_id: str):
    data     = request.get_json(silent=True) or {}
    username = data.get('github_username', '').strip()
    if not username:
        return jsonify({'message': 'github_username required'}), 400

    db = get_db()
    db.shortlists.update_one(
        {'_id': ObjectId(list_id)},
        {'$addToSet': {'candidates': username}}
    )
    return jsonify({'message': 'added'})
