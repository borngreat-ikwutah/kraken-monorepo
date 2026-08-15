import numpy as np
from sklearn.ensemble import RandomForestClassifier

class ThreatClassifier:
    """Supervised Random Forest Classifier for URL and Log threat detection."""

    def __init__(self):
        self.model_name = "RandomForestClassifier-v1.0"
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self._bootstrap_synthetic_dataset()

    def _bootstrap_synthetic_dataset(self):
        """Train Random Forest on baseline URL & log features."""
        # Feature vector: [url_length, domain_length, num_dots, num_hyphens, num_at, has_ip, domain_entropy, has_suspicious_tld]
        X_train = []
        y_train = []

        # Benign URL samples (label=0)
        for _ in range(50):
            X_train.append([np.random.uniform(15, 35), np.random.uniform(6, 15), 1.0, 0.0, 0.0, 0.0, np.random.uniform(1.0, 2.5), 0.0])
            y_train.append(0)

        # Malicious URL samples (label=1)
        for _ in range(50):
            X_train.append([np.random.uniform(80, 200), np.random.uniform(20, 50), np.random.uniform(3, 8), np.random.uniform(2, 6), np.random.choice([0.0, 1.0]), np.random.choice([0.0, 1.0]), np.random.uniform(3.5, 5.0), 1.0])
            y_train.append(1)

        self.model.fit(X_train, y_train)

    def predict(self, feature_dict: dict) -> dict:
        features_vector = [
            feature_dict.get("url_length", 20.0),
            feature_dict.get("domain_length", 10.0),
            feature_dict.get("num_dots", 1.0),
            feature_dict.get("num_hyphens", 0.0),
            feature_dict.get("num_at", 0.0),
            feature_dict.get("has_ip", 0.0),
            feature_dict.get("domain_entropy", 2.0),
            feature_dict.get("has_suspicious_tld", 0.0),
        ]

        probs = self.model.predict_proba([features_vector])[0]
        malicious_prob = float(probs[1])

        threat_label = "malicious" if malicious_prob > 0.65 else ("suspicious" if malicious_prob > 0.40 else "benign")

        return {
            "model_name": self.model_name,
            "score": round(malicious_prob, 4),
            "threat_label": threat_label,
            "explanation": f"Random Forest malicious probability: {malicious_prob:.2%} based on lexical URL features"
        }
