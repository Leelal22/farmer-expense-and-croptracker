from app.extensions import db
from app.models.user import User
from flask_jwt_extended import create_access_token
from app.utils.validators import validate_email

class AuthService:
    @staticmethod
    def register_user(data):
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        errors = {}
        if not name:
            errors['name'] = 'Name is required'
        if not email:
            errors['email'] = 'Email is required'
        elif not validate_email(email):
            errors['email'] = 'Invalid email address'
        if not password:
            errors['password'] = 'Password is required'
        elif len(password) < 6:
            errors['password'] = 'Password must be at least 6 characters long'

        if errors:
            return None, errors, 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return None, {'email': 'Email is already registered'}, 409

        user = User(
            name=name,
            email=email,
            phone=data.get('phone'),
            village=data.get('village'),
            district=data.get('district'),
            state=data.get('state')
        )
        user.set_password(password)

        try:
            db.session.add(user)
            db.session.commit()
            access_token = create_access_token(identity=str(user.id))
            return {
                'user': user.to_dict(),
                'access_token': access_token
            }, None, 201
        except Exception as e:
            db.session.rollback()
            return None, {'server': str(e)}, 500

    @staticmethod
    def login_user(data):
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return None, {'message': 'Email and password are required'}, 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return None, {'message': 'Invalid email or password'}, 401

        access_token = create_access_token(identity=str(user.id))
        return {
            'user': user.to_dict(),
            'access_token': access_token
        }, None, 200

    @staticmethod
    def get_profile(user_id):
        user = User.query.get(user_id)
        if not user:
            return None, {'message': 'User not found'}, 404
        return user.to_dict(), None, 200

    @staticmethod
    def update_profile(user_id, data):
        user = User.query.get(user_id)
        if not user:
            return None, {'message': 'User not found'}, 404

        if 'name' in data:
            user.name = data['name'].strip()
        if 'phone' in data:
            user.phone = data['phone']
        if 'village' in data:
            user.village = data['village']
        if 'district' in data:
            user.district = data['district']
        if 'state' in data:
            user.state = data['state']

        if 'password' in data and data['password']:
            if len(data['password']) < 6:
                return None, {'password': 'Password must be at least 6 characters long'}, 400
            user.set_password(data['password'])

        try:
            db.session.commit()
            return user.to_dict(), None, 200
        except Exception as e:
            db.session.rollback()
            return None, {'server': str(e)}, 500
