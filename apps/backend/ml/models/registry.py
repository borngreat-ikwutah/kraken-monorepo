from typing import Any
from .ensemble_scorer import EnsembleScorer
from .hf_transformer import TransformerEvaluator, PhishingNLPDetector
from .isolation_forest import NetworkAnomalyDetector
from .random_forest import RandomForestEvaluator, ThreatClassifier

class ModelRegistry:
    """Registry managing model loading, versioning, and execution."""

    def __init__(self):
        print("🧠 Initializing ML Model Registry...")
        self.network_detector = NetworkAnomalyDetector()
        self.rf_evaluator = RandomForestEvaluator()
        self.transformer_evaluator = TransformerEvaluator()
        # Aliases
        self.threat_classifier = self.rf_evaluator
        self.nlp_detector = self.transformer_evaluator
        print("✅ ML Model Registry fully loaded.")

    def run_inference(self, event_type: str, raw_payload: str, features: dict[str, Any]) -> dict[str, Any]:
        """
        Dispatches inference to appropriate models based on event type and executes ensemble consensus.
        Guarantees strict return type of dict[str, Any].
        """
        # Convert any generic feature map to strictly float values
        features_float: dict[str, float] = {
            k: float(v) for k, v in features.items() if isinstance(v, (int, float, bool))
        }

        predictions: list[dict[str, Any]] = []

        if event_type == "url":
            # Dual-model evaluation: Transformer + Random Forest
            t_pred = self.transformer_evaluator.evaluate(raw_payload, features_float)
            rf_pred = self.rf_evaluator.evaluate(features_float)
            ensemble_pred = EnsembleScorer.score_url_threat(t_pred, rf_pred, features_float)

            return {
                "top_prediction": ensemble_pred,
                "all_predictions": [t_pred, rf_pred, ensemble_pred],
                "severity": ensemble_pred["severity"]
            }

        elif event_type in ["email", "text", "log"]:
            # Dual-model evaluation: Transformer + Random Forest
            t_pred = self.transformer_evaluator.evaluate(raw_payload, features_float)
            rf_pred = self.rf_evaluator.evaluate(features_float)
            ensemble_pred = EnsembleScorer.score_text_threat(t_pred, rf_pred, features_float)

            return {
                "top_prediction": ensemble_pred,
                "all_predictions": [t_pred, rf_pred, ensemble_pred],
                "severity": ensemble_pred["severity"]
            }

        elif event_type == "network_flow":
            iso_pred = self.network_detector.predict(features_float)
            rf_pred = self.rf_evaluator.evaluate(features_float)
            predictions = [iso_pred, rf_pred]

        else:
            pred = self.rf_evaluator.evaluate(features_float)
            predictions.append(pred)

        top_prediction = max(predictions, key=lambda x: x["score"])
        score = float(top_prediction["score"])

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
