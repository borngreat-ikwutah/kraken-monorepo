import { Link } from "@tanstack/react-router"
import { 
  ArrowUpRight, 
  Pulse
} from "@phosphor-icons/react"
import { SeverityBadge } from "../../alerts/components/SeverityBadge"
import { StatusBadge } from "../../alerts/components/StatusBadge"
import type { SeverityType, StatusType } from "../../alerts/types/alert.types"

interface SampleAlert {
  id: number
  title: string
  severity: SeverityType
  status: StatusType
  threat_type: string
  source: string
  confidence: number
  model: string
  time: string
}

export function LandingLivePreview() {
  const sampleAlerts: SampleAlert[] = [
    {
      id: 104,
      title: "Suspicious High-Frequency Port Scan Detected",
      severity: "CRITICAL",
      status: "NEW",
      threat_type: "NETWORK_ANOMALY",
      source: "192.168.1.144",
      confidence: 0.94,
      model: "IsolationForest_v1.2",
      time: "2 mins ago"
    },
    {
      id: 103,
      title: "Credential Phishing Inbound Payload via SMTP",
      severity: "HIGH",
      status: "ACKNOWLEDGED",
      threat_type: "PHISHING_EMAIL",
      source: "security-verify@bank-auth.com",
      confidence: 0.88,
      model: "MiniLM_Phishing_Transformer",
      time: "8 mins ago"
    },
    {
      id: 102,
      title: "Malicious Lookalike Typosquatting Domain",
      severity: "MEDIUM",
      status: "ACKNOWLEDGED",
      threat_type: "MALICIOUS_URL",
      source: "login.micros0ft-support.ru",
      confidence: 0.76,
      model: "URL_Lexical_Forest",
      time: "14 mins ago"
    }
  ]

  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-neutral-400 ml-2">kraken-soc // Live Telemetry Feed</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Pulse className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400">Ingestion Active</span>
              </div>
              <Link to="/dashboard" className="text-neutral-300 hover:text-emerald-400 flex items-center gap-1">
                <span>View Full Console</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar inside Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 border-b border-neutral-800/80 bg-neutral-950/40">
            <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/60">
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Real-Time Ingestion</span>
              <p className="text-xl font-bold text-neutral-100 font-mono mt-1">4,289 <span className="text-xs font-normal text-neutral-500">ev/min</span></p>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30">
              <span className="text-xs text-rose-300 uppercase tracking-wider font-mono">Critical Anomalies</span>
              <p className="text-xl font-bold text-rose-400 font-mono mt-1">12</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30">
              <span className="text-xs text-amber-300 uppercase tracking-wider font-mono">High Threat Queue</span>
              <p className="text-xl font-bold text-amber-400 font-mono mt-1">28</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
              <span className="text-xs text-emerald-300 uppercase tracking-wider font-mono">Avg ML Inference</span>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-1">18.4 <span className="text-xs font-normal text-neutral-500">ms</span></p>
            </div>
          </div>

          {/* Live Feed Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-950/60 text-xs font-mono text-neutral-400 uppercase border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Incident / Threat</th>
                  <th className="px-5 py-3">Source Identifier</th>
                  <th className="px-5 py-3">Model & Score</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {sampleAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-neutral-200">{alert.title}</div>
                      <div className="text-xs text-neutral-400 font-mono mt-0.5">{alert.threat_type}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-neutral-300">
                      {alert.source}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-xs font-mono text-emerald-400 font-bold">{(alert.confidence * 100).toFixed(0)}% Conf</div>
                      <div className="text-[11px] font-mono text-neutral-500">{alert.model}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={alert.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono text-xs text-neutral-400">
                      {alert.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Footer CTA */}
          <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>Full triage drawer, confidence feature breakdown, & event playback active.</span>
            </div>
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-sans font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Open Interactive Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  )
}
