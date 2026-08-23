import math
import re
from urllib.parse import urlparse

class UrlFeatureExtractor:
    """Extracts lexical, structural, statistical, and entropy features from URLs."""

    SUSPICIOUS_KEYWORDS = [
        "login", "signin", "verify", "verification", "account", "update", "secure",
        "banking", "authenticate", "password", "credential", "wallet", "support",
        "confirm", "security", "action", "alert", "billing", "token", "auth",
        "recover", "passcode", "identity", "paypal", "microsoft", "google", "apple"
    ]

    SUSPICIOUS_TLDS = [
        ".xyz", ".top", ".work", ".click", ".pw", ".cc", ".tk", ".ml", ".ga",
        ".cf", ".gq", ".ru", ".su", ".fit", ".rest", ".online", ".club", ".vip"
    ]

    @staticmethod
    def _calculate_shannon_entropy(text: str) -> float:
        """Calculates Shannon Entropy in bits for a given string."""
        if not text:
            return 0.0
        entropy = 0.0
        text_len = len(text)
        for char in set(text):
            p = text.count(char) / text_len
            entropy -= p * math.log2(p)
        return round(entropy, 4)

    @staticmethod
    def extract(url_string: str) -> dict[str, float]:
        """
        Extracts 16 lexical and statistical dimensions from a URL.
        Guarantees strict return type of dict[str, float].
        """
        url = (url_string or "").strip()
        if not url:
            return {
                "url_length": 0.0,
                "domain_length": 0.0,
                "path_length": 0.0,
                "subdomain_count": 0.0,
                "num_dots": 0.0,
                "num_hyphens": 0.0,
                "num_at": 0.0,
                "num_slash": 0.0,
                "num_question": 0.0,
                "num_equal": 0.0,
                "num_digits": 0.0,
                "has_ip": 0.0,
                "has_suspicious_tld": 0.0,
                "suspicious_token_count": 0.0,
                "domain_entropy": 0.0,
                "url_entropy": 0.0,
            }

        # Normalize URL scheme if missing to allow accurate urlparse
        if not url.startswith("http://") and not url.startswith("https://"):
            parsed = urlparse("http://" + url)
        else:
            parsed = urlparse(url)

        domain = parsed.netloc or parsed.path.split("/")[0]
        # Strip port if present in domain
        if ":" in domain:
            domain = domain.split(":")[0]

        path = parsed.path or ""
        lower_url = url.lower()
        lower_domain = domain.lower()

        # 1. Lexical Dimensions
        url_length = len(url)
        domain_length = len(domain)
        path_length = len(path)

        # Subdomain count: parts before the second-level domain
        domain_parts = [p for p in domain.split(".") if p]
        subdomain_count = max(0, len(domain_parts) - 2)

        num_dots = url.count(".")
        num_hyphens = url.count("-")
        num_at = url.count("@")
        num_slash = url.count("/")
        num_question = url.count("?")
        num_equal = url.count("=")
        num_digits = sum(1 for c in url if c.isdigit())

        # 2. Hostname Characteristics
        # Detect IPv4 address hostname
        has_ip = 1.0 if re.search(r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$", domain) or re.search(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", domain) else 0.0

        # Check Suspicious TLD
        has_suspicious_tld = 1.0 if any(lower_domain.endswith(tld) for tld in UrlFeatureExtractor.SUSPICIOUS_TLDS) else 0.0

        # 3. Suspicious Token Matching
        suspicious_token_count = 0.0
        for kw in UrlFeatureExtractor.SUSPICIOUS_KEYWORDS:
            if kw in lower_url:
                suspicious_token_count += 1.0

        # 4. Shannon Entropy (Domain & Full URL)
        domain_entropy = UrlFeatureExtractor._calculate_shannon_entropy(domain)
        url_entropy = UrlFeatureExtractor._calculate_shannon_entropy(url)

        return {
            "url_length": float(url_length),
            "domain_length": float(domain_length),
            "path_length": float(path_length),
            "subdomain_count": float(subdomain_count),
            "num_dots": float(num_dots),
            "num_hyphens": float(num_hyphens),
            "num_at": float(num_at),
            "num_slash": float(num_slash),
            "num_question": float(num_question),
            "num_equal": float(num_equal),
            "num_digits": float(num_digits),
            "has_ip": float(has_ip),
            "has_suspicious_tld": float(has_suspicious_tld),
            "suspicious_token_count": float(suspicious_token_count),
            "domain_entropy": float(domain_entropy),
            "url_entropy": float(url_entropy),
        }
