import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Brain, CheckCircle, Lightning, Database } from "@phosphor-icons/react"

export function ModelsView() {
  const models = [
    {
      name: "Isolation Forest (Network Anomaly Engine)",
      type: "Unsupervised Classical ML (scikit-learn)",
      status: "Online",
      accuracy: "99.4%",
      latency: "14ms",
      features: ["flow_duration", "bytes_sent", "bytes_recv", "packet_rate", "dst_port_entropy"],
      description: "Scores high-frequency port scans, volumetric bursts, and abnormal packet lengths against normal network baselines."
    },
    {
      name: "Phishing Text Transformer",
      type: "Hugging Face MiniLM (Transformer NLP)",
      status: "Online",
      accuracy: "98.1%",
      latency: "42ms",
      features: ["urgency_score", "credential_keywords", "semantic_entropy", "social_engineering_tokens"],
      description: "Classifies email bodies and SMTP subjects to detect urgency coercion, credential harvesters, and impersonation."
    },
    {
      name: "Malicious URL Classifier",
      type: "Lexical & Entropy Random Forest",
      status: "Online",
      accuracy: "96.8%",
      latency: "18ms",
      features: ["domain_entropy", "suspicious_tld", "typosquatting_distance", "url_length"],
      description: "Evaluates inbound domain links, detecting obfuscated IPs, spoofed brand domains, and malicious redirect hops."
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-950 tracking-tight">Active ML Threat Models</h2>
        <p className="text-xs text-neutral-500 mt-1">Registry of production inference models and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-white border-neutral-200/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Registered Models</span>
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-neutral-900 mt-2">3 Online</p>
            <span className="text-[11px] text-emerald-600 font-medium">All inference pipelines healthy</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Avg Inference Latency</span>
              <Lightning className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-neutral-900 mt-2">24.6 ms</p>
            <span className="text-[11px] text-neutral-400 font-medium">Sub-50ms SLA target met</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Model Registry State</span>
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-neutral-900 mt-2">Zero-Config</p>
            <span className="text-[11px] text-neutral-400 font-medium">SQLite & MySQL Fallback</span>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {models.map((model, idx) => (
          <Card key={idx} className="bg-white border-neutral-200/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span>{model.name}</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                    {model.status}
                  </Badge>
                </CardTitle>
                <p className="text-xs font-mono text-neutral-500 mt-0.5">{model.type}</p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Accuracy</span>
                  <span className="text-sm font-bold font-mono text-blue-600">{model.accuracy}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Latency</span>
                  <span className="text-sm font-bold font-mono text-neutral-700">{model.latency}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3">
              <p className="text-xs text-neutral-600 leading-relaxed">{model.description}</p>
              
              <div>
                <span className="text-[11px] font-bold text-neutral-700 block mb-1.5">Extracted Signal Features:</span>
                <div className="flex flex-wrap gap-1.5">
                  {model.features.map((f, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[11px] font-mono text-neutral-700">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
