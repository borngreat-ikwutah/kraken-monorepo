import { 
  ShieldCheck, 
  Brain, 
  SlidersHorizontal
} from "@phosphor-icons/react"

export function LandingFeatures() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Real-Time Telemetry Ingestion",
      desc: "Stream network flows, syslogs, and emails into a unified pipeline with zero data loss."
    },
    {
      icon: Brain,
      title: "Hybrid ML Threat Engine",
      desc: "Combine unsupervised Isolation Forest anomaly scoring with NLP transformers for phishing detection."
    },
    {
      icon: SlidersHorizontal,
      title: "1-Click SOC Analyst Triage",
      desc: "Review model confidence explanations, acknowledge incidents, and submit ground-truth feedback."
    }
  ]

  return (
    <section id="features" className="py-20 bg-neutral-50/70 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
            Everything your SOC needs to stay ahead
          </h2>
          <p className="text-neutral-500 mt-3 text-base">
            Simple to deploy, intelligent threat detection without alert fatigue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <div 
                key={i} 
                className="p-8 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" weight="duotone" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
