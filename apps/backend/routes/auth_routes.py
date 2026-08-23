from flask import Blueprint, jsonify, request

from controllers.auth_controller import AuthController

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    response, status_code = AuthController.register(data)
    return jsonify(response), status_code

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    response, status_code = AuthController.login(data)
    return jsonify(response), status_code

@auth_bp.route("/me", methods=["GET"])
def get_me():
    auth_header = request.headers.get("Authorization", "")
    response, status_code = AuthController.get_me(auth_header)
    return jsonify(response), status_code

@auth_bp.route("/logout", methods=["POST"])
def logout():
    auth_header = request.headers.get("Authorization", "")
    response, status_code = AuthController.logout(auth_header)
    return jsonify(response), status_code
