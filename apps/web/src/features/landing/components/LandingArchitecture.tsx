import { 
  PaperPlaneTilt, 
  Gear, 
  Brain, 
  Database, 
  Desktop, 
  ArrowRight,
  ShieldChevron
} from "@phosphor-icons/react"

export function LandingArchitecture() {
  const steps = [
    {
      num: "01",
      title: "Telemetry Ingestion",
      tech: "Python Flask / REST",
      desc: "Ingests raw event streams: Network Flows, Syslog events, Inbound Emails, and URLs.",
      icon: PaperPlaneTilt
    },
    {
      num: "02",
      title: "Feature Engineering",
      tech: "Scikit-Learn / Custom Extractors",
      desc: "Extracts flow rates, byte ratios, text embeddings, and lexical URL entropy vectors.",
      icon: Gear
    },
    {
      num: "03",
      title: "Hybrid ML Inference",
      tech: "Isolation Forest + Hugging Face",
      desc: "Scores events for anomaly probabilities and predicts threat classifications in sub-seconds.",
      icon: Brain
    },
    {
      num: "04",
      title: "Persistence & State",
      tech: "MySQL / SQLite Fallback",
      desc: "Stores events, features, confidence metrics, and stateful alerts with triage statuses.",
      icon: Database
    },
    {
      num: "05",
      title: "SOC Analyst Console",
      tech: "TanStack Start + React 19",
      desc: "Prioritized live feed, confidence breakdown, payload review, and 1-click triage feedback.",
      icon: Desktop
    }
  ]

  return (
    <section id="architecture" className="py-20 border-t border-neutral-900 bg-neutral-950/60">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
            End-to-End Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 mt-2">
            System Architecture & Data Flow
          </h2>
          <p className="text-neutral-400 mt-3 text-base sm:text-lg">
            How security telemetry traverses the pipeline from raw event ingest to analyst triage.
          </p>
        </div>

        {/* Steps Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div 
                key={idx} 
                className="relative p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between hover:border-teal-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-extrabold font-mono text-neutral-600">
                      {step.num}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-teal-400 border border-neutral-700">
                      <Icon className="w-5 h-5" weight="duotone" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-neutral-100 mb-1">
                    {step.title}
                  </h3>
                  
                  <span className="inline-block text-[11px] font-mono text-teal-400/90 mb-2">
                    {step.tech}
                  </span>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 items-center justify-center text-neutral-400 text-xs shadow-md">
                    <ArrowRight className="w-3 h-3 text-teal-400" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Terminal Architecture Snippet */}
        <div className="mt-12 rounded-xl bg-neutral-900/90 border border-neutral-800 p-5 font-mono text-xs text-neutral-300 overflow-x-auto">
          <div className="flex items-center gap-2 text-neutral-400 mb-2 pb-2 border-b border-neutral-800">
            <ShieldChevron className="w-4 h-4 text-emerald-400" weight="fill" />
            <span>ARCHITECTURE TOPOLOGY: Unified Monorepo</span>
          </div>
          <pre className="text-neutral-400 leading-relaxed whitespace-pre">
{`[ Data Sources (Syslog/NetFlow/SMTP) ]
                 │ (REST API POST)
                 ▼
[ Ingestion Layer & Preprocessing ] ───► [ MySQL / SQLite Telemetry Store ]
                 │ (Extracted Vectors)
                 ▼
[ Hybrid ML Engine ]
   ├── Isolation Forest (Anomaly Scoring)
   └── Transformer / NLP (Phishing & Domain Classification)
                 │ (Prediction Payload & Alerts)
                 ▼
[ SOC Analyst Console (apps/web) ] ◄─── (Triage: Acknowledge / Escalate / False Positive)`}
          </pre>
        </div>

      </div>
    </section>
  )
}
