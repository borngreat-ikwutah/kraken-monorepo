import os
from typing import Any, Optional
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

class RandomForestEvaluator:
    """
    Supervised Random Forest Classifier for URL, network, and log threat detection.
    Features an engineered model loader with automatic synthetic baseline training.
    """

    FEATURE_KEYS = [
        "url_length", "domain_length", "path_length", "subdomain_count",
        "num_dots", "num_hyphens", "num_at", "num_slash", "num_question",
        "num_equal", "num_digits", "has_ip", "has_suspicious_tld",
        "suspicious_token_count", "domain_entropy", "url_entropy"
    ]

    def __init__(self, model_path: Optional[str] = None):
        self.model_name = "RandomForestClassifier-v1.0"
        self.model_path = model_path or os.path.join(os.path.dirname(__file__), "saved_models", "rf_classifier.joblib")
        self.model: Optional[RandomForestClassifier] = None
        self._load_or_train_model()

    def _load_or_train_model(self) -> None:
        """Loads serialized model from disk via joblib or bootstraps an engineered baseline."""
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                print(f"🌲 Loaded Random Forest model from {self.model_path}")
                return
            except Exception as e:
                print(f"⚠️ Failed to load serialized model ({e}), retraining baseline...")

        self._bootstrap_synthetic_dataset()

    def _bootstrap_synthetic_dataset(self) -> None:
        """Trains an engineered Random Forest classifier on 16-dimensional baseline feature distributions."""
        self.model = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
        X_train: list[list[float]] = []
        y_train: list[int] = []

        # 1. Benign Samples (label=0)
        for _ in range(150):
            url_len = float(np.random.uniform(15, 45))
            dom_len = float(np.random.uniform(6, 18))
            path_len = float(np.random.uniform(0, 20))
            subdomains = float(np.random.choice([0.0, 1.0]))
            dots = float(np.random.choice([1.0, 2.0]))
            hyphens = float(np.random.choice([0.0, 1.0]))
            ats = 0.0
            slashes = float(np.random.choice([2.0, 3.0, 4.0]))
            questions = 0.0
            equals = 0.0
            digits = float(np.random.uniform(0, 3))
            has_ip = 0.0
            has_suspicious_tld = 0.0
            tokens = 0.0
            dom_entropy = float(np.random.uniform(1.2, 2.8))
            url_entropy = float(np.random.uniform(2.0, 3.5))

            vector = [
                url_len, dom_len, path_len, subdomains, dots, hyphens, ats, slashes,
                questions, equals, digits, has_ip, has_suspicious_tld, tokens,
                dom_entropy, url_entropy
            ]
            X_train.append(vector)
            y_train.append(0)

        # 2. Malicious / Phishing Samples (label=1)
        for _ in range(150):
            url_len = float(np.random.uniform(70, 220))
            dom_len = float(np.random.uniform(20, 60))
            path_len = float(np.random.uniform(25, 100))
            subdomains = float(np.random.uniform(2.0, 5.0))
            dots = float(np.random.uniform(3.0, 7.0))
            hyphens = float(np.random.uniform(2.0, 8.0))
            ats = float(np.random.choice([0.0, 1.0]))
            slashes = float(np.random.uniform(4.0, 9.0))
            questions = float(np.random.choice([0.0, 1.0, 2.0]))
            equals = float(np.random.choice([0.0, 1.0, 3.0]))
            digits = float(np.random.uniform(6.0, 30.0))
            has_ip = float(np.random.choice([0.0, 0.0, 1.0]))
            has_suspicious_tld = float(np.random.choice([0.0, 1.0, 1.0]))
            tokens = float(np.random.uniform(2.0, 6.0))
            dom_entropy = float(np.random.uniform(3.6, 4.9))
            url_entropy = float(np.random.uniform(4.2, 5.5))

            vector = [
                url_len, dom_len, path_len, subdomains, dots, hyphens, ats, slashes,
                questions, equals, digits, has_ip, has_suspicious_tld, tokens,
                dom_entropy, url_entropy
            ]
            X_train.append(vector)
            y_train.append(1)

        self.model.fit(X_train, y_train)

    def evaluate(self, feature_dict: dict[str, float]) -> dict[str, Any]:
        """
        Extracts the 16-dimensional vector from feature_dict and runs inference.
        Guarantees strict return type of dict[str, Any].
        """
        features_vector: list[float] = [
            float(feature_dict.get(key, 0.0)) for key in self.FEATURE_KEYS
        ]

        if not self.model:
            self._bootstrap_synthetic_dataset()

        assert self.model is not None
        probs = self.model.predict_proba([features_vector])[0]
        malicious_prob = float(probs[1])

        threat_label = "malicious" if malicious_prob >= 0.65 else ("suspicious" if malicious_prob >= 0.40 else "benign")

        return {
            "model_name": self.model_name,
            "score": round(malicious_prob, 4),
            "threat_label": threat_label,
            "explanation": f"Random Forest malicious probability: {malicious_prob:.2%} based on {len(self.FEATURE_KEYS)} lexical dimensions"
        }


# Backwards compatibility alias
ThreatClassifier = RandomForestEvaluator
