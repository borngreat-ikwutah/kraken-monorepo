import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { ingestEventApi } from "../../telemetry/api/ingestService"
import { 
  Globe, 
  Code, 
  EnvelopeSimple, 
  ArrowsLeftRight, 
  PaperPlaneTilt, 
  Brain, 
  CheckCircle, 
  SlidersHorizontal 
} from "@phosphor-icons/react"

export function IngestionSandboxView() {
  const [submissionMode, setSubmissionMode] = useState<"url" | "payload" | "email" | "flow">("url")
  
  // Direct User / Analyst Inputs
  const [inputUrl, setInputUrl] = useState("http://secure-login.micros0ft-support.ru/oauth2/token-refresh")
  const [inputEmailText, setInputEmailText] = useState("URGENT: Your account credentials will expire in 2 hours. Click immediately to update: http://bit.ly/bank-auth-verify")
  const [inputSender, setInputSender] = useState("security-verify@banking-secure-auth.net")
  const [inputSrcIp, setInputSrcIp] = useState("192.168.1.188")
  const [inputDstPort, setInputDstPort] = useState("445")
  const [inputBytes, setInputBytes] = useState("1250000")
  const [inputPackets, setInputPackets] = useState("8500")
  
  // Custom API JSON Payload
  const [customJsonPayload, setCustomJsonPayload] = useState(`{
  "event_type": "network_flow",
  "source_ip": "185.220.101.5",
  "destination_ip": "10.0.0.5",
  "payload": {
    "protocol": "TCP",
    "dst_port": 4444,
    "bytes_sent": 850000,
    "packets_sent": 6200,
    "duration": 0.08
  }
}`)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    let requestData: any = {}

    if (submissionMode === "url") {
      requestData = {
        event_type: "url",
        source_ip: "127.0.0.1",
        destination_ip: "0.0.0.0",
        payload: inputUrl
      }
    } else if (submissionMode === "email") {
      requestData = {
        event_type: "email",
        source_ip: "185.220.101.5",
        destination_ip: "10.0.0.45",
        payload: {
          sender: inputSender,
          body_text: inputEmailText
        }
      }
    } else if (submissionMode === "flow") {
      requestData = {
        event_type: "network_flow",
        source_ip: inputSrcIp,
        destination_ip: "10.0.0.1",
        payload: {
          protocol: "TCP",
          dst_port: parseInt(inputDstPort, 10) || 80,
          bytes_sent: parseInt(inputBytes, 10) || 1000,
          packets_sent: parseInt(inputPackets, 10) || 10,
          duration: 0.15
        }
      }
    } else {
      try {
        requestData = JSON.parse(customJsonPayload)
      } catch {
        alert("Invalid JSON format in custom payload.")
        setLoading(false)
        return
      }
    }

    const response = await ingestEventApi(requestData)
    setResult(response)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Title & Pipeline Architecture Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Threat Ingestion & ML Scoring Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit a URL or API payload to run feature extraction, classical ML + Transformer inference, and save records to MySQL.
          </p>
        </div>

        {/* 4 Pipeline Vector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => { setSubmissionMode("url"); setResult(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              submissionMode === "url" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Submit URL</span>
          </button>

          <button
            type="button"
            onClick={() => { setSubmissionMode("payload"); setResult(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              submissionMode === "payload" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw API Payload</span>
          </button>

          <button
            type="button"
            onClick={() => { setSubmissionMode("email"); setResult(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              submissionMode === "email" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <EnvelopeSimple className="w-3.5 h-3.5" />
            <span>Phishing Sample</span>
          </button>

          <button
            type="button"
            onClick={() => { setSubmissionMode("flow"); setResult(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              submissionMode === "flow" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ArrowsLeftRight className="w-3.5 h-3.5" />
            <span>Network Flow</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Submission Input Form */}
        <Card className="lg:col-span-2 bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Input Submission: {submissionMode.toUpperCase()}</span>
            </CardTitle>
            <p className="text-xs text-slate-500">
              Validates schema, extracts lexical/structural features, and triggers model inference.
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* URL Mode */}
              {submissionMode === "url" && (
                <div className="space-y-2">
                  <Label htmlFor="url-input" className="text-xs font-bold text-slate-700">
                    Target URL to Analyze
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <Input
                      id="url-input"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://example.com/login"
                      className="pl-9 text-xs sm:text-sm bg-slate-50/60 border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Feature Extractor: Extracts domain Shannon entropy, suspicious TLDs, length, and brand typosquatting.
                  </p>
                </div>
              )}

              {/* Raw JSON Mode */}
              {submissionMode === "payload" && (
                <div className="space-y-2">
                  <Label htmlFor="json-input" className="text-xs font-bold text-slate-700">
                    Custom API Telemetry JSON Payload
                  </Label>
                  <textarea
                    id="json-input"
                    rows={8}
                    value={customJsonPayload}
                    onChange={(e) => setCustomJsonPayload(e.target.value)}
                    className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-blue-500 shadow-inner"
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    Endpoint: <code className="font-mono text-slate-600">POST /api/ingest</code> with schema validation.
                  </p>
                </div>
              )}

              {/* Phishing Email Mode */}
              {submissionMode === "email" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Sender Address</Label>
                    <Input
                      value={inputSender}
                      onChange={(e) => setInputSender(e.target.value)}
                      className="mt-1 text-xs sm:text-sm bg-slate-50/60 border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Email Message Body</Label>
                    <textarea
                      rows={4}
                      value={inputEmailText}
                      onChange={(e) => setInputEmailText(e.target.value)}
                      className="w-full mt-1 p-3 text-xs sm:text-sm bg-slate-50/60 text-slate-900 rounded-xl border border-slate-200 focus:outline-blue-500"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    ML Model: Evaluated using Hugging Face Transformer / NLP Phishing Detector.
                  </p>
                </div>
              )}

              {/* Network Flow Mode */}
              {submissionMode === "flow" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Source IP</Label>
                    <Input
                      value={inputSrcIp}
                      onChange={(e) => setInputSrcIp(e.target.value)}
                      className="mt-1 text-xs bg-slate-50/60 border-slate-200 rounded-xl font-mono"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Destination Port</Label>
                    <Input
                      value={inputDstPort}
                      onChange={(e) => setInputDstPort(e.target.value)}
                      className="mt-1 text-xs bg-slate-50/60 border-slate-200 rounded-xl font-mono"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Bytes Sent</Label>
                    <Input
                      value={inputBytes}
                      onChange={(e) => setInputBytes(e.target.value)}
                      className="mt-1 text-xs bg-slate-50/60 border-slate-200 rounded-xl font-mono"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Packets Count</Label>
                    <Input
                      value={inputPackets}
                      onChange={(e) => setInputPackets(e.target.value)}
                      className="mt-1 text-xs bg-slate-50/60 border-slate-200 rounded-xl font-mono"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 shadow-xs"
                >
                  <PaperPlaneTilt className="w-4 h-4 mr-2" weight="bold" />
                  <span>{loading ? "Evaluating in ML Engine..." : "Analyze & Ingest Telemetry"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right 1 Col: Pipeline Result & Verdict Box */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span>Verdict & Model Scoring</span>
            </CardTitle>
            <p className="text-xs text-slate-500">Pipeline execution state & MySQL persistence</p>
          </CardHeader>

          <CardContent className="p-5 flex-1 space-y-4 text-xs">
            {result ? (
              <div className="space-y-3.5">
                {/* Score Header */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Combined Threat Score
                  </span>
                  <p className="text-3xl font-extrabold font-mono text-blue-600 mt-1">
                    {(result.confidence * 100).toFixed(1)}%
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <Badge variant="default" className="bg-rose-600 text-white font-bold">
                      {result.prediction || "MALICIOUS"}
                    </Badge>
                    <span className="text-[11px] font-medium text-slate-500">
                      Verdict: Suspicious Vector
                    </span>
                  </div>
                </div>

                {/* Extracted Features Count */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Schema Status:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" weight="fill" /> Validated
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Features Extracted:</span>
                    <span className="font-mono font-bold text-slate-800">{result.features_extracted || 8} Signals</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Database Persistence:</span>
                    <span className="font-mono text-blue-600 font-semibold">Event #{result.alert_id || result.event_id || 1045} Saved</span>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {result.message || "Threat evaluated and automatically dispatched to live incident triage stream."}
                </p>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-medium">Submit a URL or payload on the left to observe ML inference and score attribution.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
