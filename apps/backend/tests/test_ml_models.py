import pytest
from ml.extractors.url_extractor import UrlFeatureExtractor
from ml.models.ensemble_scorer import EnsembleScorer
from ml.models.hf_transformer import TransformerEvaluator
from ml.models.random_forest import RandomForestEvaluator
from ml.models.registry import ModelRegistry

def test_transformer_evaluator_benign():
    """Verify TransformerEvaluator on standard benign URL."""
    evaluator = TransformerEvaluator()
    url = "https://github.com/microsoft/vscode"
    features = UrlFeatureExtractor.extract(url)
    result = evaluator.evaluate(url, features)

    assert isinstance(result, dict)
    assert "score" in result
    assert result["threat_label"] in ["benign", "suspicious", "malicious"]
    assert result["score"] < 0.50

def test_transformer_evaluator_malicious():
    """Verify TransformerEvaluator flags malicious credential phishing URL."""
    evaluator = TransformerEvaluator()
    url = "http://login-verify-account.paypal-security.xyz/auth/signin"
    features = UrlFeatureExtractor.extract(url)
    result = evaluator.evaluate(url, features)

    assert result["score"] >= 0.50
    assert result["threat_label"] in ["suspicious", "malicious"]

def test_random_forest_evaluator():
    """Verify RandomForestEvaluator produces scores across feature dimensions."""
    evaluator = RandomForestEvaluator()
    benign_url = "https://wikipedia.org/wiki/Computer_security"
    malicious_url = "http://x7k9p2m1-secure-auth.tk/verify?id=99281&token=abc"

    benign_features = UrlFeatureExtractor.extract(benign_url)
    malicious_features = UrlFeatureExtractor.extract(malicious_url)

    benign_res = evaluator.evaluate(benign_features)
    malicious_res = evaluator.evaluate(malicious_features)

    assert isinstance(benign_res, dict)
    assert isinstance(malicious_res, dict)
    assert malicious_res["score"] >= benign_res["score"]

def test_ensemble_scorer_consensus():
    """Verify EnsembleScorer combines Transformer and Random Forest outputs."""
    url = "http://secure-login.micros0ft-verify-account.ru/oauth2/token-refresh"
    features = UrlFeatureExtractor.extract(url)

    t_eval = TransformerEvaluator()
    rf_eval = RandomForestEvaluator()

    t_res = t_eval.evaluate(url, features)
    rf_res = rf_eval.evaluate(features)

    consensus = EnsembleScorer.score_url_threat(t_res, rf_res, features)
    assert isinstance(consensus, dict)
    assert "score" in consensus
    assert consensus["severity"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    assert len(consensus["models_evaluated"]) == 2

def test_model_registry_url_inference():
    """Verify ModelRegistry runs end-to-end inference and produces top prediction."""
    registry = ModelRegistry()
    url = "http://login-verify-account.paypal-security.xyz/auth/signin"
    features = UrlFeatureExtractor.extract(url)

    inference = registry.run_inference(event_type="url", raw_payload=url, features=features)
    assert "top_prediction" in inference
    assert "severity" in inference
    assert inference["top_prediction"]["model_name"] == "Ensemble (Transformer + RandomForest)"
    assert inference["severity"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
