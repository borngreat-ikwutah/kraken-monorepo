import { CheckCircle, WarningCircle, ArrowClockwise } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import type { useIngest } from "../hooks/useIngest"
import { ModelComparisonCards } from "./ModelComparisonCards"
import { FeatureExtractorBreakdown } from "./FeatureExtractorBreakdown"

type UseIngestReturn = ReturnType<typeof useIngest>

interface WizardResultStepProps {
  ingest: UseIngestReturn
  onRestart: () => void
}

export function WizardResultStep({ ingest, onRestart }: WizardResultStepProps) {
  const { loading, error, result } = ingest

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-10 h-10 mx-auto rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-sm font-bold text-slate-900 mt-4">Checking with our models…</p>
        <p className="text-xs text-slate-500 mt-1">This usually takes a few seconds.</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="text-center py-8">
        <WarningCircle className="w-10 h-10 text-rose-500 mx-auto" weight="fill" />
        <p className="text-sm font-bold text-slate-900 mt-3">Something went wrong</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {error || "We couldn't finish the check. Please try again."}
        </p>
        <Button
          type="button"
          onClick={onRestart}
          variant="outline"
          className="mt-4 rounded-xl text-xs font-semibold"
        >
          <ArrowClockwise className="w-3.5 h-3.5 mr-1.5" weight="bold" />
          <span>Try again</span>
        </Button>
      </div>
    )
  }

  const score = Math.round(result.prediction.score * 100)
  const isDanger = result.severity === "CRITICAL" || result.severity === "HIGH"
  const isSuspicious = result.severity === "MEDIUM"
  const headline = isDanger
    ? "Looks dangerous — take action"
    : isSuspicious
      ? "Looks suspicious — worth a look"
      : "Looks safe"
  const advice = isDanger
    ? "We recommend blocking this and alerting your team. Details for experts are below."
    : isSuspicious
      ? "Not clearly bad, but unusual. Keep an eye on it or ask a teammate."
      : "No strong threat signs found. You can move on."

  return (
    <div>
      <div
        className={`p-5 rounded-2xl border text-center ${
          isDanger
            ? "bg-rose-50 border-rose-200"
            : isSuspicious
              ? "bg-amber-50 border-amber-200"
              : "bg-emerald-50 border-emerald-200"
        }`}
      >
        {isDanger || isSuspicious ? (
          <WarningCircle
            className={`w-8 h-8 mx-auto ${isDanger ? "text-rose-600" : "text-amber-600"}`}
            weight="fill"
          />
        ) : (
          <CheckCircle className="w-8 h-8 mx-auto text-emerald-600" weight="fill" />
        )}
        <p className="text-lg font-extrabold text-slate-900 mt-2">{headline}</p>
        <p className="text-3xl font-black font-mono mt-1 text-slate-900">{score}<span className="text-base font-bold text-slate-500">/100</span></p>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Threat score</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <Badge
            className={`font-bold text-[11px] ${
              isDanger
                ? "bg-rose-600 text-white"
                : isSuspicious
                  ? "bg-amber-500 text-white"
                  : "bg-emerald-600 text-white"
            }`}
          >
            {result.severity}
          </Badge>
          <span className="text-[11px] font-semibold text-slate-600">
            {result.prediction.threat_label.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-slate-600 mt-3 max-w-md mx-auto leading-relaxed">{advice}</p>
        {(result.alert_id || result.alert?.id) && (
          <p className="text-[11px] text-blue-700 font-semibold mt-2">
            Saved as Alert #{result.alert_id || result.alert?.id} — it now appears in Incident Triage.
          </p>
        )}
      </div>

      <details className="mt-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
        <summary className="text-xs font-bold text-slate-700 cursor-pointer">
          How did we decide? (expert details)
        </summary>
        <div className="mt-4 space-y-4">
          <ModelComparisonCards result={result} />
          <FeatureExtractorBreakdown features={result.features} />
        </div>
      </details>

      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onRestart}
          className="rounded-xl text-xs font-semibold"
        >
          <ArrowClockwise className="w-3.5 h-3.5 mr-1.5" weight="bold" />
          <span>Check something else</span>
        </Button>
      </div>
    </div>
  )
}
