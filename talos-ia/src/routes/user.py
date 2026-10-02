from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User, DailyUsage
from src.database import db
from datetime import datetime, date

user_bp = Blueprint("user", __name__)

@user_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_profile(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user.to_dict()), 200

@user_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user_profile(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    user.name = data.get("name", user.name)
    user.profile_picture = data.get("profile_picture", user.profile_picture)
    user.age = data.get("age", user.age)
    user.difficulty_level = data.get("difficulty_level", user.difficulty_level)

    db.session.commit()
    return jsonify(user.to_dict()), 200

@user_bp.route("/<int:user_id>/daily_usage", methods=["GET"])
@jwt_required()
def get_daily_usage(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    today = date.today()
    usage = DailyUsage.query.filter_by(user_id=user_id, date=today).first()

    if not usage:
        return jsonify({"chats_created": 0, "challenges_generated": 0}), 200

    return jsonify({
        "chats_created": usage.chats_created,
        "challenges_generated": usage.challenges_generated
    }), 200

@user_bp.route("/<int:user_id>/increment_chat_count", methods=["POST"])
@jwt_required()
def increment_chat_count(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    today = date.today()
    usage = DailyUsage.query.filter_by(user_id=user_id, date=today).first()

    if not usage:
        usage = DailyUsage(user_id=user_id, date=today, chats_created=1)
        db.session.add(usage)
    else:
        usage.chats_created += 1
    db.session.commit()
    return jsonify({"message": "Chat count incremented"}), 200

@user_bp.route("/<int:user_id>/increment_challenge_count", methods=["POST"])
@jwt_required()
def increment_challenge_count(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    today = date.today()
    usage = DailyUsage.query.filter_by(user_id=user_id, date=today).first()

    if not usage:
        usage = DailyUsage(user_id=user_id, date=today, challenges_generated=1)
        db.session.add(usage)
    else:
        usage.challenges_generated += 1
    db.session.commit()
    return jsonify({"message": "Challenge count incremented"}), 200


