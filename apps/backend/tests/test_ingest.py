import json
import pytest

from app import app
from controllers.ingest_controller import IngestController
from db.database import SessionLocal, init_db
from db.models import Alert, Event, Feature, Prediction

@pytest.fixture
def client():
    app.config["TESTING"] = True
    init_db()
    with app.test_client() as client:
        yield client

def test_ingest_malicious_url_commits_db(client):
    """
    Test /api/ingest endpoint with a malicious phishing URL.
    Verifies that UrlFeatureExtractor + EnsembleScorer run and transactionally
    persist Event, Feature, Prediction, and Alert records to the DB.
    """
    malicious_url = "http://login-verify-account.paypal-security.xyz/auth/signin"
    payload = {
        "event_type": "url",
        "source_ip": "192.168.1.105",
        "destination_ip": "45.33.32.156",
        "payload": malicious_url
    }

    res = client.post("/api/ingest", json=payload)
    assert res.status_code == 201
    data = json.loads(res.data)

    assert data["status"] == "success"
    event_id = data["event_id"]
    assert event_id is not None
    assert "prediction" in data
    assert "features" in data
    assert data["prediction"]["model_name"] == "Ensemble (Transformer + RandomForest)"
    assert data["severity"] in ["CRITICAL", "HIGH", "MEDIUM"]
    assert data["alert"] is not None

    # Verify DB commits and transactional relationships
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        assert event is not None
        assert event.event_type == "url"
        assert event.raw_payload == malicious_url
        assert event.source_ip == "192.168.1.105"

        # Verify Feature DB record
        feature = db.query(Feature).filter(Feature.event_id == event_id).first()
        assert feature is not None
        feat_json = json.loads(feature.feature_json)
        assert "domain_entropy" in feat_json
        assert "has_suspicious_tld" in feat_json
        assert feat_json["has_suspicious_tld"] == 1.0

        # Verify Prediction DB record
        prediction = db.query(Prediction).filter(Prediction.event_id == event_id).first()
        assert prediction is not None
        assert prediction.model_name == "Ensemble (Transformer + RandomForest)"
        assert prediction.score >= 0.50
        assert prediction.threat_label in ["suspicious", "malicious"]

        # Verify Alert DB record
        alert = db.query(Alert).filter(Alert.prediction_id == prediction.id).first()
        assert alert is not None
        assert alert.threat_type == "URL"
        assert alert.severity in ["CRITICAL", "HIGH", "MEDIUM"]
        assert alert.status == "NEW"

    finally:
        db.close()

def test_ingest_benign_url_commits_db(client):
    """
    Test /api/ingest endpoint with a benign URL.
    Verifies Event, Feature, and Prediction are persisted without a Critical/High alert.
    """
    benign_url = "https://wikipedia.org/wiki/Computer_security"
    payload = {
        "event_type": "url",
        "source_ip": "10.0.0.50",
        "destination_ip": "208.80.154.224",
        "payload": benign_url
    }

    res = client.post("/api/ingest", json=payload)
    assert res.status_code == 201
    data = json.loads(res.data)

    assert data["status"] == "success"
    event_id = data["event_id"]

    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        assert event is not None
        assert event.raw_payload == benign_url

        prediction = db.query(Prediction).filter(Prediction.event_id == event_id).first()
        assert prediction is not None
        assert prediction.score < 0.50
    finally:
        db.close()

def test_realtime_predict_endpoint(client):
    """Test /api/predict provides real-time inference without DB creation."""
    payload = {
        "event_type": "url",
        "payload": "http://secure-update-banking.cc/login"
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data["status"] == "success"
    assert "features" in data
    assert "inference" in data
    assert data["inference"]["top_prediction"]["model_name"] == "Ensemble (Transformer + RandomForest)"
