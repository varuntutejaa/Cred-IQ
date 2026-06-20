from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

resume_bp = Blueprint('resume', __name__)

@resume_bp.post('/upload')
@jwt_required()
def upload():
    """
    Accept a PDF resume, extract text, parse skill claims,
    then cross-reference each claim against GitHub data.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    # TODO: PyPDF2 extract → NLP parse → GitHub cross-reference
    return jsonify({'message': 'Resume upload endpoint — connect PDF parser to activate'}), 501

@resume_bp.get('/analysis/<user_id>')
@jwt_required()
def get_analysis(user_id: str):
    """Return the latest resume analysis result for a user."""
    return jsonify({'message': 'analysis endpoint', 'user_id': user_id}), 501
