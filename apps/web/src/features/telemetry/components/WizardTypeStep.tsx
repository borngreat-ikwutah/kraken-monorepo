import { Globe, EnvelopeSimple, ArrowsLeftRight } from "@phosphor-icons/react"
import type { SubmissionMode } from "../types/ingest.types"
import type { WizardChoice } from "../types/wizard.types"

interface WizardTypeStepProps {
  onChoose: (mode: SubmissionMode) => void
}

const CHOICES: Array<{
  mode: WizardChoice
  title: string
  description: string
  example: string
  icon: typeof Globe
  accent: string
}> = [
  {
    mode: "url",
    title: "Suspicious link",
    description: "Paste a URL that looks off. We'll check if it's phishing or malware.",
    example: "e.g. login-appleid-verify… .click",
    icon: Globe,
    accent: "border-blue-200 hover:border-blue-400 hover:bg-blue-50/50",
  },
  {
    mode: "email",
    title: "Suspicious email",
    description: "Paste the sender and message. We look for pressure tactics and fake logins.",
    example: "e.g. “FINAL WARNING: verify now…”",
    icon: EnvelopeSimple,
    accent: "border-amber-200 hover:border-amber-400 hover:bg-amber-50/50",
  },
  {
    mode: "flow",
    title: "Odd network activity",
    description: "Enter connection details. We spot data theft or remote control.",
    example: "e.g. large upload to port 4444",
    icon: ArrowsLeftRight,
    accent: "border-purple-200 hover:border-purple-400 hover:bg-purple-50/50",
  },
]

export function WizardTypeStep({ onChoose }: WizardTypeStepProps) {
  return (
    <div>
      <h3 className="text-base font-bold text-slate-900">What do you want to check?</h3>
      <p className="text-xs text-slate-500 mt-1">
        Pick one. No setup needed — you can try an example in one click.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {CHOICES.map((choice) => {
          const Icon = choice.icon
          return (
            <button
              key={choice.mode}
              type="button"
              onClick={() => onChoose(choice.mode)}
              className={`text-left p-4 rounded-2xl border bg-white transition-all shadow-2xs ${choice.accent}`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-slate-700" weight="bold" />
              </div>
              <p className="text-sm font-bold text-slate-900 mt-3">{choice.title}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{choice.description}</p>
              <p className="text-[11px] text-slate-400 mt-2 font-mono truncate">{choice.example}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
