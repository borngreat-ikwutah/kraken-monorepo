# 🌐 Scope: URL Feature Extraction & Transformer Threat Analysis

**Target System**: `kraken-monorepo` (`apps/backend` + `apps/web`)  
**Reference Document**: [`prd.md`](file:///home/borngreat/Desktop/school/kraken-monorepo/prd.md) Section 1.4, 1.5, & 2.1  
**Purpose**: Build the complete end-to-end URL submission analysis pipeline featuring lexical/structural/entropy feature extraction, fine-tuned transformer classification + random forest ensemble scoring, database persistence, and a real-time investigation UI in the SOC dashboard.

---

## 🎯 Feature Overview & Objectives

When a user or analyst submits a website URL for analysis:
1. **Lexical & Statistical Feature Extraction (`UrlFeatureExtractor`)**:
   - URL length, domain length, path length, query length.
   - Subdomain count & depth analysis.
   - Symbol & special character counts (`.`, `-`, `@`, `_`, `?`, `=`, `%`, `//`).
   - Direct IP address host detection (IPv4 / IPv6 evasion).
   - Shannon entropy score calculation across domain and full URL to detect Algorithmically Generated Domains (DGA) and randomized obfuscation.
   - Suspicious token & keyword heuristics (e.g. `login`, `verify`, `account`, `update`, `secure`, `banking`, `token`, `wallet`) combined with abnormal/high-risk Top-Level Domains (`.xyz`, `.top`, `.pw`, `.cc`, `.tk`, `.ru`, `.click`, `.work`).
2. **Dual-Model ML Threat Evaluation**:
   - **Sequence-Classification Transformer (Hugging Face)**: Evaluates the URL text string directly and generates an NLP/semantic malicious probability score. Supports zero-config fallback heuristic NLP detector.
   - **Supervised Classifier (Random Forest)**: Evaluates the extracted numerical feature vector (length, entropy, token presence, TLD risk, IP presence).
   - **Combined Ensemble Verdict**: Weighted combination of Transformer confidence + Random Forest anomaly score (`0.0` to `1.0`) with clear verdict categorization (`SAFE` / `SUSPICIOUS` / `MALICIOUS`).
3. **Database Persistence & Alert Dispatch**:
   - Persist incoming event (`events`), extracted lexical features (`features`), model inferences (`predictions`), and high-confidence threat alerts (`alerts`) with automatic deduplication.
4. **Analyst Sandbox & Inspection UI**:
   - Submit URL directly from the SOC Ingestion Sandbox (`/dashboard/simulator`).
   - Visual breakdown of extracted lexical indicators (entropy meter, suspicious tokens, domain depth, TLD risk).
   - Model consensus comparison drawer showing Transformer score vs Random Forest score with contributing explanation signals.

---

## 📋 Step-by-Step Implementation Plan

```
Phase 1: Advanced Lexical, Structural & Entropy Feature Extractor
  ├── 1.1 Expand apps/backend/ml/extractors/url_extractor.py with:
  │     ├── Shannon Entropy calculation (domain + full URL)
  │     ├── Subdomain count & depth extraction
  │     ├── Suspicious keyword detection & matching
  │     ├── IPv4/IPv6 address host detection
  │     └── High-risk TLD scoring
  └── 1.2 Add unit tests for UrlFeatureExtractor in apps/backend/tests/test_url_extractor.py

Phase 2: Transformer & ML Inference Engine Enhancement
  ├── 2.1 Enhance apps/backend/ml/models/hf_transformer.py to support URL text sequence classification
  ├── 2.2 Update apps/backend/ml/models/random_forest.py to consume the expanded URL feature vector
  ├── 2.3 Update apps/backend/ml/models/registry.py with weighted ensemble scoring (Transformer + RF)
  └── 2.4 Add inference unit tests verifying scoring outputs and threshold classification

Phase 3: Backend Ingestion & Analysis Controller (MVC Refactor)
  ├── 3.1 Create apps/backend/controllers/ingest_controller.py encapsulating /api/ingest workflow
  ├── 3.2 Create apps/backend/routes/ingest_routes.py and register blueprint in app.py
  └── 3.3 Ensure database session lifecycle & transactional integrity on Event/Feature/Prediction/Alert persistence

Phase 4: Frontend URL Analysis UI & Feature Visualizer
  ├── 4.1 Update apps/web/src/features/telemetry/types/telemetry.types.ts with strictly typed URL feature interfaces
  ├── 4.2 Enhance IngestionSandboxView.tsx with:
  │     ├── One-click sample malicious/benign URL presets
  │     ├── Interactive Entropy & Risk Gauge
  │     ├── Extracted Lexical & Structural Feature breakdown table
  │     └── Multi-Model Consensus view (Transformer score vs Random Forest score)
  └── 4.3 Link URL submissions seamlessly to the live Incident Feed (/dashboard/feed)

Phase 5: Verification & Testing
  ├── 5.1 Run backend pytest suite (bun run --filter backend test)
  ├── 5.2 Run bun run typecheck & bun run lint across monorepo
  └── 5.3 End-to-end sandbox verification with real & mock malicious URLs
```

---

## 🛠️ Data Model & Feature Dictionary

```python
# Extracted URL Features (dict[str, float])
{
    "url_length": float,
    "domain_length": float,
    "path_length": float,
    "subdomain_count": float,
    "num_dots": float,
    "num_hyphens": float,
    "num_at": float,
    "num_question": float,
    "num_equal": float,
    "num_slash": float,
    "num_digits": float,
    "has_ip": float,               # 1.0 if IP host else 0.0
    "has_suspicious_tld": float,   # 1.0 if abnormal TLD else 0.0
    "suspicious_token_count": float, # count of tokens like login, verify, etc.
    "domain_entropy": float,       # Shannon entropy of domain (bits)
    "url_entropy": float           # Shannon entropy of full URL (bits)
}
```

---

## 🔒 Security & Code Quality Principles

- **Strict Typing Compliance**:
  - **Python**: Never use bare generic containers (`dict` or `tuple`). All dictionary parameters and returns must be strictly parameterized (e.g. `dict[str, Any]`, `dict[str, float]`) and all tuples must define explicit element types (e.g. `tuple[dict[str, Any], int]`).
  - **TypeScript**: No `any`. All API responses and form payloads must be typed via explicit interfaces in `features/<feature>/types/`.
- **Fault-Tolerant ML Execution**:
  - Graceful fallback from Hugging Face Transformer to heuristic NLP scoring if offline or uninstalled.
  - Zero-config SQLite fallback if MySQL database connection is unavailable.
- **Input Sanitization**:
  - URL normalization and scheme validation (`http://`, `https://`) prior to parsing to avoid crashes.
