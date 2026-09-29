import re
from datetime import datetime
from flask import jsonify

def api_response(success=True, message="", data=None, errors=None, status_code=200):
    payload = {
        "success": success,
        "message": message
    }
    if data is not None:
        payload["data"] = data
    if errors is not None:
        payload["errors"] = errors
    return jsonify(payload), status_code

def validate_email(email):
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email))

def parse_date(date_str):
    if not date_str:
        return None
    if isinstance(date_str, datetime):
        return date_str.date()
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        try:
            return datetime.strptime(date_str, '%d-%m-%Y').date()
        except ValueError:
            return None
