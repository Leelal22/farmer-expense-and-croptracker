import os
from flask import Flask, jsonify
from app.config import config_by_name
from app.extensions import db, migrate, jwt, cors
from app.routes import all_blueprints

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name['default']))

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, origins=app.config.get('CORS_ORIGINS', '*'), supports_credentials=True)

    # JWT Error Callbacks
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Authorization header is missing or token invalid',
            'errors': {'auth': 'Token required'}
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Signature verification failed or invalid token',
            'errors': {'auth': 'Invalid token'}
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Token has expired',
            'errors': {'auth': 'Token expired'}
        }), 401

    # Register Blueprints
    for bp in all_blueprints:
        app.register_blueprint(bp)

    # Health check route
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'app': 'Farmer Expense & Crop Tracker API'}), 200

    # Global Exception Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Resource or endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

    return app
