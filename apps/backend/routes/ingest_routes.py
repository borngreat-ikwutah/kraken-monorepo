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
