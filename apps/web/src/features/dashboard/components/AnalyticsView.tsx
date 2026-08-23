import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"

export function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-950 tracking-tight">SOC Pipeline Analytics</h2>
        <p className="text-xs text-neutral-500 mt-1">Detection throughput, precision benchmarks, and latency distribution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-neutral-200/80 shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Detection Accuracy</span>
            <p className="text-2xl font-bold font-mono text-blue-600 mt-1">98.6%</p>
            <span className="text-[11px] text-emerald-600 font-medium">Across all ML models</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200/80 shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-neutral-500 uppercase">False Positive Rate</span>
            <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">&lt; 1.2%</p>
            <span className="text-[11px] text-neutral-400 font-medium">Low analyst noise</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200/80 shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Mean Time to Triage</span>
            <p className="text-2xl font-bold font-mono text-neutral-900 mt-1">1.4 min</p>
            <span className="text-[11px] text-blue-600 font-medium">Fast action loop</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200/80 shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Events Processed</span>
            <p className="text-2xl font-bold font-mono text-neutral-900 mt-1">14,290</p>
            <span className="text-[11px] text-neutral-400 font-medium">Current session</span>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-neutral-200/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <CardTitle className="text-base font-bold text-neutral-950">Threat Vector Distribution</CardTitle>
          <p className="text-xs text-neutral-500">Breakdown of incidents categorized by model classification</p>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-800 mb-1.5">
              <span>Network Anomalies (Isolation Forest)</span>
              <span className="font-mono text-blue-600">48% (6,859 events)</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div className="w-[48%] bg-blue-600 h-full rounded-full"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-800 mb-1.5">
              <span>Phishing & SMTP Payloads (Hugging Face NLP)</span>
              <span className="font-mono text-amber-600">32% (4,572 events)</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div className="w-[32%] bg-amber-500 h-full rounded-full"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-800 mb-1.5">
              <span>Malicious URLs & Domains (Lexical RF)</span>
              <span className="font-mono text-rose-600">20% (2,859 events)</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div className="w-[20%] bg-rose-500 h-full rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
