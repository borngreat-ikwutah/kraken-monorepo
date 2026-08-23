# 🏗️ Technical Architecture & Build Specification: URL Feature Extraction & Transformer Threat Analysis

**Spec ID**: `SPEC-URL-ANALYSIS-002`  
**Feature**: URL Ingestion, Lexical/Entropy Feature Extraction & Transformer Threat Evaluation  
**Scope Reference**: [`scope.md`](file:///home/borngreat/Desktop/school/kraken-monorepo/scope.md)  
**PRD Reference**: [`prd.md`](file:///home/borngreat/Desktop/school/kraken-monorepo/prd.md)  
**Status**: Approved for Build  

---

## 1. Technical Decisions & Architectural Rationale

| Layer | Technical Decision | Architectural Rationale |
| :--- | :--- | :--- |
| **Feature Extraction** | Pure Python lexical + Shannon Entropy calculations in `UrlFeatureExtractor` | Fast CPU-bound extraction (< 2ms per URL) without external network dependencies. Extracts 16 numerical dimensions. |
| **DGA & Obfuscation Detection** | Shannon entropy computed across character frequency distributions for domain and path | High entropy (> 3.8 bits) reliably flags randomized subdomains and algorithmically generated domain names (DGAs). |
| **Heuristic & TLD Scoring** | Regex token match against high-risk credential keywords + abnormal ccTLDs/gTLDs | Captures targeted spear-phishing combinations (e.g. `micros0ft-verify.xyz`) even before full ML model training. |
| **Transformer Classification** | Hugging Face Sequence Classification pipeline (`mrm8488/bert-tiny-finetuned-sms-spam-detection`) with fallback | Evaluates text string directly; bert-tiny provides lightning-fast (< 50ms) inference on standard CPU with heuristic fallback. |
| **Classical ML Scoring** | Supervised `RandomForestClassifier` trained on synthetic lexical feature distributions | Provides orthogonal verification based purely on structural and statistical URL features. |
| **Ensemble Scoring Engine** | Weighted confidence combination: `0.6 * Transformer_Score + 0.4 * RandomForest_Score` | Fuses semantic NLP understanding with statistical structural anomaly detection for robust verdicts. |
| **Backend Architecture** | MVC controller `IngestController` + Blueprint `ingest_bp` (`/api/ingest`) | Modular isolation conforming to project architectural standards (`AGENTS.md`). |
| **Frontend Sandbox** | React 19 visual feature inspector with interactive gauges and presets | Provides SOC analysts with clear explanations rather than black-box decisions. |

---

## 2. End-to-End System Data Flow

```
[ User / Analyst Input ] ── (Submits URL e.g. "http://secure-login.micros0ft-verify.ru/token")
           │
           ▼
[ POST /api/ingest ] ── (apps/backend/routes/ingest_routes.py ➔ IngestController)
           │
           ├──▶ (1) URL Normalization & Sanitization
           │
           ├──▶ (2) UrlFeatureExtractor.extract()
           │        ├── Lexical: url_length, domain_length, num_dots, num_slashes, has_ip
           │        ├── Structural Entropy: domain_entropy, url_entropy (Shannon bits)
           │        └── Heuristic: suspicious_token_count, has_suspicious_tld
           │
           ├──▶ (3) ML Model Evaluation (ModelRegistry)
           │        ├── Hugging Face Transformer: Sequence classification score (0.0 - 1.0)
           │        └── Random Forest Classifier: Lexical feature vector score (0.0 - 1.0)
           │
           ├──▶ (4) Ensemble Verdict Engine
           │        ├── Weighted Score = (0.6 * HF_Score) + (0.4 * RF_Score)
           │        └── Severity Tagging: CRITICAL (>=0.80), HIGH (>=0.60), MEDIUM (>=0.40), LOW (<0.40)
           │
           ├──▶ (5) Database Persistence (SQLAlchemy 2.0)
           │        └── Commit: Event ➔ Feature ➔ Prediction ➔ Alert (if severity >= MEDIUM)
           │
           ▼
[ JSON Response ] ──▶ IngestionSandboxView (Renders Gauge, Feature Table, Model Consensus)
```

---

## 3. Detailed Component Specifications

### 3.1 Feature Extractor (`apps/backend/ml/extractors/url_extractor.py`)

Extracts 16 numerical features returned as `dict[str, float]`:

```python
class UrlFeatureExtractor:
    SUSPICIOUS_KEYWORDS = [
        "login", "signin", "verify", "verification", "account", "update", "secure",
        "banking", "authenticate", "password", "credential", "wallet", "support",
        "confirm", "security", "action", "alert", "billing", "token"
    ]
    SUSPICIOUS_TLDS = [
        ".xyz", ".top", ".work", ".click", ".pw", ".cc", ".tk", ".ml", ".ga",
        ".cf", ".gq", ".ru", ".su", ".fit", ".rest", ".online"
    ]

    @staticmethod
    def extract(url_string: str) -> dict[str, float]:
        # Returns:
        # {
        #   "url_length": float,
        #   "domain_length": float,
        #   "path_length": float,
        #   "subdomain_count": float,
        #   "num_dots": float,
        #   "num_hyphens": float,
        #   "num_at": float,
        #   "num_slash": float,
        #   "num_question": float,
        #   "num_equal": float,
        #   "num_digits": float,
        #   "has_ip": float,
        #   "has_suspicious_tld": float,
        #   "suspicious_token_count": float,
        #   "domain_entropy": float,
        #   "url_entropy": float
        # }
```

### 3.2 Transformer & Ensemble Model Registry (`apps/backend/ml/models/`)

1. **`hf_transformer.py` (`PhishingNLPDetector`)**:
   - Accepts raw URL string and lexical features.
   - Evaluates URL text string with fine-tuned transformer pipeline.
   - Returns model confidence score, threat label, and contributing lexical signals.
2. **`random_forest.py` (`ThreatClassifier`)**:
   - Accepts 16-dimensional feature vector.
   - Outputs malicious probability based on structural distribution.
3. **`registry.py` (`ModelRegistry`)**:
   - Runs ensemble inference for `event_type == "url"`.
   - Combines Transformer and Random Forest predictions.
   - Assigns pipeline severity: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.

---

## 4. API Endpoints Specification

### Ingest & Analyze URL (`POST /api/ingest`)

* **Request Payload**:
  ```json
  {
    "event_type": "url",
    "source_ip": "192.168.1.105",
    "destination_ip": "0.0.0.0",
    "payload": "http://login-verify-account.paypal-security.xyz/auth/signin"
  }
  ```

* **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "event_id": 42,
    "event_type": "url",
    "features": {
      "url_length": 62.0,
      "domain_length": 39.0,
      "subdomain_count": 2.0,
      "domain_entropy": 3.75,
      "url_entropy": 4.12,
      "suspicious_token_count": 4.0,
      "has_suspicious_tld": 1.0,
      "has_ip": 0.0
    },
    "prediction": {
      "model_name": "Ensemble (HuggingFace + RandomForest)",
      "score": 0.94,
      "threat_label": "malicious",
      "severity": "CRITICAL",
      "explanation": "High domain entropy (3.75) and 4 suspicious tokens detected with high-risk TLD .xyz"
    },
    "models_evaluated": [
      {
        "model_name": "HuggingFace-Phishing-DistilBERT",
        "score": 0.96,
        "threat_label": "malicious"
      },
      {
        "model_name": "RandomForestClassifier-v1.0",
        "score": 0.91,
        "threat_label": "malicious"
      }
    ],
    "alert_generated": true
  }
  ```

---

## 5. Frontend Module & UI Enhancements (`apps/web`)

### Location: `apps/web/src/features/telemetry/` & `apps/web/src/features/dashboard/`

1. **`telemetry.types.ts`**:
   - Add TypeScript interfaces: `UrlFeatures`, `ModelPredictionResult`, `IngestResponse`, `UrlAnalysisPreset`.
2. **`IngestionSandboxView.tsx`**:
   - Preset buttons:
     - 🚨 *DGA Obfuscation*: `http://x7k9p2m1-secure-auth.tk/verify?id=99281`
     - 🎣 *Brand Impersonation*: `https://microsoft-login-security-update.xyz/oauth`
     - 🛡️ *Legitimate Portal*: `https://github.com/microsoft/vscode/issues`
   - Real-time Entropy & Risk Gauge with color-coded warning boundaries.
   - Extracted features breakdown grid (Shannon Entropy, Subdomains, TLD Risk, Suspicious Tokens).
   - Side-by-side consensus comparison between Transformer NLP and Random Forest classifier.

---

## 6. Verification & Test Plan

1. **Unit Tests (`apps/backend/tests/test_url_extractor.py`)**:
   - Test entropy calculation on high-entropy vs low-entropy strings.
   - Test subdomain count extraction across subdomains.
   - Test suspicious token detection with various casings and combinations.
   - Test IP hostname detection (IPv4 / evasion patterns).
2. **Integration Tests (`apps/backend/tests/test_ingest.py`)**:
   - Verify `/api/ingest` end-to-end for URL event types.
   - Confirm records are saved across `events`, `features`, `predictions`, and `alerts` tables.
3. **Monorepo Quality Gate**:
   - `bun run --filter backend test` passes 100%.
   - `bun run typecheck` & `bun run lint` pass with zero errors.
