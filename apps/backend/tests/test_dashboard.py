import json
import pytest
from app import app
from db.database import SessionLocal, init_db
from db.models import Alert, Event, Prediction

test_alert_id = None

@pytest.fixture(autouse=True)
def setup_database():
    global test_alert_id
    init_db()
    db = SessionLocal()
    try:
        # Create test event, prediction, alert
        event = Event(
            event_type="network_flow",
            source_ip="192.168.1.50",
            destination_ip="10.0.0.1",
            raw_payload='{"protocol": "TCP", "dst_port": 445, "bytes_sent": 50000}'
        )
        db.add(event)
        db.flush()

        prediction = Prediction(
            event_id=event.id,
            model_name="IsolationForest_v1.0",
            score=0.92,
            threat_label="malicious",
            explanation="Extreme packet rate detected"
        )
        db.add(prediction)
        db.flush()

        alert = Alert(
            prediction_id=prediction.id,
            severity="CRITICAL",
            status="NEW",
            threat_type="NETWORK_FLOW",
            summary="[CRITICAL] Network anomaly detected"
        )
        db.add(alert)
        db.commit()
        test_alert_id = alert.id
    finally:
        db.close()

def test_get_analytics_metrics():
    client = app.test_client()
    response = client.get("/api/analytics/metrics")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert "metrics" in data
    metrics = data["metrics"]
    assert metrics["total_events"] >= 1
    assert metrics["total_alerts"] >= 1
    assert "events_delta_pct" in metrics
    assert "precision_rate" in metrics

def test_get_analytics_timeseries():
    client = app.test_client()
    response = client.get("/api/analytics/timeseries")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert "timeseries" in data
    ts = data["timeseries"]
    assert "velocity" in ts
    assert "weekly_threat_volume" in ts
    assert len(ts["weekly_threat_volume"]["days"]) == 7

def test_get_single_alert():
    global test_alert_id
    client = app.test_client()
    response = client.get(f"/api/alerts/{test_alert_id}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert "alert" in data
    assert data["alert"]["id"] == test_alert_id
    assert data["alert"]["severity"] == "CRITICAL"

def test_patch_single_alert():
    global test_alert_id
    client = app.test_client()
    response = client.patch(
        f"/api/alerts/{test_alert_id}",
        json={"status": "ACKNOWLEDGED", "analyst_feedback": "TRUE_POSITIVE"}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["alert"]["status"] == "ACKNOWLEDGED"
    assert data["alert"]["analyst_feedback"] == "TRUE_POSITIVE"

def test_get_dashboard_models():
    client = app.test_client()
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert "models" in data
    assert len(data["models"]) >= 3

def test_get_alerts_with_search_and_filters():
    client = app.test_client()
    response = client.get("/api/alerts?severity=CRITICAL&q=Network")
    assert response.status_code == 200
    data = response.get_json()
    assert "alerts" in data
    assert len(data["alerts"]) >= 1
    assert data["alerts"][0]["severity"] == "CRITICAL"
