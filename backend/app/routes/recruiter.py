from flask import Blueprint, request, jsonify
from ..firebase_admin_init import firebase_required
from ..db import get_db
from ..services.trust_engine import compute_trust_score
from ..services.builder_score import compute_builder_score
from ..services.github_service import vibe_code_analysis

recruiter_bp = Blueprint('recruiter', __name__)


@recruiter_bp.get('/quick-verify/<username>')
@firebase_required
def quick_verify(username: str, firebase_uid, firebase_claims):
    trust   = compute_trust_score(username)
    builder = compute_builder_score(username)
    vibe    = vibe_code_analysis(username)
    return jsonify({'username': username, 'trust_score': trust, 'builder_score': builder, 'vibe_analysis': vibe})


@recruiter_bp.post('/shortlists')
@firebase_required
def create_shortlist(firebase_uid, firebase_claims):
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'message': 'name is required'}), 400

    db  = get_db()
    ref = db.collection('shortlists').document()
    doc = {'id': ref.id, 'recruiter_uid': firebase_uid, 'name': name, 'candidates': []}
    ref.set(doc)
    return jsonify(doc), 201


@recruiter_bp.get('/shortlists')
@firebase_required
def get_shortlists(firebase_uid, firebase_claims):
    db    = get_db()
    docs  = db.collection('shortlists').where('recruiter_uid', '==', firebase_uid).stream()
    lists = [d.to_dict() for d in docs]
    return jsonify(lists)


@recruiter_bp.post('/shortlists/<list_id>/candidates')
@firebase_required
def add_candidate(list_id: str, firebase_uid, firebase_claims):
    data     = request.get_json(silent=True) or {}
    username = data.get('github_username', '').strip()
    if not username:
        return jsonify({'message': 'github_username required'}), 400

    db  = get_db()
    ref = db.collection('shortlists').document(list_id)
    doc = ref.get()
    if not doc.exists:
        return jsonify({'message': 'Shortlist not found'}), 404

    current = doc.to_dict().get('candidates', [])
    if username not in current:
        ref.update({'candidates': current + [username]})
    return jsonify({'message': 'added'})


@recruiter_bp.delete('/shortlists/<list_id>/candidates/<username>')
@firebase_required
def remove_candidate(list_id: str, username: str, firebase_uid, firebase_claims):
    db  = get_db()
    ref = db.collection('shortlists').document(list_id)
    doc = ref.get()
    if not doc.exists:
        return jsonify({'message': 'Shortlist not found'}), 404

    current = doc.to_dict().get('candidates', [])
    ref.update({'candidates': [c for c in current if c != username]})
    return jsonify({'message': 'removed'})
