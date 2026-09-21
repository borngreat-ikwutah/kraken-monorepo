import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from db.database import init_db, SessionLocal
from db.models import Event, Feature, Prediction, Alert
from ml.extractors import NetworkFeatureExtractor, UrlFeatureExtractor, TextFeatureExtractor
from ml.models import ModelRegistry
from routes.auth_routes import auth_bp
from routes.ingest_routes import ingest_bp
from routes.dashboard_routes import dashboard_bp

load_dotenv()

app = Flask(__name__)

# Enable CORS for frontend applications
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "*"]}})

# Register Modular Route Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(ingest_bp)
app.register_blueprint(dashboard_bp)

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

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    """Fetch SOC Analyst alerts filtered by severity, status, search query, with pagination."""
    severity = request.args.get("severity")
    status = request.args.get("status")
    search = request.args.get("q") or request.args.get("search")
    limit = int(request.args.get("limit", 100))
    offset = int(request.args.get("offset", 0))

    db = SessionLocal()
    try:
        query = db.query(Alert)
        if severity and severity.upper() != "ALL":
            query = query.filter(Alert.severity == severity.upper())
        if status and status.upper() != "ALL":
            query = query.filter(Alert.status == status.upper())
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Alert.summary.ilike(search_pattern)) |
                (Alert.threat_type.ilike(search_pattern))
            )

        total_count = query.count()
        alerts = query.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()
        return jsonify({
            "count": total_count,
            "limit": limit,
            "offset": offset,
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
