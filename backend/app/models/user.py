from datetime import datetime, timezone
from bson import ObjectId
import bcrypt


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def check_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_user(db, name: str, email: str, password: str, role: str) -> dict:
    if db.users.find_one({'email': email}):
        raise ValueError('Email already registered')

    doc = {
        'name': name,
        'email': email,
        'password_hash': hash_password(password),
        'role': role,                        # 'developer' | 'recruiter'
        'avatar': name[0].upper(),
        'company': None,
        'title': None,
        'github_username': None,
        'bio': None,
        'location': None,
        'trust_score': None,
        'github_score': None,
        'verified_skills': [],
        'certificates': [],
        'created_at': datetime.now(timezone.utc),
        'updated_at': datetime.now(timezone.utc),
    }
    result = db.users.insert_one(doc)
    doc['_id'] = result.inserted_id
    return _serialize(doc)


def find_user_by_email(db, email: str) -> "Optional[dict]":
    doc = db.users.find_one({'email': email})
    return _serialize(doc) if doc else None


def find_user_by_id(db, user_id: str) -> "Optional[dict]":
    try:
        doc = db.users.find_one({'_id': ObjectId(user_id)})
        return _serialize(doc) if doc else None
    except Exception:
        return None


def update_user(db, user_id: str, updates: dict) -> "Optional[dict]":
    updates['updated_at'] = datetime.now(timezone.utc)
    db.users.update_one({'_id': ObjectId(user_id)}, {'$set': updates})
    return find_user_by_id(db, user_id)


def _serialize(doc: dict) -> dict:
    if not doc:
        return doc
    d = dict(doc)
    d['id'] = str(d.pop('_id'))
    d.pop('password_hash', None)
    return d
