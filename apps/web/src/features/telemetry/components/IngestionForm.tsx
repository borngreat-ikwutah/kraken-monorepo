import { 
  Globe, 
  Code, 
  EnvelopeSimple, 
  ArrowsLeftRight, 
  PaperPlaneTilt, 
  Sparkle, 
  ShieldCheck, 
  Lightning 
} from "@phosphor-icons/react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import type { useIngest } from "../hooks/useIngest"

type UseIngestReturn = ReturnType<typeof useIngest>

interface IngestionFormProps {
  ingest: UseIngestReturn
}

export function IngestionForm({ ingest }: IngestionFormProps) {
  const {
    submissionMode,
    setSubmissionMode,
    loading,
    error,
    inputUrl,
    setInputUrl,
    inputEmailText,
    setInputEmailText,
    inputSender,
    setInputSender,
    inputSrcIp,
    setInputSrcIp,
    inputDstPort,
    setInputDstPort,
    inputBytes,
    setInputBytes,
    inputPackets,
    setInputPackets,
    customJsonPayload,
    setCustomJsonPayload,
    submitIngest,
    loadPreset
  } = ingest

  return (
    <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
      <CardHeader className="pb-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Telemetry Ingestion & Feature Extractor</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit raw security telemetry to trigger feature extractors, Transformer & Random Forest inference, and database persistence.
            </p>
          </div>

          {/* Quick Presets Menu */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Presets:
            </span>
            <button
              type="button"
              onClick={() => loadPreset("url_phish")}
              className="text-[11px] font-semibold px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
            >
              <Sparkle className="w-3 h-3 text-blue-600" />
              <span>Phish URL</span>
            </button>
            <button
              type="button"
              onClick={() => loadPreset("dga")}
              className="text-[11px] font-semibold px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors flex items-center gap-1"
            >
              <Sparkle className="w-3 h-3 text-purple-600" />
              <span>DGA / C2</span>
            </button>
            <button
              type="button"
              onClick={() => loadPreset("email_urgent")}
              className="text-[11px] font-semibold px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors flex items-center gap-1"
            >
              <EnvelopeSimple className="w-3 h-3 text-amber-600" />
              <span>Phish Email</span>
            </button>
            <button
              type="button"
              onClick={() => loadPreset("benign_url")}
              className="text-[11px] font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Benign URL</span>
            </button>
          </div>
        </div>

        {/* Vector Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 border border-slate-200 rounded-xl mt-3 w-fit">
          <button
            type="button"
            onClick={() => setSubmissionMode("url")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              submissionMode === "url"
                ? "bg-white text-blue-700 font-bold shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>URL Target</span>
          </button>

          <button
            type="button"
            onClick={() => setSubmissionMode("email")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              submissionMode === "email"
                ? "bg-white text-blue-700 font-bold shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <EnvelopeSimple className="w-3.5 h-3.5" />
            <span>Phishing Email</span>
          </button>

          <button
            type="button"
            onClick={() => setSubmissionMode("flow")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              submissionMode === "flow"
                ? "bg-white text-blue-700 font-bold shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ArrowsLeftRight className="w-3.5 h-3.5" />
            <span>Network Flow</span>
          </button>

          <button
            type="button"
            onClick={() => setSubmissionMode("payload")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              submissionMode === "payload"
                ? "bg-white text-blue-700 font-bold shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw JSON Payload</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
            Error submitting payload: {error}
          </div>
        )}

        <form onSubmit={submitIngest} className="space-y-4">
          {/* URL Mode */}
          {submissionMode === "url" && (
            <div className="space-y-2">
              <Label htmlFor="url-input" className="text-xs font-bold text-slate-700">
                Target URL or Domain String
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
                Extractor will calculate Shannon entropy, suspicious brand keywords, abnormal TLDs, and IP hostname usage.
              </p>
            </div>
          )}

          {/* Phishing Email Mode */}
          {submissionMode === "email" && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-bold text-slate-700">Sender Header Address</Label>
                <Input
                  value={inputSender}
                  onChange={(e) => setInputSender(e.target.value)}
                  className="mt-1 text-xs sm:text-sm bg-slate-50/60 border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-700">Email Body Text</Label>
                <textarea
                  rows={4}
                  value={inputEmailText}
                  onChange={(e) => setInputEmailText(e.target.value)}
                  className="w-full mt-1 p-3 text-xs sm:text-sm bg-slate-50/60 text-slate-900 rounded-xl border border-slate-200 focus:outline-blue-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Processed via Hugging Face DistilBERT NLP attention weights and Random Forest urgency/action-demand signals.
              </p>
            </div>
          )}

          {/* Network Flow Mode */}
          {submissionMode === "flow" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold text-slate-700">Source IP Address</Label>
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
                <Label className="text-xs font-bold text-slate-700">Bytes Transferred</Label>
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

          {/* Raw JSON Mode */}
          {submissionMode === "payload" && (
            <div className="space-y-2">
              <Label htmlFor="json-input" className="text-xs font-bold text-slate-700">
                Custom Ingestion JSON Payload
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
                Endpoint: <code className="font-mono text-slate-600">POST /api/ingest</code> with schema validation and database persistence.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 shadow-xs flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Lightning className="w-4 h-4 animate-spin text-white" />
                  <span>Evaluating In ML Engine...</span>
                </>
              ) : (
                <>
                  <PaperPlaneTilt className="w-4 h-4" weight="bold" />
                  <span>Analyze & Ingest Telemetry</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
