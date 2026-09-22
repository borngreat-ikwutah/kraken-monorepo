from flask import Blueprint, jsonify, request

from controllers.ingest_controller import IngestController

ingest_bp = Blueprint("ingest", __name__, url_prefix="/api")

@ingest_bp.route("/ingest", methods=["POST"])
def ingest_event():
    """
    Ingest security telemetry event, run feature extraction & ML inference,
    and persist event, features, predictions, and alerts transactionally.
    """
    data = request.get_json() or {}
    response, status_code = IngestController.ingest_event(data)
    return jsonify(response), status_code

@ingest_bp.route("/predict", methods=["POST"])
def real_time_predict():
    """Real-time inference endpoint without persisting DB records."""
    data = request.get_json() or {}
    response, status_code = IngestController.predict_realtime(data)
    return jsonify(response), status_code

@ingest_bp.route("/events", methods=["GET"])
def list_telemetry_events():
    """Returns persisted telemetry query logs with predictions and alerts."""
    try:
        limit = int(request.args.get("limit", 50))
    except (TypeError, ValueError):
        limit = 50
    try:
        offset = int(request.args.get("offset", 0))
    except (TypeError, ValueError):
        offset = 0
    limit = max(1, min(limit, 100))
    offset = max(0, offset)
    event_type = request.args.get("event_type")
    search = request.args.get("q") or request.args.get("search")
    response, status_code = IngestController.get_events(
        limit=limit, offset=offset, event_type=event_type, search=search
    )
    return jsonify(response), status_code
