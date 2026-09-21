# Threat Detection Pipeline 🛡️

A modular, production-ready **Threat Detection Pipeline** that ingests security telemetry, runs classical ML (`scikit-learn`) + Hugging Face models, stores data in MySQL, exposes a unified API, and presents actionable alerts to security teams via a modern SOC Analyst dashboard.

---

## 📐 System Architecture

```
[ Data Sources ] → [ Ingestion Layer ] → [ Feature Store & Preprocessing ]
                                                      ↓
                                                [ MySQL Storage ]
                                                      ↓
[ ML Engine ] ← (scikit-learn + Hugging Face) ← [ Model Registry ]
      ↓
[ Backend API ] (apps/backend)
      ↓
[ Alerting & Notifications ] → [ Analyst Dashboard ] (apps/web)
```

---

## 🛠️ Monorepo Structure

Built with **Turborepo** and **Bun** as a high-performance monorepo:

```
kraken-monorepo/
├── apps/
│   ├── web/        # React 19 + TanStack Start SOC Analyst Dashboard
│   └── backend/    # Flask / Python ML Threat Engine & API
├── packages/
│   └── ui/         # Shared Design System (@workspace/ui + shadcn/ui + Tailwind CSS v4)
├── prd.md          # Product Requirements & System Design Specification
├── turbo.json      # Turborepo task pipeline configuration
└── package.json    # Monorepo root configuration
```

---

## 🌟 Key Features

* **Real-time Threat Detection**: Analyzes network flows, log-based threats, phishing emails, and malicious URLs.
* **Hybrid ML Stack**:
  * **Classical ML (`scikit-learn`)**: Isolation Forest (unsupervised anomaly detection) & Random Forest.
  * **Transformers (`Hugging Face`)**: NLP models for phishing text and URL safety classification.
* **MySQL Data Persistence**: Schema for raw event payloads, engineered feature vectors, predictions, and alerts.
* **SOC Analyst Dashboard (`apps/web`)**:
  * Prioritized live alert feed (Critical, High, Medium, Low severity).
  * Alert details with model confidence scores and feature explanations.
  * Quick analyst workflow actions (Acknowledge, Mark False Positive, Escalate).
  * System performance and detection metrics.

---

## 📋 System Components & Responsibilities

| Component | Layer | Technology | Responsibility |
| :--- | :--- | :--- | :--- |
| **Ingestion API** | Backend | Python Flask | Endpoint ingestion for logs, network flows, and email samples |
| **Feature Store** | Preprocessing | Python / MySQL | Feature extraction & numerical representation |
| **Storage** | Persistence | MySQL | Storing raw telemetry, features, model predictions, and alerts |
| **ML Engine** | Detection | scikit-learn + Hugging Face | Anomaly detection & text/URL threat classification |
| **Analyst UI** | Frontend | TanStack Start + shadcn/ui | Live SOC alert triage, investigation, and reporting |

---

## 🗺️ Product Roadmap

### Phase 1: Core Pipeline & MVP (Completed)
- [x] Monorepo structure with Turborepo, Bun, TanStack Start UI, and Flask Backend.
- [x] Ingestion API & backend controller structure (`/api/ingest`, `/api/predict`).
- [x] Database schema & feature store persistence (MySQL with SQLite fallback).
- [x] Isolation Forest + Random Forest baseline threat models.
- [x] Hugging Face phishing & malicious URL inference (`bert-tiny` / DistilBERT).
- [x] Telemetry Ingestion Sandbox with live Transformer vs. Random Forest visual breakdown cards.

### Phase 2: Analyst Workspace & Feedback Loop (Completed)
- [x] Full SOC Alert Dashboard UI with filtering & severity color coding (`/dashboard/feed`).
- [x] Analyst feedback loop (True Positive / False Positive tagging, Acknowledge, Resolve).
- [x] Real-time detection metrics and analytical histograms (`/dashboard/metrics`).

### Phase 3: Advanced Investigation & Operations
- [ ] Historical search, pivot investigation, and log timeline viewer.
- [ ] Automated model retraining hooks and drift indicators.
- [ ] Exportable security reports and ticketing integration.

---

## 🚀 Getting Started

### Prerequisites

* **Bun**: `bun >= 1.1.0`
* **Python**: `python >= 3.10`
* **MySQL**: Running instance (local or remote)

### Development Setup

1. **Install dependencies across monorepo**:
   ```bash
   bun install
   ```

2. **Start Development Servers**:
   ```bash
   bun dev
   ```
   * **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
   * **Flask Backend API**: [http://localhost:5000](http://localhost:5000)

3. **Run Typecheck & Linting**:
   ```bash
   bun run typecheck
   bun run lint
   ```

---

## 📄 Reference

For detailed specifications, see the full Product Requirements Document in [`prd.md`](file:///home/borngreat/Desktop/school/kraken-monorepo/prd.md).
