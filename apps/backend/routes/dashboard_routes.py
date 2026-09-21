from flask import Blueprint, jsonify, request
from controllers.dashboard_controller import DashboardController

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api")

@dashboard_bp.route("/analytics/metrics", methods=["GET"])
@dashboard_bp.route("/stats", methods=["GET"])
def get_analytics_metrics():
    """Returns Top Metrics Cards aggregated counts and deltas."""
    response, status_code = DashboardController.get_metrics()
    return jsonify(response), status_code

@dashboard_bp.route("/analytics/timeseries", methods=["GET"])
def get_analytics_timeseries():
    """Returns Detection Velocity and Weekly Threat Volume charts."""
    response, status_code = DashboardController.get_timeseries()
    return jsonify(response), status_code

@dashboard_bp.route("/alerts/<int:alert_id>", methods=["GET"])
def get_single_alert(alert_id: int):
    """Fetches details for a specific incident."""
    response, status_code = DashboardController.get_alert_by_id(alert_id)
    return jsonify(response), status_code

@dashboard_bp.route("/alerts/<int:alert_id>", methods=["PATCH"])
def patch_alert(alert_id: int):
    """Updates alert status, feedback, or analyst notes."""
    data = request.get_json() or {}
    response, status_code = DashboardController.update_alert(alert_id, data)
    return jsonify(response), status_code

@dashboard_bp.route("/models", methods=["GET"])
def get_registered_models():
    """Returns active registered ML threat models."""
    response, status_code = DashboardController.get_models()
    return jsonify(response), status_code
