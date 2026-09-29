from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Farm, Crop, Activity
from app.utils.validators import api_response, parse_date
from app.utils.decorators import get_user_crop, get_user_activity

activity_bp = Blueprint('activities', __name__, url_prefix='/api/activities')

@activity_bp.route('', methods=['GET'])
@jwt_required()
def get_activities():
    current_user_id = int(get_jwt_identity())
    user_farms = Farm.query.filter_by(user_id=current_user_id).all()
    farm_ids = [f.id for f in user_farms]

    crop_ids = [c.id for c in Crop.query.filter(Crop.farm_id.in_(farm_ids)).all()]
    if not crop_ids:
        return api_response(success=True, message="Activities fetched", data=[])

    crop_id_param = request.args.get('crop_id')
    status_param = request.args.get('status')
    priority_param = request.args.get('priority')

    if crop_id_param:
        crop_ids = [c for c in crop_ids if c == int(crop_id_param)]

    query = Activity.query.filter(Activity.crop_id.in_(crop_ids))

    if priority_param:
        query = query.filter(Activity.priority == priority_param)

    activities = query.order_by(Activity.activity_date.asc()).all()
    result = [a.to_dict() for a in activities]

    if status_param:
        result = [a for a in result if a['status'] == status_param]

    return api_response(success=True, message="Activities fetched successfully", data=result)

@activity_bp.route('', methods=['POST'])
@jwt_required()
def create_activity():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    crop_id = data.get('crop_id')
    title = data.get('title', '').strip()
    activity_date = parse_date(data.get('activity_date'))

    errors = {}
    if not crop_id:
        errors['crop_id'] = 'Crop ID is required'
    else:
        crop = get_user_crop(int(crop_id), current_user_id)
        if not crop:
            errors['crop_id'] = 'Crop not found or unauthorized'

    if not title:
        errors['title'] = 'Title is required'

    if not activity_date:
        errors['activity_date'] = 'Valid activity date is required (YYYY-MM-DD)'

    if errors:
        return api_response(success=False, message="Validation failed", errors=errors, status_code=400)

    activity = Activity(
        crop_id=int(crop_id),
        title=title,
        description=data.get('description'),
        activity_date=activity_date,
        priority=data.get('priority', 'MEDIUM'),
        status=data.get('status', 'PENDING')
    )

    try:
        db.session.add(activity)
        db.session.commit()
        return api_response(success=True, message="Activity scheduled successfully", data=activity.to_dict(), status_code=201)
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to schedule activity", errors={'server': str(e)}, status_code=500)

@activity_bp.route('/<int:activity_id>', methods=['GET'])
@jwt_required()
def get_activity(activity_id):
    current_user_id = int(get_jwt_identity())
    activity = get_user_activity(activity_id, current_user_id)
    if not activity:
        return api_response(success=False, message="Activity not found or unauthorized", status_code=404)
    return api_response(success=True, message="Activity details fetched", data=activity.to_dict())

@activity_bp.route('/<int:activity_id>', methods=['PUT'])
@jwt_required()
def update_activity(activity_id):
    current_user_id = int(get_jwt_identity())
    activity = get_user_activity(activity_id, current_user_id)
    if not activity:
        return api_response(success=False, message="Activity not found or unauthorized", status_code=404)

    data = request.get_json() or {}

    if 'title' in data:
        activity.title = data['title'].strip()
    if 'description' in data:
        activity.description = data['description']
    if 'activity_date' in data:
        a_date = parse_date(data['activity_date'])
        if a_date:
            activity.activity_date = a_date
    if 'priority' in data:
        activity.priority = data['priority']
    if 'status' in data:
        activity.status = data['status']

    try:
        db.session.commit()
        return api_response(success=True, message="Activity updated successfully", data=activity.to_dict())
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to update activity", errors={'server': str(e)}, status_code=500)

@activity_bp.route('/<int:activity_id>', methods=['DELETE'])
@jwt_required()
def delete_activity(activity_id):
    current_user_id = int(get_jwt_identity())
    activity = get_user_activity(activity_id, current_user_id)
    if not activity:
        return api_response(success=False, message="Activity not found or unauthorized", status_code=404)

    try:
        db.session.delete(activity)
        db.session.commit()
        return api_response(success=True, message="Activity deleted successfully")
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to delete activity", errors={'server': str(e)}, status_code=500)
