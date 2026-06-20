import os
import json
import firebase_admin
from firebase_admin import credentials, auth as fb_auth
from flask import request, jsonify
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
    elif cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        raise RuntimeError(
            'Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH in .env'
        )
    firebase_admin.initialize_app(cred)
    _initialized = True


def verify_firebase_token(id_token: str) -> dict:
    """Verify Firebase ID token and return the decoded claims."""
    return fb_auth.verify_id_token(id_token)


def firebase_required(f):
    """Route decorator — verifies Firebase Bearer token, injects uid into kwargs."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Missing Authorization header'}), 401
        token = auth_header.split(' ', 1)[1]
        try:
            decoded = verify_firebase_token(token)
            kwargs['firebase_uid'] = decoded['uid']
            kwargs['firebase_claims'] = decoded
        except Exception as e:
            return jsonify({'message': f'Invalid token: {e}'}), 401
        return f(*args, **kwargs)
    return wrapper
