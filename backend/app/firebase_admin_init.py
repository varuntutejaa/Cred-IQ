import os
import json
import firebase_admin
from firebase_admin import credentials, auth as fb_auth
from flask import request, jsonify
from flask_jwt_extended import decode_token
from functools import wraps

_initialized = False


def init_firebase():
    global _initialized
    if _initialized:
        return
    cred_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
    cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')

    if cred_json:
        cred = credentials.Certificate(json.loads(cred_json))
        firebase_admin.initialize_app(cred)
        _initialized = True
    elif cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        _initialized = True
    else:
        # Firebase not configured — demo/JWT-only mode
        print('[CredIQ] Firebase not configured — running in demo/JWT mode. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH to enable Firebase auth.')


def verify_firebase_token(id_token: str) -> dict:
    if not _initialized:
        raise RuntimeError('Firebase not configured')
    return fb_auth.verify_id_token(id_token)


def firebase_required(f):
    """
    Accepts either a Firebase ID token OR a CredIQ demo JWT.
    Injects firebase_uid and firebase_claims into kwargs.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Missing Authorization header'}), 401

        token = auth_header.split(' ', 1)[1]

        # Try Firebase first (if configured)
        if _initialized:
            try:
                decoded = verify_firebase_token(token)
                kwargs['firebase_uid']    = decoded['uid']
                kwargs['firebase_claims'] = decoded
                return f(*args, **kwargs)
            except Exception:
                pass  # fall through to JWT check

        # Fall back to demo JWT
        try:
            decoded = decode_token(token)
            claims  = decoded.get('additional_claims', {}) or decoded
            uid     = decoded.get('sub') or decoded.get('identity')
            kwargs['firebase_uid']    = uid
            kwargs['firebase_claims'] = {**claims, 'uid': uid}
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': f'Invalid token: {e}'}), 401

    return wrapper
