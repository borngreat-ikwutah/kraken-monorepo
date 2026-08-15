import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from db.database import init_db, SessionLocal
from db.models import Event, Feature, Prediction, Alert
from ml.extractors import NetworkFeatureExtractor, UrlFeatureExtractor, TextFeatureExtractor
from ml.models import ModelRegistry

load_dotenv()

app = Flask(__name__)

# Enable CORS for frontend applications
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "*"]}})

# Initialize Database and ML Model Registry
print("🚀 Initializing Threat Detection Backend Engine...")
init_db()
model_registry = ModelRegistry()

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Threat Detection Pipeline ML Backend",
        "version": "1.0.0",
        "models_active": [
            "IsolationForest-v1.0 (Network Anomalies)",
            "RandomForestClassifier-v1.0 (Threat Classification)",
            "HuggingFace-Phishing-DistilBERT (NLP Phishing & Logs)"
        ]
    })

@app.route("/api/ingest", methods=["POST"])
def ingest_event():
    """
    Ingest security telemetry event, run feature extraction & ML inference, 
    and persist event, features, predictions, and alerts.
    """
    data = request.get_json() or {}
    event_type = data.get("event_type", "network_flow") # network_flow, url, email, log
    source_ip = data.get("source_ip", "192.168.1.100")
    destination_ip = data.get("destination_ip", "10.0.0.1")
    raw_payload = data.get("payload", "")

    if isinstance(raw_payload, dict):
        payload_str = json.dumps(raw_payload)
        payload_data = raw_payload
    else:
        payload_str = str(raw_payload)
        payload_data = {"raw": payload_str}

    # 1. Extract Features based on Event Type
    if event_type == "network_flow":
        features = NetworkFeatureExtractor.extract(payload_data)
    elif event_type == "url":
        features = UrlFeatureExtractor.extract(payload_str)
    else: # email, log, text
        features = TextFeatureExtractor.extract(payload_str)

    db = SessionLocal()
    try:
        # 2. Persist Event
        event_obj = Event(
            event_type=event_type,
            source_ip=source_ip,
            destination_ip=destination_ip,
            raw_payload=payload_str
        )
        db.add(event_obj)
        db.flush()

        # 3. Persist Features
        feature_obj = Feature(
            event_id=event_obj.id,
            feature_json=json.dumps(features)
        )
        db.add(feature_obj)
        db.flush()

        # 4. Execute ML Engine Inference
        inference_result = model_registry.run_inference(event_type, payload_str, features)
        top_pred = inference_result["top_prediction"]
        severity = inference_result["severity"]

        # 5. Persist Prediction
        prediction_obj = Prediction(
            event_id=event_obj.id,
            model_name=top_pred["model_name"],
            score=top_pred["score"],
            threat_label=top_pred["threat_label"],
            explanation=top_pred["explanation"]
        )
        db.add(prediction_obj)
        db.flush()

        # 6. Generate Alert for Medium, High, Critical Threats
        alert_dict = None
        if severity in ["CRITICAL", "HIGH", "MEDIUM"]:
            summary_text = f"[{severity}] Potential {event_type.upper()} threat detected by {top_pred['model_name']} (Score: {top_pred['score']:.2%})"
            alert_obj = Alert(
                prediction_id=prediction_obj.id,
                severity=severity,
                status="NEW",
                threat_type=event_type.upper(),
                summary=summary_text
            )
            db.add(alert_obj)
            db.flush()
            alert_dict = alert_obj.to_dict()

        db.commit()

        return jsonify({
            "status": "success",
            "event_id": event_obj.id,
            "prediction": top_pred,
            "severity": severity,
            "alert": alert_dict
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        db.close()

@app.route("/api/predict", methods=["POST"])
def real_time_predict():
    """Real-time inference endpoint without persisting DB records."""
    data = request.get_json() or {}
    event_type = data.get("event_type", "network_flow")
    raw_payload = data.get("payload", "")

    if isinstance(raw_payload, dict):
        payload_data = raw_payload
        payload_str = json.dumps(raw_payload)
    else:
        payload_str = str(raw_payload)
        payload_data = {"raw": payload_str}

    if event_type == "network_flow":
        features = NetworkFeatureExtractor.extract(payload_data)
    elif event_type == "url":
        features = UrlFeatureExtractor.extract(payload_str)
    else:
        features = TextFeatureExtractor.extract(payload_str)

    inference_result = model_registry.run_inference(event_type, payload_str, features)
    return jsonify({
        "status": "success",
        "features": features,
        "inference": inference_result
    })

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    """Fetch SOC Analyst alerts filtered by severity and status."""
    severity = request.args.get("severity")
    status = request.args.get("status")
    limit = int(request.args.get("limit", 50))

    db = SessionLocal()
    try:
        query = db.query(Alert)
        if severity:
            query = query.filter(Alert.severity == severity.upper())
        if status:
            query = query.filter(Alert.status == status.upper())

        alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()
        return jsonify({
            "count": len(alerts),
            "alerts": [alert.to_dict() for alert in alerts]
        })
    finally:
        db.close()

@app.route("/api/alerts/<int:alert_id>/feedback", methods=["POST"])
def update_alert_feedback(alert_id):
    """Analyst workflow endpoint to update alert status and feedback."""
    data = request.get_json() or {}
    new_status = data.get("status") # ACKNOWLEDGED, RESOLVED, FALSE_POSITIVE
    feedback = data.get("analyst_feedback") # TRUE_POSITIVE, FALSE_POSITIVE
    notes = data.get("analyst_notes")

    db = SessionLocal()
    try:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return jsonify({"status": "error", "message": "Alert not found"}), 404

        if new_status:
            alert.status = new_status.upper()
        if feedback:
            alert.analyst_feedback = feedback.upper()
        if notes:
            alert.analyst_notes = notes

        db.commit()
        return jsonify({"status": "success", "alert": alert.to_dict()})
    except Exception as e:
        db.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        db.close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "development") == "development"
    print(f"🔥 Flask Threat Detection API running on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
