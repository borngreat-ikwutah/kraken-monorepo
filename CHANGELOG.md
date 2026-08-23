# Changelog

All notable changes to the **KrakenSec** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - 2026-08-23

### 🧠 Added (ML Engine & URL Feature Extraction Pipeline)
- **Advanced Lexical & Entropy Feature Extraction (`UrlFeatureExtractor`)**:
  - Implemented in `apps/backend/ml/extractors/url_extractor.py`.
  - Shannon entropy bit calculation for domain and full URL strings (DGA / obfuscation detection).
  - Subdomain count, depth, path length, special character frequencies (`.`, `-`, `@`, `/`, `?`, `=`, `%`), and digit counts.
  - Regex-based host IP address evasion detector (`has_ip`).
  - Multi-keyword credential phishing token scanner (`login`, `verify`, `account`, `banking`, `wallet`, `token`, etc.) combined with abnormal TLD scoring (`.xyz`, `.top`, `.pw`, `.ru`, `.cc`, `.tk`, etc.).
- **ML Model Evaluators & Ensemble Scorer**:
  - `TransformerEvaluator` (`apps/backend/ml/models/hf_transformer.py`): Sequence classification pipeline (`bert-tiny`) with semantic heuristic fallback.
  - `RandomForestEvaluator` (`apps/backend/ml/models/random_forest.py`): Supervised classifier consuming the 16-dimensional lexical feature vector with synthetic baseline bootstrapper.
  - `EnsembleScorer` (`apps/backend/ml/models/ensemble_scorer.py`): Fuses Transformer semantic confidence (60%) and Random Forest structural anomaly score (40%) with signal explanations and severity categorization (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
  - `ModelRegistry` (`apps/backend/ml/models/registry.py`): Multi-model execution and consensus dispatching.
- **Automated Pytest Suite**:
  - Added `apps/backend/tests/test_url_extractor.py` (5 unit tests).
  - Added `apps/backend/tests/test_ml_models.py` (5 unit tests).
  - Total automated test suite now at 17 passing tests (`bun run --filter backend test`).

### 🔐 Added (Authentication & MVC Architecture)
- **Backend MVC Authentication**:
  - Implemented `AuthController` in `apps/backend/controllers/auth_controller.py` with registration, salted password hashing via `werkzeug.security`, and Bearer session persistence.
  - Added `auth_bp` Blueprint in `apps/backend/routes/auth_routes.py` mounted under `/api/auth`.
  - Added `session_token` column to `User` model in `apps/backend/db/models.py` using SQLAlchemy 2.0 `Mapped` annotations.
- **Frontend Auth Integration**:
  - Created `apps/web/src/features/auth/` containing `authService.ts`, `AuthContext.tsx`, `LoginForm.tsx`, and `RegisterForm.tsx`.
  - Linked analyst profile info and logout action in `DashboardLayout.tsx` sidebar.

### 🎨 Changed (SOC Analyst Dashboard & Routing)
- **Nested TanStack Start Sub-Routes**:
  - Refactored `/dashboard` into clean sub-routes: `/dashboard/feed`, `/dashboard/models`, `/dashboard/simulator`, `/dashboard/metrics`.
- **Nexus.io Clean Blue Theme**:
  - Multi-tier detection velocity charts, live weekly histograms, 3 KPI metric summary cards, and unified 4-dot brand mark.

### 🛠️ Fixed
- Configured Astral `ty` and Pyright LSP settings in `.zed/settings.json`, `pyproject.toml`, and `pyrightconfig.json`.
- Enforced strict parameterized types (`dict[str, float]`, `tuple[dict[str, Any], int]`) across all backend models and extractors.
