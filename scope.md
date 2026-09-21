# 🌐 Scope: Security Telemetry Ingestion, Multi-Model ML & Authentication

**Target System**: `kraken-monorepo` (`apps/backend` + `apps/web`)  
**Reference Document**: [`prd.md`](file:///home/borngreat/Desktop/school/kraken-monorepo/prd.md) Section 1.4, 1.5, 2.1, & Authentication Requirements  
**Status**: ✅ **COMPLETED (Phase 1 & Phase 2 Final)**  
**Purpose**: End-to-end security telemetry ingestion, feature extraction, dual-model ML inference, SOC incident triage, and secure session-based authentication consumed across the SOC dashboard.

---

## 🎯 Feature Overview & Objectives

### 1. 🔐 User Authentication & Session Management (`apps/web/src/features/auth`)
* **Backend Authentication MVC Layer (`apps/backend`)**:
  * [`AuthController`](file:///home/borngreat/Desktop/school/kraken-monorepo/apps/backend/controllers/auth_controller.py): Handles registration, salted password hashing via `werkzeug.security`, credential validation, and bearer session issuance.
  * [`auth_routes.py`](file:///home/borngreat/Desktop/school/kraken-monorepo/apps/backend/routes/auth_routes.py): REST endpoints mounted at `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`.
  * [`models.py`](file:///home/borngreat/Desktop/school/kraken-monorepo/apps/backend/db/models.py): `User` entity with `id`, `email`, `password_hash`, `name`, `organization`, `role`, `session_token`, and `created_at`.
* **Frontend Authentication State (`apps/web/src/features/auth`)**:
  * [`AuthContext.tsx`](file:///home/borngreat/Desktop/school/kraken-monorepo/apps/web/src/features/auth/context/AuthContext.tsx): Global reactive React context providing `user`, `token`, `isAuthenticated`, `login`, `register`, and `logout`.
  * Persists session tokens and user state in `localStorage` with silent revalidation on load.
* **Dashboard User Context Consumption**:
  * [`DashboardLayout.tsx`](file:///home/borngreat/Desktop/school/kraken-monorepo/apps/web/src/features/dashboard/components/DashboardLayout.tsx): Top navigation bar and sidebar footer dynamically display the logged-in user's initials avatar, full name, email/organization, role badge (`ANALYST` / `ADMIN`), and instant logout trigger.
  * [`DashboardSidebar.tsx`](file:///home/borngreat/Desktop/school/kraken-monorepo/apps/web/src/features/dashboard/components/DashboardSidebar.tsx): Sidebar profile card consuming `useAuth()` to reflect active session data.

---

### 2. ⚡ Telemetry Ingestion & Feature Extraction (`apps/web/src/features/telemetry`)
* **Lexical, Statistical & Structural Feature Extraction**:
  * **URL**: Shannon entropy for DGA detection, subdomain depth, suspicious tokens, high-risk TLDs, IP host evasion (`UrlFeatureExtractor`).
  * **Phishing Text / Email**: Deceptive phrasing, urgency scoring, caps ratio, link presence (`TextFeatureExtractor`).
  * **Network Flow**: Transfer rates, packet statistical metrics, protocol flags (`NetworkFeatureExtractor`).
* **Dual-Model ML Threat Evaluation**:
  * **Hugging Face Transformer (`DistilBERT`)**: Semantic sequence classification for phishing and deceptive text.
  * **Random Forest Classifier**: Supervised tree classification consuming extracted feature vectors.
  * **Isolation Forest**: Unsupervised high-dimensional network flow anomaly detection.
  * **EnsembleScorer**: Weighted consensus score (60% Transformer + 40% Random Forest) with threat explanation attribution.
* **Interactive Analyst UI**:
  * Multi-tab Ingestion Sandbox (`/dashboard/simulator`) with one-click attack presets.
  * Side-by-side **Visual Comparison Breakdown Cards** for **Transformer vs. Random Forest** scores.
  * **Extracted Feature Vector Breakdown** displaying calculated mathematical features with risk tags.

---

## 📋 Implementation Checklist

```
Phase 1: Authentication & User Session Management [COMPLETED]
  ├── ✅ AuthController with password hashing & session token management
  ├── ✅ Auth Blueprint mounted at /api/auth (register, login, me)
  ├── ✅ AuthContext React provider wrapping the application root
  ├── ✅ Auth pages (/login, /register) with error handling & redirect
  ├── ✅ Dashboard Top Bar & Sidebar dynamically displaying active user initials, name, role & email
  └── ✅ Logout workflow returning analyst to login screen

Phase 2: Feature Extractors (URL, NLP Text, Network) [COMPLETED]
  ├── ✅ Shannon Entropy calculation (domain + full URL)
  ├── ✅ Subdomain count, depth, and special character extraction
  ├── ✅ Suspicious token scanner & high-risk TLD scoring
  ├── ✅ Network flow rate and packet statistical extraction
  └── ✅ Unit tests in apps/backend/tests/

Phase 3: Transformer & ML Inference Engine [COMPLETED]
  ├── ✅ TransformerEvaluator in apps/backend/ml/models/hf_transformer.py
  ├── ✅ RandomForestEvaluator in apps/backend/ml/models/random_forest.py
  ├── ✅ NetworkAnomalyDetector in apps/backend/ml/models/isolation_forest.py
  ├── ✅ EnsembleScorer & ModelRegistry with consensus formulas
  └── ✅ Pytest suite with 20 passing unit tests

Phase 4: Ingestion Controller & Persistence [COMPLETED]
  ├── ✅ IngestController in apps/backend/controllers/ingest_controller.py
  ├── ✅ Ingest Blueprint mounted at /api/ingest and /api/predict
  └── ✅ Transactional DB persistence for Events, Features, Predictions, and Alerts

Phase 5: Frontend Telemetry Ingestion & Visualizer Feature [COMPLETED]
  ├── ✅ types/ingest.types.ts with strict TypeScript interfaces
  ├── ✅ api/ingestService.ts with live API calls and resilient fallback simulation
  ├── ✅ hooks/useIngest.ts for reactive state management and presets
  ├── ✅ components/ModelComparisonCards.tsx (Transformer vs. Random Forest visual breakdown)
  ├── ✅ components/FeatureExtractorBreakdown.tsx (Engineered signal vector display)
  ├── ✅ components/IngestionForm.tsx (Multi-vector tabbed input form with presets)
  ├── ✅ components/IngestionSandbox.tsx (Container connecting all components)
  └── ✅ Routed via apps/web/src/routes/dashboard.simulator.tsx

Phase 6: Live Dashboard API & Database Migration [COMPLETED]
  ├── ✅ Backend DashboardController with live SQL aggregations in apps/backend/controllers/dashboard_controller.py
  ├── ✅ REST endpoints mounted at /api/analytics/metrics and /api/analytics/timeseries
  ├── ✅ Incident detail & patch endpoints mounted at /api/alerts/:id (GET and PATCH)
  ├── ✅ Frontend services in api/alertService.ts and types in types/alert.types.ts
  ├── ✅ Custom reactive hooks: useAlerts, useAnalytics, useDashboardStats, useThreatModels
  ├── ✅ Top Metrics Cards wired to live total_events, delta percentage, open_alerts, and precision_rate
  ├── ✅ Detection Velocity & Weekly Threat Volume charts wired to dynamic timeseries aggregations
  ├── ✅ Live Incident Triage Stream wired to paginated GET /api/alerts with severity and search query parameters
  ├── ✅ Deep Investigation Drawer wired to GET /api/alerts/:id and PATCH /api/alerts/:id (Ack, Resolve, False Positive)
  └── ✅ Zero static mock arrays or mock fallback stores remaining in frontend bundle

Phase 7: Verification & Quality Assurance [COMPLETED]
  ├── ✅ All 26 backend pytest tests passing (100%)
  ├── ✅ Turbo typecheck passing with 0 errors across monorepo
  ├── ✅ Turbo lint passing with 0 errors across monorepo
  └── ✅ Turbo build passing production client and server bundles
```


---

## 🔒 Security & Code Quality Standards

- **Strict Typing Compliance**: Zero `any` in TypeScript; strictly parameterized generic containers (`dict[str, Any]`, `tuple[dict[str, Any], int]`) in Python.
- **Fault-Tolerant ML Execution**: Heuristic NLP fallback for offline systems; zero-config SQLite fallback for MySQL database connections.
- **Strict Separation of Concerns**: Routes are thin composition layers; all business logic and UI components are fully encapsulated inside `features/`.
