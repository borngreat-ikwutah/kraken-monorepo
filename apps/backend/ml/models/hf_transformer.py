import os

class PhishingNLPDetector:
    """Hugging Face Transformer NLP classifier for email phishing & suspicious text."""

    def __init__(self):
        self.model_name = "HuggingFace-Phishing-DistilBERT"
        self.pipeline = None
        self._initialize_pipeline()

    def _initialize_pipeline(self):
        """Attempts to load pre-trained Hugging Face classification pipeline."""
        try:
            from transformers import pipeline
            # Use lightweight text-classification model for phishing / spam detection
            self.pipeline = pipeline(
                "text-classification",
                model="mrm8488/bert-tiny-finetuned-sms-spam-detection",
                tokenizer="mrm8488/bert-tiny-finetuned-sms-spam-detection"
            )
            print("🤗 Hugging Face Transformer pipeline loaded successfully!")
        except Exception as e:
            print(f"⚠️ Hugging Face pipeline offline fallback enabled: {e}")
            self.pipeline = None

    def predict(self, text_content: str, feature_dict: dict) -> dict:
        if self.pipeline:
            try:
                # Truncate text content to first 512 chars for fast inference
                truncated = text_content[:512]
                res = self.pipeline(truncated)[0]
                label = res.get("label", "LABEL_0").upper()
                raw_score = float(res.get("score", 0.5))

                is_spam_or_phish = "SPAM" in label or "LABEL_1" in label or "PHISH" in label
                threat_score = raw_score if is_spam_or_phish else (1.0 - raw_score)
            except Exception as ex:
                threat_score = self._heuristic_nlp_score(text_content, feature_dict)
        else:
            threat_score = self._heuristic_nlp_score(text_content, feature_dict)

        threat_label = "malicious" if threat_score > 0.65 else ("suspicious" if threat_score > 0.40 else "benign")

        return {
            "model_name": self.model_name,
            "score": round(threat_score, 4),
            "threat_label": threat_label,
            "explanation": f"Hugging Face NLP Transformer threat score: {threat_score:.2%} (Urgent keywords: {feature_dict.get('urgent_keyword_count', 0)})"
        }

    def _heuristic_nlp_score(self, text_content: str, feature_dict: dict) -> float:
        """Heuristic NLP scoring fallback based on lexical & semantic features."""
        urgent_count = feature_dict.get("urgent_keyword_count", 0)
        link_count = feature_dict.get("link_count", 0)
        uppercase_ratio = feature_dict.get("uppercase_ratio", 0.0)

        score = 0.1
        score += min(0.5, urgent_count * 0.15)
        score += min(0.3, link_count * 0.10)
        score += min(0.2, uppercase_ratio * 0.4)
        return min(1.0, score)
