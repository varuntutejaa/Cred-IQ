from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY']               = os.getenv('SECRET_KEY', 'dev-secret-change-me')
    app.config['JWT_SECRET_KEY']           = os.getenv('JWT_SECRET_KEY', 'dev-jwt-change-me')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

    CORS(app, origins=[os.getenv('FRONTEND_URL', 'http://localhost:5173')], supports_credentials=True)
    JWTManager(app)   # still used for demo tokens only

    from .firebase_admin_init import init_firebase
    init_firebase()

    from .routes.auth       import auth_bp
    from .routes.github     import github_bp
    from .routes.resume     import resume_bp
    from .routes.verify     import verify_bp
    from .routes.recruiter  import recruiter_bp
    from .routes.insights   import insights_bp
    from .routes.complexity import complexity_bp

    app.register_blueprint(auth_bp,       url_prefix='/api/auth')
    app.register_blueprint(github_bp,     url_prefix='/api/github')
    app.register_blueprint(resume_bp,     url_prefix='/api/resume')
    app.register_blueprint(verify_bp,     url_prefix='/api/verify')
    app.register_blueprint(recruiter_bp,  url_prefix='/api/recruiter')
    app.register_blueprint(insights_bp,   url_prefix='/api/insights')
    app.register_blueprint(complexity_bp, url_prefix='/api/complexity')

    @app.get('/api/health')
    def health():
        from .db import get_db
        try:
            get_db().command('ping')
            db_status = 'connected'
        except Exception:
            db_status = 'disconnected'
        return {'status': 'ok', 'service': 'CredIQ API', 'db': db_status}

    return app
