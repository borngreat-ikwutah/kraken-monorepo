import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { 
  TerminalWindow, 
  PaperPlaneTilt, 
  CheckCircle, 
  ArrowRight
} from "@phosphor-icons/react"
import type { IngestionResult } from "../../telemetry/types/ingest.types"
import { ingestEventApi } from "../../telemetry/api/ingestService"

export function LandingTelemetrySimulator() {
  const [activeTab, setActiveTab] = useState<"network" | "email" | "url">("network")
  const [loading, setLoading] = useState<boolean>(false)
  const [responseLog, setResponseLog] = useState<IngestionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const sampleEvents = {
    network: {
      source_type: "network",
      raw_payload: {
        src_ip: "192.168.1.105",
        dst_ip: "10.0.0.5",
        dst_port: 445,
        protocol: "TCP",
        duration: 0.12,
        bytes_sent: 45000,
        bytes_recv: 120,
        packets: 320
      }
    },
    email: {
      source_type: "email",
      raw_payload: {
        sender: "support-update@banking-secure-auth.net",
        recipient: "cfo@company.internal",
        subject: "URGENT: Immediate Account Suspension Notice - Action Required",
        body_text: "Dear User, Your corporate credentials will be revoked in 2 hours. Click here immediately to verify: http://bit.ly/bank-auth-verify"
      }
    },
    url: {
      source_type: "url",
      raw_payload: {
        url: "http://secure-login.micros0ft-support.ru/oauth2/token-refresh",
        submitted_by: "endpoint_edr_agent"
      }
    }
  }

  const handleSimulate = async () => {
    setLoading(true)
    setResponseLog(null)
    setErrorMessage(null)
    try {
      const payload = sampleEvents[activeTab]
      const result = await ingestEventApi(payload)
      setResponseLog(result)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to simulate ingestion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="pipeline" className="py-20 border-t border-neutral-900 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Interactive Test Sandbox
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 mt-2">
            Simulate Security Telemetry Ingest
          </h2>
          <p className="text-neutral-400 mt-3 text-base sm:text-lg">
            Dispatch mock security events directly to the detection pipeline API and observe ML model inference responses.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-xl overflow-hidden shadow-2xl">
          
          {/* Header with Event Tabs */}
          <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90 gap-4">
            <div className="flex items-center gap-2">
              <TerminalWindow className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold text-sm text-neutral-200">Select Telemetry Vector:</span>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-neutral-950/80 border border-neutral-800">
              <button
                type="button"
                onClick={() => { setActiveTab("network"); setResponseLog(null); }}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                  activeTab === "network" 
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" 
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Network Flow
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("email"); setResponseLog(null); }}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                  activeTab === "email" 
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" 
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Phishing Email
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("url"); setResponseLog(null); }}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                  activeTab === "url" 
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" 
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Malicious URL
              </button>
            </div>
          </div>

          {/* Code Payload & Action */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3 text-xs text-neutral-400 font-mono">
              <span>POST /api/telemetry/ingest</span>
              <span>Payload JSON</span>
            </div>

            <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-cyan-300 overflow-x-auto">
              {JSON.stringify(sampleEvents[activeTab], null, 2)}
            </pre>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">
              <p className="text-xs text-neutral-400">
                Dispatches to backend ML pipeline for feature extraction, anomaly evaluation, and alert registration.
              </p>

              <button
                type="button"
                onClick={handleSimulate}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <PaperPlaneTilt className="w-4 h-4" weight="bold" />
                <span>{loading ? "Evaluating in ML Engine..." : "Ingest & Infer Event"}</span>
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300">
                <p className="font-bold">Ingestion Failed:</p>
                <p className="mt-1">{errorMessage}</p>
              </div>
            )}

            {/* Inference Result Box */}
            {responseLog && (
              <div className="mt-6 p-4 rounded-xl bg-neutral-950/80 border border-emerald-500/40 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle className="w-4 h-4" weight="fill" />
                    <span>ML Pipeline Ingestion Succeeded</span>
                  </div>
                  <Link to="/dashboard" className="text-emerald-400 hover:underline flex items-center gap-1">
                    <span>View in Alert Feed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <pre className="text-neutral-300 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(responseLog, null, 2)}
                </pre>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  )
}
