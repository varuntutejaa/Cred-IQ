from flask import Blueprint, jsonify
from ..firebase_admin_init import firebase_required
from ..services.github_service import analyze_profile, vibe_code_analysis
from ..services.trust_engine import compute_trust_score
from ..services.builder_score import compute_builder_score
from ..services.gemini_service import generate_career_insights, generate_vibe_verdict, analyze_score_breakdown

insights_bp = Blueprint('insights', __name__)


@insights_bp.get('/career/<username>')
@firebase_required
def career_insights(username: str, firebase_uid, firebase_claims):
    """Full AI career analysis powered by Gemini — single GitHub API call."""
    github_data = analyze_profile(username)
    if 'error' in github_data:
        return jsonify(github_data), 502

    # Reuse the already-fetched data — no duplicate GitHub API calls
    raw_repos = github_data.pop('_raw_repos', None)
    trust     = compute_trust_score(username, github_data=github_data)
    builder   = compute_builder_score(username, repos=raw_repos)

    try:
        insights = generate_career_insights(github_data, trust, builder)
    except Exception as e:
        return jsonify({'error': f'Gemini error: {e}'}), 500

    return jsonify({
        'username':      username,
        'insights':      insights,
        'trust_score':   trust.get('total'),
        'builder_score': builder.get('total'),
    })


@insights_bp.get('/score-analysis/<username>')
@firebase_required
def score_analysis(username: str, firebase_uid, firebase_claims):
    """AI explains every dimension of Trust + Builder scores with specific reasoning."""
    github_data = analyze_profile(username)
    if 'error' in github_data:
        return jsonify(github_data), 502

    raw_repos = github_data.pop('_raw_repos', None)
    trust     = compute_trust_score(username, github_data=github_data)
    builder   = compute_builder_score(username, repos=raw_repos)

    try:
        analysis = analyze_score_breakdown(username, trust, builder, github_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({
        'username':      username,
        'trust_score':   trust.get('total'),
        'builder_score': builder.get('total'),
        'trust_dims':    trust.get('dimensions', {}),
        'builder_dims':  builder.get('dimensions', {}),
        'analysis':      analysis,
    })


@insights_bp.get('/vibe/<username>')
@firebase_required
def vibe_insights(username: str, firebase_uid, firebase_claims):
    """AI-powered vibe code verdict from Gemini."""
    github_data = analyze_profile(username)
    vibe_data   = vibe_code_analysis(username)

    if 'error' in github_data:
        return jsonify(github_data), 502

    github_data.pop('_raw_repos', None)

    try:
        verdict = generate_vibe_verdict(vibe_data, github_data)
    except Exception as e:
        return jsonify({'error': f'Gemini error: {e}'}), 500

    return jsonify({
        'username':    username,
        'raw_signals': vibe_data,
        'ai_verdict':  verdict,
    })
