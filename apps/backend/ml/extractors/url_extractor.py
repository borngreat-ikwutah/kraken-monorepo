import re
import math
from urllib.parse import urlparse

class UrlFeatureExtractor:
    """Extracts lexical and statistical features from URLs."""

    @staticmethod
    def extract(url_string: str) -> dict:
        url = url_string.strip()
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path.split('/')[0]

        url_length = len(url)
        domain_length = len(domain)
        num_dots = url.count(".")
        num_hyphens = url.count("-")
        num_at = url.count("@")
        num_question = url.count("?")
        num_equal = url.count("=")
        num_slash = url.count("/")

        # Check IP address presence in domain
        has_ip = 1.0 if re.search(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", domain) else 0.0

        # Check domain Shannon Entropy
        entropy = 0.0
        if domain:
            for char in set(domain):
                p = domain.count(char) / len(domain)
                entropy -= p * math.log2(p)

        # Suspicious TLD check
        suspicious_tlds = [".xyz", ".top", ".work", ".click", ".pw", ".cc", ".tk", ".ml", ".ga"]
        has_suspicious_tld = 1.0 if any(domain.endswith(tld) for tld in suspicious_tlds) else 0.0

        return {
            "url_length": float(url_length),
            "domain_length": float(domain_length),
            "num_dots": float(num_dots),
            "num_hyphens": float(num_hyphens),
            "num_at": float(num_at),
            "num_slash": float(num_slash),
            "has_ip": has_ip,
            "domain_entropy": round(entropy, 4),
            "has_suspicious_tld": has_suspicious_tld
        }
