import re

class TextFeatureExtractor:
    """Extracts text, email, and log features for threat classification."""

    URGENT_KEYWORDS = [
        "urgent", "verify", "account", "suspended", "password", "bank", "login",
        "update", "security", "action required", "billing", "immediate", "unauthorized"
    ]

    @staticmethod
    def extract(text_content: str) -> dict:
        text = text_content.strip()
        lower_text = text.lower()
        length = len(text)
        word_count = len(text.split())

        # Count urgent phishing keywords
        urgent_count = sum(lower_text.count(kw) for kw in TextFeatureExtractor.URGENT_KEYWORDS)

        # Count links / URLs in text
        link_count = len(re.findall(r"https?://[^\s]+", text))

        # Upper case ratio (often indicates aggressive phishing or ALL-CAPS alert logs)
        upper_chars = sum(1 for c in text if c.isupper())
        upper_ratio = upper_chars / max(length, 1)

        return {
            "text_length": float(length),
            "word_count": float(word_count),
            "urgent_keyword_count": float(urgent_count),
            "link_count": float(link_count),
            "uppercase_ratio": round(upper_ratio, 4)
        }
