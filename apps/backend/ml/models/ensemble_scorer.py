from typing import Any

class EnsembleScorer:
    """
    Combines predictions from multiple distinct ML models using weighted consensus scoring.
    Fuses NLP semantic understanding (Transformer) with structural features (Random Forest / Isolation Forest).
    """

    @staticmethod
    def score_url_threat(
        transformer_result: dict[str, Any],
        rf_result: dict[str, Any],
        features: dict[str, float]
    ) -> dict[str, Any]:
        """
        Combines Transformer (weight 0.6) and Random Forest (weight 0.4) scores.
        Applies heuristic boosts for high-entropy / multiple threat signals.
        """
        t_score = float(transformer_result.get("score", 0.0))
        rf_score = float(rf_result.get("score", 0.0))

        # Weighted base consensus
        combined_score = (0.60 * t_score) + (0.40 * rf_score)

        # Signal boost if both models agree or high-risk signals are present
        if t_score >= 0.70 and rf_score >= 0.70:
            combined_score = min(1.0, combined_score * 1.1)

        if features.get("has_ip", 0.0) > 0 and features.get("suspicious_token_count", 0.0) >= 2.0:
            combined_score = min(1.0, max(combined_score, 0.85))

        # Severity categorization
        if combined_score >= 0.80:
            severity = "CRITICAL"
            threat_label = "malicious"
        elif combined_score >= 0.60:
            severity = "HIGH"
            threat_label = "malicious"
        elif combined_score >= 0.40:
            severity = "MEDIUM"
            threat_label = "suspicious"
        else:
            severity = "LOW"
            threat_label = "benign"

        explanation_parts: list[str] = []
        if features.get("domain_entropy", 0.0) >= 3.8:
            explanation_parts.append(f"High domain entropy ({features.get('domain_entropy', 0.0):.2f})")
        if features.get("suspicious_token_count", 0.0) > 0:
            explanation_parts.append(f"{features.get('suspicious_token_count', 0):.0f} suspicious tokens")
        if features.get("has_suspicious_tld", 0.0) > 0:
            explanation_parts.append("Abnormal TLD")
        if features.get("has_ip", 0.0) > 0:
            explanation_parts.append("Raw IP hostname")

        explanation_str = ", ".join(explanation_parts) if explanation_parts else "Standard URL baseline features"

        return {
            "model_name": "Ensemble (Transformer + RandomForest)",
            "score": round(combined_score, 4),
            "threat_label": threat_label,
            "severity": severity,
            "explanation": f"Consensus score: {combined_score:.2%} ({explanation_str})",
            "models_evaluated": [
                transformer_result,
                rf_result
            ]
        }
