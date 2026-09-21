# Changelog

All notable changes to the **KrakenSec** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-08-25

### 🚀 Added (Live Dashboard API & Database Migration)
- **Top Metrics Cards (`/api/analytics/metrics`)**:
  - Live `total_events` count with 24-hour percentage growth delta computed from `events` table.
  - Live `open_alerts` and `critical_open_count` from `alerts` table.
  - Dynamically computed `precision_rate` and `false_positive_rate` based on analyst triage feedback (`TRUE_POSITIVE` vs. `FALSE_POSITIVE`).
- **Timeseries & Detection Velocity (`/api/analytics/timeseries`)**:
  - Dynamic detection throughput broken down by telemetry vector (Network Flow, Phishing SMTP, Malicious URL, Syslog).
  - Weekly threat volume distribution across days of the week (Sun–Sat) with dynamic bar scaling and today highlight.
- **Live Incident Triage Stream & Details (`/api/alerts` + `/api/alerts/:id`)**:
  - Full query parameter filtering (`severity`, `status`, `q`/`search`) and pagination (`limit`, `offset`).
  - Active incident detail fetching (`GET /api/alerts/:id`) with raw event payload and multi-model consensus explanation.
  - Analyst workflow actions wired directly to `PATCH /api/alerts/:id` (Acknowledge, Resolve, Mark as False Positive).
- **Zero Mock Data in Bundle**:
  - Removed all mock fallback stores and arrays (`INITIAL_MOCK_ALERTS`, `localAlertsStore`, `addMockAlert`).
  - Strict reactive hooks: `useAlerts`, `useAnalytics`, `useDashboardStats`, `useThreatModels`.

---

## [1.0.0] - 2026-08-24


### 🚀 Added (Frontend Ingestion Feature & Visual Model Breakdown)
- **Feature-Encapsulated Telemetry Module (`apps/web/src/features/telemetry/`)**:
  - `types/ingest.types.ts`: Strict TypeScript interfaces for telemetry payloads, model predictions, sub-model scores, feature signals, and ingestion results.
  - `api/ingestService.ts`: Live API connection to backend `POST /api/ingest` and `POST /api/predict` with zero-config client fallback simulator.
  - `hooks/useIngest.ts`: Custom React hook managing input modes (URL, Phishing Email, Network Flow, Raw JSON), presets, API execution, and live state.
  - `components/ModelComparisonCards.tsx`: Side-by-side visual comparison cards for **Hugging Face Transformer** (NLP Semantics) vs. **Random Forest Classifier** (Lexical/Structural ML), including agreement indicators, risk probability bars, verdict badges, and consensus weights.
  - `components/FeatureExtractorBreakdown.tsx`: Visual matrix of engineered feature vectors with real-time suspicious signal tags.
  - `components/IngestionForm.tsx`: Interactive multi-vector submission form with quick attack presets (Phish URL, DGA / C2, Phish Email, Benign URL).
  - `components/IngestionSandbox.tsx`: Container component assembling the form, verdict badge, comparison cards, and feature breakdowns.
- **Routing & Navigation**:
  - Linked `/dashboard/simulator` via `dashboard.simulator.tsx` to the modular `IngestionSandboxView` component.

### 🧠 Added (ML Engine & Ensemble Consensus Scoring)
- **Multi-Model Consensus Scoring (`apps/backend/ml/models/`)**:
  - `EnsembleScorer.score_text_threat`: Weighted consensus (65% Transformer + 35% Random Forest) for email, log, and text telemetry.
  - `ModelRegistry.run_inference`: Dual-inference execution returning comprehensive sub-model evaluations across all vector types.
  - `IngestController.ingest_event`: Transactional persistence of raw Events, Features, Predictions, and Alerts returning full model breakdowns.

### 🧪 Verification & Quality Assurance
- 20/20 backend unit tests passing with pytest (`bun run --filter backend test`).
- Turborepo `typecheck` passing with 0 errors across monorepo (`bun run typecheck`).
- Turborepo `lint` passing with 0 errors across monorepo (`bun run lint`).
- Turborepo production `build` passing (`bun run build`).

---

## [0.2.0] - 2026-08-23

### 🧠 Added (ML Engine & URL Feature Extraction Pipeline)
- Advanced Lexical & Entropy Feature Extraction (`UrlFeatureExtractor`) in `apps/backend/ml/extractors/url_extractor.py`.
- `TransformerEvaluator` with `bert-tiny` / heuristic NLP fallback.
- `RandomForestEvaluator` with synthetic baseline bootstrapper.
- `EnsembleScorer` for URL threat scoring.

### 🔐 Added (Authentication & MVC Architecture)
- Backend `AuthController` with password hashing and session tokens.
- Frontend `features/auth/` module with `LoginForm`, `RegisterForm`, and `AuthContext`.

### 🎨 Changed (SOC Analyst Dashboard & Routing)
- Sub-routes for `/dashboard/feed`, `/dashboard/models`, `/dashboard/simulator`, `/dashboard/metrics`.
- Nexus.io Clean Blue theme and KPI metric summary cards.
