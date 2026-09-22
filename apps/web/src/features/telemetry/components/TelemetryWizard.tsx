import { useState } from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import type { useIngest } from "../hooks/useIngest"
import { WizardTypeStep } from "./WizardTypeStep"
import { WizardInputStep } from "./WizardInputStep"
import { WizardResultStep } from "./WizardResultStep"
import type { SubmissionMode } from "../types/ingest.types"
import type { WizardStep } from "../types/wizard.types"

type UseIngestReturn = ReturnType<typeof useIngest>

interface TelemetryWizardProps {
  ingest: UseIngestReturn
}

const STEP_LABELS = ["Choose", "Details", "Result"] as const

export function TelemetryWizard({ ingest }: TelemetryWizardProps) {
  const [step, setStep] = useState<WizardStep>(1)

  const handleChoose = (mode: SubmissionMode) => {
    ingest.setSubmissionMode(mode)
    ingest.setResult(null)
    setStep(2)
  }

  const handleRestart = () => {
    ingest.setResult(null)
    setStep(1)
  }

  return (
    <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
      <CardContent className="p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Check a threat in 3 quick steps
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pick what you found, paste it in, get a plain-English answer.
          </p>
        </div>

        <ol className="flex items-center gap-2 mt-5 mb-6" aria-label="Progress">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = (idx + 1) as WizardStep
            const isActive = step === stepNum
            const isDone = step > stepNum
            return (
              <li key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {stepNum}
                  </span>
                  <span
                    className={`text-xs font-semibold ${isActive ? "text-slate-900" : "text-slate-500"}`}
                  >
                    {label}
                  </span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div className={`h-px flex-1 mx-2 ${isDone ? "bg-emerald-300" : "bg-slate-200"}`} />
                )}
              </li>
            )
          })}
        </ol>

        {step === 1 && <WizardTypeStep onChoose={handleChoose} />}
        {step === 2 && (
          <WizardInputStep
            ingest={ingest}
            onBack={() => setStep(1)}
            onAnalyzed={() => setStep(3)}
          />
        )}
        {step === 3 && <WizardResultStep ingest={ingest} onRestart={handleRestart} />}
      </CardContent>
    </Card>
  )
}
