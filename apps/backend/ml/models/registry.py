from .isolation_forest import NetworkAnomalyDetector
from .random_forest import ThreatClassifier
from .hf_transformer import PhishingNLPDetector

class ModelRegistry:
    """Registry managing model loading, versioning, and execution."""

    def __init__(self):
        print("🧠 Initializing ML Model Registry...")
        self.network_detector = NetworkAnomalyDetector()
        self.threat_classifier = ThreatClassifier()
        self.nlp_detector = PhishingNLPDetector()
        print("✅ ML Model Registry fully loaded.")

    def run_inference(self, event_type: str, raw_payload: str, features: dict) -> dict:
        """Dispatches inference to appropriate model(s) based on event type."""
        predictions = []

        if event_type == "network_flow":
            pred = self.network_detector.predict(features)
            predictions.append(pred)
        elif event_type == "url":
            pred = self.threat_classifier.predict(features)
            predictions.append(pred)
        elif event_type in ["email", "text", "log"]:
            pred = self.nlp_detector.predict(raw_payload, features)
            predictions.append(pred)
        else:
            # Fallback run all extractors
            pred = self.threat_classifier.predict(features)
            predictions.append(pred)

        # Calculate ensemble / max score
        top_prediction = max(predictions, key=lambda x: x["score"])

        # Determine severity score threshold
        score = top_prediction["score"]
        if score >= 0.80:
            severity = "CRITICAL"
        elif score >= 0.60:
            severity = "HIGH"
        elif score >= 0.40:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        return {
            "top_prediction": top_prediction,
            "all_predictions": predictions,
            "severity": severity
        }
