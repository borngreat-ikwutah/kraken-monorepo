from typing import Any
import numpy as np
from sklearn.ensemble import IsolationForest

class NetworkAnomalyDetector:
    """Isolation Forest unsupervised anomaly detector for network telemetry."""

    def __init__(self):
        self.model_name = "IsolationForest-v1.0"
        self.model = IsolationForest(contamination="auto", random_state=42)
        self._bootstrap_synthetic_baseline()

    def _bootstrap_synthetic_baseline(self) -> None:
        """Train Isolation Forest on baseline normal network traffic feature vectors."""
        # Baseline normal features: [bytes, packets, duration, bytes/sec, pkts/sec, byte_ratio, dst_port, is_suspicious_port, port_entropy]
        normal_samples: list[list[float]] = []
        for _ in range(100):
            bytes_val = float(np.random.normal(5000, 1000))
            packets_val = float(np.random.normal(50, 10))
            duration_val = float(np.random.uniform(0.1, 5.0))
            bytes_sec = bytes_val / duration_val
            pkts_sec = packets_val / duration_val
            byte_ratio = float(np.random.uniform(0.5, 2.0))
            dst_port = float(np.random.choice([80, 443, 53, 22]))
            is_suspicious = 0.0
            port_entropy = 1.2
            normal_samples.append([bytes_val, packets_val, duration_val, bytes_sec, pkts_sec, byte_ratio, dst_port, is_suspicious, port_entropy])
        
        self.model.fit(normal_samples)

    def predict(self, feature_dict: dict[str, float]) -> dict[str, Any]:
        """
        Runs unsupervised anomaly detection on network flow features.
        Guarantees strict return type of dict[str, Any].
        """
        features_vector: list[float] = [
            float(feature_dict.get("total_bytes", 5000.0)),
            float(feature_dict.get("total_packets", 50.0)),
            float(feature_dict.get("duration", 1.0)),
            float(feature_dict.get("bytes_per_second", 5000.0)),
            float(feature_dict.get("packets_per_second", 50.0)),
            float(feature_dict.get("byte_ratio", 1.0)),
            float(feature_dict.get("dst_port", 80.0)),
            float(feature_dict.get("is_suspicious_port", 0.0)),
            float(feature_dict.get("port_entropy", 1.2)),
        ]

        # Decision function returns negative values for anomalies, positive for normal
        decision_score = float(self.model.decision_function([features_vector])[0])
        # Convert decision function score to normalized anomaly score in [0.0, 1.0]
        # Lower decision_score -> higher anomaly score
        anomaly_score = max(0.0, min(1.0, (0.2 - decision_score) / 0.4))

        threat_label = "malicious" if anomaly_score > 0.65 else ("suspicious" if anomaly_score > 0.45 else "benign")

        return {
            "model_name": self.model_name,
            "score": round(anomaly_score, 4),
            "threat_label": threat_label,
            "explanation": f"Isolation Forest decision score: {decision_score:.3f} (Anomaly score: {anomaly_score:.2%})"
        }

    def evaluate(self, feature_dict: dict[str, float]) -> dict[str, Any]:
        """Alias for predict to match ModelEvaluator interface."""
        return self.predict(feature_dict)


# Backwards compatibility alias
AnomalyDetector = NetworkAnomalyDetector

