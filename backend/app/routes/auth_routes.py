from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import AuthService
from app.utils.validators import api_response

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    result, errors, status_code = AuthService.register_user(data)
    if errors:
        return api_response(success=False, message="Registration failed", errors=errors, status_code=status_code)
    return api_response(success=True, message="User registered successfully", data=result, status_code=status_code)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    result, errors, status_code = AuthService.login_user(data)
    if errors:
        return api_response(success=False, message=errors.get('message', 'Login failed'), errors=errors, status_code=status_code)
    return api_response(success=True, message="Login successful", data=result, status_code=status_code)

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # Token invalidation can be logged / handled client side or via JWT blocklist
    return api_response(success=True, message="Successfully logged out")

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = int(get_jwt_identity())
    result, errors, status_code = AuthService.get_profile(current_user_id)
    if errors:
        return api_response(success=False, message="User not found", errors=errors, status_code=status_code)
    return api_response(success=True, message="Profile fetched successfully", data=result, status_code=status_code)

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def profile():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    result, errors, status_code = AuthService.update_profile(current_user_id, data)
    if errors:
        return api_response(success=False, message="Profile update failed", errors=errors, status_code=status_code)
    return api_response(success=True, message="Profile updated successfully", data=result, status_code=status_code)
