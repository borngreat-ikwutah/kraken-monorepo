import { ArrowLeft, PaperPlaneTilt, Lightning } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import type { useIngest } from "../hooks/useIngest"

type UseIngestReturn = ReturnType<typeof useIngest>

interface WizardInputStepProps {
  ingest: UseIngestReturn
  onBack: () => void
  onAnalyzed: () => void
}

export function WizardInputStep({ ingest, onBack, onAnalyzed }: WizardInputStepProps) {
  const {
    submissionMode,
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
    submitIngest,
    loadPreset,
  } = ingest

  const canContinue =
    submissionMode === "url"
      ? inputUrl.trim().length > 0
      : submissionMode === "email"
        ? inputEmailText.trim().length > 0
        : submissionMode === "flow"
          ? inputSrcIp.trim().length > 0
          : false

  const handleAnalyze = async () => {
    await submitIngest()
    onAnalyzed()
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
        <span>Back to choices</span>
      </button>

      {submissionMode === "url" && (
        <div className="mt-3">
          <h3 className="text-base font-bold text-slate-900">Paste the suspicious link</h3>
          <p className="text-xs text-slate-500 mt-1">
            Just the link is enough. Or try an example below.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <ExampleChip label="Phishing example" onClick={() => loadPreset("url_phish")} />
            <ExampleChip label="Random-looking domain" onClick={() => loadPreset("dga")} />
            <ExampleChip label="Safe example" onClick={() => loadPreset("benign_url")} />
          </div>
          <div className="mt-3">
            <Label htmlFor="wizard-url" className="text-xs font-bold text-slate-700">
              Link to check
            </Label>
            <Input
              id="wizard-url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste a link here, e.g. https://…"
              className="mt-1 text-sm bg-slate-50/60 border-slate-200 rounded-xl"
            />
          </div>
        </div>
      )}

      {submissionMode === "email" && (
        <div className="mt-3">
          <h3 className="text-base font-bold text-slate-900">Paste the suspicious email</h3>
          <p className="text-xs text-slate-500 mt-1">
            Sender plus message is enough. Or try the example.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <ExampleChip label="Urgent scam example" onClick={() => loadPreset("email_urgent")} />
          </div>
          <div className="space-y-3 mt-3">
            <div>
              <Label htmlFor="wizard-sender" className="text-xs font-bold text-slate-700">
                Who sent it?
              </Label>
              <Input
                id="wizard-sender"
                value={inputSender}
                onChange={(e) => setInputSender(e.target.value)}
                placeholder="e.g. security@paypal-verify.info"
                className="mt-1 text-sm bg-slate-50/60 border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="wizard-body" className="text-xs font-bold text-slate-700">
                What does it say?
              </Label>
              <textarea
                id="wizard-body"
                rows={4}
                value={inputEmailText}
                onChange={(e) => setInputEmailText(e.target.value)}
                placeholder="Paste the email text here…"
                className="w-full mt-1 p-3 text-sm bg-slate-50/60 text-slate-900 rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {submissionMode === "flow" && (
        <div className="mt-3">
          <h3 className="text-base font-bold text-slate-900">Describe the connection</h3>
          <p className="text-xs text-slate-500 mt-1">
            Rough numbers are fine. Or load the attack example.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <ExampleChip label="Data-theft example" onClick={() => loadPreset("network_c2")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <Label htmlFor="wizard-src" className="text-xs font-bold text-slate-700">
                Computer address (IP)
              </Label>
              <Input
                id="wizard-src"
                value={inputSrcIp}
                onChange={(e) => setInputSrcIp(e.target.value)}
                placeholder="e.g. 185.220.101.5"
                className="mt-1 text-sm font-mono bg-slate-50/60 border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="wizard-port" className="text-xs font-bold text-slate-700">
                Port number
              </Label>
              <Input
                id="wizard-port"
                value={inputDstPort}
                onChange={(e) => setInputDstPort(e.target.value)}
                placeholder="e.g. 4444"
                className="mt-1 text-sm font-mono bg-slate-50/60 border-slate-200 rounded-xl"
              />
              <p className="text-[11px] text-slate-400 mt-1">4444 often means remote control.</p>
            </div>
            <div>
              <Label htmlFor="wizard-bytes" className="text-xs font-bold text-slate-700">
                Data sent (bytes)
              </Label>
              <Input
                id="wizard-bytes"
                value={inputBytes}
                onChange={(e) => setInputBytes(e.target.value)}
                placeholder="e.g. 2450000"
                className="mt-1 text-sm font-mono bg-slate-50/60 border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="wizard-packets" className="text-xs font-bold text-slate-700">
                Number of packets
              </Label>
              <Input
                id="wizard-packets"
                value={inputPackets}
                onChange={(e) => setInputPackets(e.target.value)}
                placeholder="e.g. 12800"
                className="mt-1 text-sm font-mono bg-slate-50/60 border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          Couldn&apos;t check that. {error} Please try again.
        </div>
      )}

      {!canContinue && (
        <p className="text-[11px] text-slate-400 mt-3">
          Paste something above to continue — the Check button will light up.
        </p>
      )}

      <div className="pt-4 flex justify-end">
        <Button
          type="button"
          disabled={loading || !canContinue}
          onClick={handleAnalyze}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Lightning className="w-4 h-4 animate-spin" />
              <span>Checking… (a few seconds)</span>
            </>
          ) : (
            <>
              <PaperPlaneTilt className="w-4 h-4" weight="bold" />
              <span>Check for threats</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function ExampleChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] font-semibold px-2.5 py-1.5 bg-white text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
    >
      Try: {label}
    </button>
  )
}
