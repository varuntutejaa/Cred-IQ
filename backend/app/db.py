from pymongo import MongoClient
from pymongo.database import Database
import os

_client: MongoClient | None = None

def get_db() -> Database:
    global _client
    if _client is None:
        _client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/crediq'))
    return _client.get_default_database()

def close_db():
    global _client
    if _client:
        _client.close()
        _client = None
