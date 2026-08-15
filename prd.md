**Threat Detection Pipeline – System Design Specification (SDS) + User Expectations**

### 1. System Design Specification (SDS)

#### 1.1 Purpose
Build a modular, production-ready **Threat Detection Pipeline** that ingests security telemetry, runs classical ML (scikit-learn) + free Hugging Face models, stores everything in MySQL, exposes a clean API, and delivers actionable alerts to security teams.

#### 1.2 Scope
- Real-time and batch threat detection
- Network anomalies, phishing, malicious URLs, log-based threats
- Backend API + ML engine + MySQL storage
- Alert generation and basic response hooks
- Extensible for new models and data sources

#### 1.3 High-Level Architecture

```
[Data Sources] → [Ingestion Layer] → [Preprocessing & Feature Store]
                                      ↓
                                 [MySQL]
                                      ↓
[ML Engine] ← (scikit-learn + Hugging Face) ← [Model Registry]
      ↓
[Backend API - FastAPI]
      ↓
[Alerting & Notification] → [Dashboard / Analyst UI]
```

#### 1.4 Core Components

| Component              | Responsibility                                      | Technology                  |
|------------------------|-----------------------------------------------------|-----------------------------|
| Ingestion              | Collect logs, flows, emails, URLs                   | FastAPI endpoints, Kafka (optional) |
| Feature Engineering    | Extract numerical + text features                   | Python, scikit-learn, custom extractors |
| Storage                | Persist raw data, features, predictions, alerts     | MySQL                       |
| ML Engine              | Run classical + transformer models                  | scikit-learn + Hugging Face Transformers |
| Model Registry         | Version & load models                               | Local files / joblib + HF Hub |
| Backend API            | Inference, management, querying                     | FastAPI                     |
| Alerting               | Generate & route alerts                             | Webhooks, email, internal queue |
| Dashboard (optional)   | Visualize alerts & metrics                          | React / Streamlit / Grafana |

#### 1.5 Data Flow
1. Event arrives via API or stream.
2. Features are extracted and stored in MySQL.
3. Relevant models are run (Isolation Forest / Random Forest + phishing/URL/log models).
4. Scores and labels are written to `predictions` and `alerts` tables.
5. High-severity alerts are pushed to notification channels.
6. Analyst can query, update status, and provide feedback via API.

#### 1.6 Key Technical Decisions
- **Database**: MySQL (structured, reliable, easy querying)
- **ML Stack**: scikit-learn (fast classical models) + Hugging Face (free NLP models)
- **API**: FastAPI (async, automatic docs, high performance)
- **Model Serving**: Load models once at startup; support hot-swap via config
- **Scalability**: Stateless API + optional message queue for high volume
- **Extensibility**: Plugin-style feature extractors and model loaders

#### 1.7 Non-Functional Requirements
- Latency: < 300–500 ms for single real-time prediction (CPU)
- Throughput: Support 100–500 events/sec initially (scale later)
- Availability: 99.5%+ for the API
- Security: API authentication, input validation, audit logging
- Observability: Structured logs, Prometheus metrics, model performance tracking

#### 1.8 Security Considerations
- API key / JWT authentication
- Rate limiting
- Sanitization of incoming logs/emails
- Least-privilege database access
- Model and data versioning for auditability

---

### 2. What the User (Security Analyst / SOC Operator) Expects to See

#### 2.1 Primary User Interface Views

**A. Alert Dashboard (Main Screen)**
- Live feed of new alerts sorted by severity and time
- Columns: Timestamp | Severity | Threat Type | Source IP / User | Confidence Score | Status | Model Used
- Filters: Severity, Threat Type, Time range, Status, Source
- Color coding: Critical (red), High (orange), Medium (yellow), Low (blue)
- Quick actions: Acknowledge, Mark False Positive, Escalate, Add Note

**B. Alert Detail View**
- Full event payload (raw log / email / flow summary)
- Feature values that contributed to the decision
- Model scores (Isolation Forest score + NLP confidence)
- Explanation / top contributing signals
- Timeline of related events
- Recommended actions
- Feedback buttons (True Positive / False Positive)

**C. Search & Investigation**
- Full-text + structured search across events and alerts
- Ability to pivot (e.g., “show all events from this IP in last 24h”)
- Export to CSV / JSON

**D. Model Performance & Health**
- Current active models and versions
- Recent precision / recall / false positive rate
- Drift indicators (optional)
- Ability to switch models or thresholds

**E. Summary / Executive View**
- Threat volume over time
- Top threat types
- Most targeted assets / users
- Mean time to acknowledge

#### 2.2 Expected Outputs & Notifications
- Real-time browser notifications or toast alerts for Critical/High
- Email / Slack / webhook notifications with summary + link to detail
- Daily / weekly summary report (top threats, volume trends)
- Ability to generate investigation tickets (optional integration)

#### 2.3 User Workflow Expectations
1. Open dashboard → see prioritized alerts
2. Click alert → understand why it fired (features + model scores)
3. Investigate related events
4. Mark as True/False Positive or escalate
5. System learns from feedback over time (retraining support)

#### 2.4 What Users Do **Not** Want
- Alert fatigue (too many low-quality alerts)
- Black-box decisions with no explanation
- Slow loading dashboards
- Difficulty finding related context
- Manual export of every event

---

### 3. Prioritized Backlog (MVP → Full)

1. MySQL schema + basic ingestion API
2. Feature extraction for network + simple log features
3. Isolation Forest + Random Forest models
4. FastAPI `/predict` + `/alerts` endpoints
5. Simple alert listing + severity scoring
6. One Hugging Face model (phishing or malicious URL)

**Phase 2**
- Full Alert Dashboard UI
- Multiple Hugging Face models (logs + URLs + phishing)
- Feedback loop (True/False Positive)
- Basic notifications (email/webhook)
- Model versioning & metrics tracking

**Phase 3**
- Advanced search & investigation views
- Ensemble scoring + better explanations
- Drift detection & automatic retraining hooks
- Role-based access + audit logs
- Integration with external SOAR / ticketing

---

Would you like me to expand any section further (detailed database schema, API endpoint list, sample UI wireframe description, or a full technical architecture document with sequence diagrams)?