# AI Agent Guidelines & Architecture Rules (`AGENTS.md`)

This document defines the architectural standards, directory conventions, and coding principles for AI agents working on **kraken-monorepo**.

---

## 🏛️ Frontend Architecture Standards (`apps/web`)

To ensure scalability, readability, and clean separation of concerns, the web frontend MUST follow a **Feature-Based** and **Component-Based** modular architecture.

---

### 1. Directory Structure

Never place complex business logic, large state managers, or inline UI components directly inside route files (`src/routes/`). 

Routes must remain **thin page composition layers**. All feature logic must be organized under `src/features/`:

```
apps/web/src/
├── features/                          # Feature-Based Modules
│   ├── alerts/                        # Alert Management & Triage Feature
│   │   ├── components/                # Feature-specific components
│   │   │   ├── AlertFeedTable.tsx
│   │   │   ├── AlertDetailDrawer.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── AlertFilters.tsx
│   │   ├── hooks/                     # Custom hooks for alert state & API queries
│   │   │   └── useAlerts.ts
│   │   ├── api/                       # API request handlers
│   │   │   └── alertService.ts
│   │   └── types/                     # Feature type definitions
│   │       └── alert.types.ts
│   │
│   ├── telemetry/                     # Security Telemetry Ingestion Feature
│   │   ├── components/
│   │   │   └── TelemetrySimulatorControls.tsx
│   │   └── api/
│   │       └── ingestService.ts
│   │
│   └── dashboard/                     # SOC Dashboard Summary Feature
│       └── components/
│           ├── DashboardHeader.tsx
│           └── MetricCards.tsx
│
├── components/                        # Shared Application Components (non-domain specific)
│   └── Layout.tsx
│
├── routes/                            # Thin TanStack Start Route Controllers
│   ├── __root.tsx
│   └── index.tsx                      # Composes <DashboardHeader />, <MetricCards />, etc.
│
├── lib/                               # API Clients & Utilities
│   └── apiClient.ts
│
└── styles/                            # Custom CSS & Tailwind Imports
```

---

### 2. Core Architectural Principles

#### 🧩 A. Component-Based UI Isolation
* **Single Responsibility**: Each UI component must render a single, focused piece of UI (e.g. `SeverityBadge`, `MetricCard`, `AlertDetailDrawer`).
* **Atomic UI Imports**: Primitive components (buttons, badges, dialogs, inputs) must be imported from `@workspace/ui/components/*`.
* **Domain UI Composability**: Feature components (e.g. `AlertFeedTable`) compose atomic primitives with domain data.

#### 📦 B. Feature-Based Encapsulation
* Every feature directory (`src/features/<feature-name>`) owns its:
  * **Components**: `components/`
  * **API Client Calls**: `api/`
  * **Custom Hooks**: `hooks/`
  * **TypeScript Types**: `types/`
* Do NOT leak feature-specific types or API utilities into the global `src/components` folder.

#### ⚡ C. Thin Route Entry Points
* Route files inside `src/routes/*.tsx` should ONLY perform:
  1. Route parameter extraction.
  2. Assembling high-level feature components.
* Example `src/routes/index.tsx`:
  ```tsx
  import { createFileRoute } from "@tanstack/react-router"
  import { SOCDashboardView } from "@/features/dashboard/components/SOCDashboardView"

  export const Route = createFileRoute("/")({ component: App })

  function App() {
    return <SOCDashboardView />
  }
  ```

---

## 🐍 Backend Architecture Standards (`apps/backend`)

* **Modular Services**: Separate Flask routes (`app.py`), DB Layer (`db/`), Feature Extractors (`ml/extractors/`), and ML Models (`ml/models/`).
* **Fallback Resilience**: Database layer supports MySQL with seamless zero-config SQLite fallback. ML Models support Hugging Face Transformer with heuristic NLP fallback.

---

## 🛠️ Code Quality & Verification Rules

1. **Strict TypeScript Types**: Never use `any`. Always define explicit interfaces in `features/<feature>/types/`.
2. **Strict Python Type Annotations**: Never use bare generic types like `dict` or `tuple`. All dictionaries must specify generic parameters (e.g. `dict[str, Any]` or `dict[str, float]`) and all tuples must define positional element types (e.g. `tuple[dict[str, Any], int]`).
3. **Run Verification Commands**: Always verify edits using `bun run typecheck`, `bun run lint`, and `bun run --filter backend test`.
