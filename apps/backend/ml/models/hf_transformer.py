from typing import Any, Optional

class TransformerEvaluator:
    """
    Hugging Face Transformer NLP & Text Sequence Classifier.
    Evaluates raw URL strings, phishing emails, and log messages directly.
    """

    def __init__(self, model_identifier: str = "mrm8488/bert-tiny-finetuned-sms-spam-detection"):
        self.model_name = "HuggingFace-DistilBERT-SequenceClassifier"
        self.model_identifier = model_identifier
        self.pipeline: Optional[Any] = None
        self._initialize_pipeline()

    def _initialize_pipeline(self) -> None:
        """Attempts to load pre-trained Hugging Face classification pipeline."""
        try:
            import importlib
            transformers_module = importlib.import_module("transformers")
            pipeline_func = getattr(transformers_module, "pipeline", None)
            if pipeline_func is not None:
                self.pipeline = pipeline_func(
                    "text-classification",
                    model=self.model_identifier,
                    tokenizer=self.model_identifier
                )
                print("🤗 Hugging Face Transformer pipeline loaded successfully!")
        except Exception as e:
            print(f"⚠️ Hugging Face pipeline offline fallback enabled: {e}")
            self.pipeline = None

    def predict(self, text_content: str, feature_dict: dict[str, float]) -> dict[str, Any]:
        """Backward-compatible alias for evaluate()."""
        return self.evaluate(text_content, feature_dict)

    def evaluate(self, raw_text: str, feature_dict: dict[str, float]) -> dict[str, Any]:
        """
        Runs sequence classification inference on raw URL or payload text.
        Guarantees strict return type of dict[str, Any].
        """
        text = (raw_text or "").strip()
        if self.pipeline and text:
            try:
                # Fast inference on truncated sequence (512 chars)
                truncated = text[:512]
                res = self.pipeline(truncated)[0]
                label = str(res.get("label", "LABEL_0")).upper()
                raw_score = float(res.get("score", 0.5))

                is_spam_or_phish = "SPAM" in label or "LABEL_1" in label or "PHISH" in label
                threat_score = raw_score if is_spam_or_phish else (1.0 - raw_score)
            except Exception:
                threat_score = self._heuristic_nlp_score(text, feature_dict)
        else:
            threat_score = self._heuristic_nlp_score(text, feature_dict)

        threat_label = "malicious" if threat_score >= 0.65 else ("suspicious" if threat_score >= 0.40 else "benign")

        return {
            "model_name": self.model_name,
            "score": round(threat_score, 4),
            "threat_label": threat_label,
            "explanation": f"Transformer Sequence Classifier score: {threat_score:.2%} (Keywords: {feature_dict.get('suspicious_token_count', 0):.0f})"
        }

    def _heuristic_nlp_score(self, text: str, feature_dict: dict[str, float]) -> float:
        """Heuristic semantic scoring fallback when transformer weights are unavailable."""
        token_count = feature_dict.get("suspicious_token_count", 0.0)
        has_suspicious_tld = feature_dict.get("has_suspicious_tld", 0.0)
        has_ip = feature_dict.get("has_ip", 0.0)
        url_entropy = feature_dict.get("url_entropy", 0.0)

        score = 0.05
        # Add score from suspicious credential harvesting tokens
        score += min(0.45, token_count * 0.15)
        # Add score from abnormal TLD
        score += 0.25 if has_suspicious_tld > 0.0 else 0.0
        # Add score from raw IP hostname evasion
        score += 0.20 if has_ip > 0.0 else 0.0
        # Add score from high Shannon entropy
        if url_entropy > 4.0:
            score += min(0.20, (url_entropy - 4.0) * 0.2)

        return min(1.0, max(0.0, score))


# Backwards compatibility alias
PhishingNLPDetector = TransformerEvaluator
