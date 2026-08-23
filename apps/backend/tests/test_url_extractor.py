import pytest
from ml.extractors.url_extractor import UrlFeatureExtractor

def test_extract_benign_url():
    """Verify lexical extraction on standard benign URLs."""
    url = "https://github.com/microsoft/vscode"
    features = UrlFeatureExtractor.extract(url)

    assert isinstance(features, dict)
    assert features["url_length"] == float(len(url))
    assert features["domain_length"] == float(len("github.com"))
    assert features["has_ip"] == 0.0
    assert features["has_suspicious_tld"] == 0.0
    assert features["subdomain_count"] == 0.0
    assert features["num_dots"] == 1.0
    assert features["num_slash"] == 4.0
    assert features["domain_entropy"] > 0.0

def test_extract_malicious_dga_entropy():
    """Verify Shannon entropy accurately detects high-entropy DGA domains."""
    dga_url = "http://q1w2e3r4t5y6u7i8o9p0-xyz123abc.xyz/login"
    features = UrlFeatureExtractor.extract(dga_url)

    # High entropy expected on randomized character sequences
    assert features["domain_entropy"] >= 3.5
    assert features["has_suspicious_tld"] == 1.0
    assert features["suspicious_token_count"] >= 1.0 # "login"
    assert features["num_hyphens"] >= 1.0

def test_extract_credential_harvesting_phish():
    """Verify detection of credential harvesting keywords and suspicious TLDs."""
    phish_url = "http://secure-login.micros0ft-verify-account.ru/oauth2/token-refresh"
    features = UrlFeatureExtractor.extract(phish_url)

    assert features["has_suspicious_tld"] == 1.0 # ".ru"
    assert features["suspicious_token_count"] >= 3.0 # "login", "verify", "account", "token", "secure", "microsoft"
    assert features["subdomain_count"] >= 1.0
    assert features["num_hyphens"] >= 3.0

def test_extract_ip_hostname_evasion():
    """Verify detection of raw IP address in place of hostname."""
    ip_url = "http://192.168.1.105:8080/admin/auth?token=12345"
    features = UrlFeatureExtractor.extract(ip_url)

    assert features["has_ip"] == 1.0
    assert features["num_question"] == 1.0
    assert features["num_equal"] == 1.0
    assert features["num_digits"] >= 10.0
    assert features["suspicious_token_count"] >= 1.0 # "auth", "token"

def test_extract_empty_and_edge_cases():
    """Verify zero/empty URL edge cases do not crash."""
    empty_features = UrlFeatureExtractor.extract("")
    assert empty_features["url_length"] == 0.0
    assert empty_features["domain_entropy"] == 0.0

    no_scheme_url = "paypal-security-alert.click/recover"
    no_scheme_features = UrlFeatureExtractor.extract(no_scheme_url)
    assert no_scheme_features["domain_length"] == float(len("paypal-security-alert.click"))
    assert no_scheme_features["has_suspicious_tld"] == 1.0
    assert no_scheme_features["suspicious_token_count"] >= 2.0
