from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os

load_dotenv()

limiter = Limiter(key_func=get_remote_address)

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY']                  = os.getenv('SECRET_KEY', 'dev-secret')
    app.config['JWT_SECRET_KEY']              = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')
    app.config['MONGO_URI']                   = os.getenv('MONGO_URI', 'mongodb://localhost:27017/crediq')
    app.config['REDIS_URL']                   = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    CORS(app, origins=[os.getenv('FRONTEND_URL', 'http://localhost:5173')])
    JWTManager(app)
    limiter.init_app(app)

    from .routes.auth      import auth_bp
    from .routes.github    import github_bp
    from .routes.resume    import resume_bp
    from .routes.verify    import verify_bp
    from .routes.recruiter import recruiter_bp

    app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    app.register_blueprint(github_bp,    url_prefix='/api/github')
    app.register_blueprint(resume_bp,    url_prefix='/api/resume')
    app.register_blueprint(verify_bp,    url_prefix='/api/verify')
    app.register_blueprint(recruiter_bp, url_prefix='/api/recruiter')

    @app.get('/api/health')
    def health():
        return {'status': 'ok', 'service': 'CredIQ API'}

    return app
