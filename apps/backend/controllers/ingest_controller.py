import json
from typing import Any

from db.database import SessionLocal
from db.models import Alert, Event, Feature, Prediction
from ml.extractors import NetworkFeatureExtractor, TextFeatureExtractor, UrlFeatureExtractor
from ml.models import ModelRegistry

class IngestController:
    """Controller handling telemetry ingestion, feature extraction, ML inference, and DB transactions."""

    _model_registry: ModelRegistry | None = None

    @classmethod
    def get_model_registry(cls) -> ModelRegistry:
        if cls._model_registry is None:
            cls._model_registry = ModelRegistry()
        return cls._model_registry

    @classmethod
    def ingest_event(cls, data: dict[str, Any]) -> tuple[dict[str, Any], int]:
        """
        Ingests a security telemetry event (URL, network flow, email, or log),
        extracts features, evaluates threat via ML/Ensemble models, and transactionally
        persists the Event, Feature, Prediction, and Alert (if threshold reached).
        """
        event_type = (data.get("event_type") or "network_flow").strip() # network_flow, url, email, log
        source_ip = data.get("source_ip", "192.168.1.100")
        destination_ip = data.get("destination_ip", "10.0.0.1")
        raw_payload = data.get("payload", "")

        if isinstance(raw_payload, dict):
            payload_str = json.dumps(raw_payload)
            payload_data = raw_payload
        else:
            payload_str = str(raw_payload)
            payload_data = {"raw": payload_str}

        # 1. Feature Extraction based on event type
        features: dict[str, float]
        if event_type == "url":
            features = UrlFeatureExtractor.extract(payload_str)
        elif event_type == "network_flow":
            features = NetworkFeatureExtractor.extract(payload_data)
        else: # email, log, text
            features = TextFeatureExtractor.extract(payload_str)

        registry = cls.get_model_registry()

        # 2. Execute ML Engine Inference
        try:
            inference_result = registry.run_inference(event_type, payload_str, features)
            top_pred = inference_result["top_prediction"]
            severity = inference_result["severity"]
        except Exception as e:
            return {"status": "error", "message": f"ML inference failed: {str(e)}"}, 500

        # 3. Transactional Persistence
        db = SessionLocal()
        try:
            # Persist Event
            event_obj = Event(
                event_type=event_type,
                source_ip=source_ip,
                destination_ip=destination_ip,
                raw_payload=payload_str
            )
            db.add(event_obj)
            db.flush()

            # Persist Features
            feature_obj = Feature(
                event_id=event_obj.id,
                feature_json=json.dumps(features)
            )
            db.add(feature_obj)
            db.flush()

            # Persist Prediction
            prediction_obj = Prediction(
                event_id=event_obj.id,
                model_name=top_pred["model_name"],
                score=float(top_pred["score"]),
                threat_label=top_pred["threat_label"],
                explanation=top_pred.get("explanation")
            )
            db.add(prediction_obj)
            db.flush()

            # Generate Alert for Medium, High, Critical Threats
            alert_dict: dict[str, Any] | None = None
            if severity in ["CRITICAL", "HIGH", "MEDIUM"]:
                score_pct = float(top_pred["score"])
                summary_text = f"[{severity}] Potential {event_type.upper()} threat detected by {top_pred['model_name']} (Score: {score_pct:.2%})"
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

            return {
                "status": "success",
                "event_id": event_obj.id,
                "prediction": top_pred,
                "severity": severity,
                "alert": alert_dict,
                "features": features,
                "all_predictions": inference_result.get("all_predictions", [top_pred]),
                "inference": inference_result
            }, 201

        except Exception as e:
            db.rollback()
            return {"status": "error", "message": f"Database transaction failed: {str(e)}"}, 500
        finally:
            db.close()

    @classmethod
    def predict_realtime(cls, data: dict[str, Any]) -> tuple[dict[str, Any], int]:
        """Runs real-time inference without DB persistence."""
        event_type = (data.get("event_type") or "network_flow").strip()
        raw_payload = data.get("payload", "")

        if isinstance(raw_payload, dict):
            payload_data = raw_payload
            payload_str = json.dumps(raw_payload)
        else:
            payload_str = str(raw_payload)
            payload_data = {"raw": payload_str}

        if event_type == "url":
            features = UrlFeatureExtractor.extract(payload_str)
        elif event_type == "network_flow":
            features = NetworkFeatureExtractor.extract(payload_data)
        else:
            features = TextFeatureExtractor.extract(payload_str)

        registry = cls.get_model_registry()
        try:
            inference_result = registry.run_inference(event_type, payload_str, features)
            return {
                "status": "success",
                "features": features,
                "inference": inference_result
            }, 200
        except Exception as e:
            return {"status": "error", "message": f"Prediction failed: {str(e)}"}, 500

    @classmethod
    def get_events(
        cls,
        limit: int = 50,
        offset: int = 0,
        event_type: str | None = None,
        search: str | None = None,
    ) -> tuple[dict[str, Any], int]:
        """Returns persisted telemetry logs with latest prediction + alert (if any)."""
        db = SessionLocal()
        try:
            query = db.query(Event)
            if event_type and event_type.upper() != "ALL":
                query = query.filter(Event.event_type == event_type)
            if search:
                search_pattern = f"%{search}%"
                query = query.filter(
                    (Event.raw_payload.ilike(search_pattern))
                    | (Event.source_ip.ilike(search_pattern))
                )

            total_count: int = query.count()
            events: list[Event] = (
                query.order_by(Event.created_at.desc()).offset(offset).limit(limit).all()
            )

            event_dicts: list[dict[str, Any]] = []
            for event_obj in events:
                prediction_obj: Prediction | None = (
                    db.query(Prediction)
                    .filter(Prediction.event_id == event_obj.id)
                    .order_by(Prediction.created_at.desc())
                    .first()
                )
                alert_obj: Alert | None = None
                if prediction_obj is not None:
                    alert_obj = (
                        db.query(Alert)
                        .filter(Alert.prediction_id == prediction_obj.id)
                        .order_by(Alert.created_at.desc())
                        .first()
                    )
                event_dicts.append(
                    {
                        "id": event_obj.id,
                        "event_type": event_obj.event_type,
                        "source_ip": event_obj.source_ip,
                        "destination_ip": event_obj.destination_ip,
                        "raw_payload": event_obj.raw_payload,
                        "created_at": event_obj.created_at.isoformat()
                        if event_obj.created_at
                        else None,
                        "prediction": {
                            "model_name": prediction_obj.model_name,
                            "score": prediction_obj.score,
                            "threat_label": prediction_obj.threat_label,
                            "explanation": prediction_obj.explanation,
                        }
                        if prediction_obj is not None
                        else None,
                        "alert": {
                            "id": alert_obj.id,
                            "severity": alert_obj.severity,
                            "status": alert_obj.status,
                        }
                        if alert_obj is not None
                        else None,
                    }
                )

            return {
                "status": "success",
                "count": total_count,
                "limit": limit,
                "offset": offset,
                "events": event_dicts,
            }, 200
        except Exception as e:
            return {"status": "error", "message": f"Failed to fetch telemetry logs: {str(e)}"}, 500
        finally:
            db.close()
