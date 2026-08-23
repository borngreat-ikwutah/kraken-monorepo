# 🚀 Pull Request: User Authentication, MVC Architecture, and Dashboard Route Refactor

## 📌 Summary of Changes
This pull request delivers the complete **User Authentication & Session Management Feature** along with an MVC architectural refactor for the Flask backend, automated Pytest test suite, and a modernized Nexus.io blue theme redesign for the SOC Analyst Dashboard with nested route controllers.

---

## 🛠️ Key Changes Breakdown

### 1. 🔐 Backend MVC Authentication (`apps/backend`)
- **Database Model**: Added `User` table to `apps/backend/db/models.py` (`id`, `name`, `email`, `password_hash`, `organization`, `role`, `session_token`, `created_at`).
- **Controller Layer**: Created `apps/backend/controllers/auth_controller.py` handling registration, PBKDF2/SHA256 password hashing via `werkzeug.security`, login credential verification, session token issuance, and logout.
- **Routes Layer**: Created `apps/backend/routes/auth_routes.py` with `auth_bp` mounted on `/api/auth`.
- **Session Lookup**: Real database lookup on `GET /api/auth/me` resolving current user details directly from the Bearer token.

### 2. 🌐 Frontend Authentication & Context (`apps/web`)
- **API Client**: Created `apps/web/src/features/auth/api/authService.ts` for `loginApi`, `registerApi`, and `getMeApi`.
- **State Management**: Built `AuthContext` and `useAuth()` hook in `apps/web/src/features/auth/context/AuthContext.tsx` managing `user`, `token`, `isAuthenticated`, `login`, `register`, and `logout` with `localStorage` persistence.
- **UI Integration**:
  - Connected `LoginForm.tsx` & `RegisterForm.tsx` to authentication actions with error toast/banner feedback.
  - Updated `DashboardLayout.tsx` to dynamically display the authenticated analyst's initials, name, and organization with an active Logout action.

### 3. 🧩 Dashboard Route Decomposition & Nexus Blue Redesign
- **Nested TanStack Start Routes**:
  - `/dashboard` — Persistent Layout shell (`DashboardLayout.tsx`)
  - `/dashboard/feed` — Live incident triage stream & multi-tier velocity charts (`TriageFeedView.tsx`)
  - `/dashboard/models` — ML threat models registry (`ModelsView.tsx`)
  - `/dashboard/simulator` — Telemetry & URL vector ingestion sandbox (`IngestionSandboxView.tsx`)
  - `/dashboard/metrics` — Pipeline performance & detection accuracy analytics (`AnalyticsView.tsx`)
- **Design Overhaul**: Nexus-style layout with top telemetry metrics, blue velocity charts, weekly volume histograms, and brand-consistent 4-dot logos.

### 4. 🧪 Automated Test Suite & Tooling
- Added Pytest suite in `apps/backend/tests/test_auth.py` with 7 passing test cases verifying all auth endpoints.
- Added `test` script in `apps/backend/package.json`.
- Configured `.zed/settings.json` for Pyright LSP module resolution.

---

## 🧪 Verification Results

| Check | Command | Result |
| :--- | :--- | :---: |
| **Backend Test Suite** | `bun run --filter backend test` | **7 passed in 9.89s** ✅ |
| **Monorepo Typecheck** | `bun run typecheck` | **3 successful, 3 total (0 errors)** ✅ |
| **Monorepo Linting** | `bun run lint` | **3 successful, 3 total (0 errors)** ✅ |

---

## 📸 Route Map
- `/` — SaaS Minimalist Landing Page
- `/login` — SOC Analyst Sign In
- `/register` — Account Registration
- `/dashboard/feed` — Incident Triage Stream & Velocity Charts
- `/dashboard/models` — ML Model Registry
- `/dashboard/simulator` — Telemetry Ingestion Sandbox
- `/dashboard/metrics` — Pipeline Analytics
