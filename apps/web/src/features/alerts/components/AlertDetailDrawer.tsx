import { Button } from "@workspace/ui/components/button"
import type { AlertItem } from "../types/alert.types"
import { SeverityBadge } from "./SeverityBadge"

interface AlertDetailDrawerProps {
  alert: AlertItem | null
  onAction: (alertId: number, status: string, feedback?: string) => void
}

export function AlertDetailDrawer({ alert, onAction }: AlertDetailDrawerProps) {
  if (!alert) {
    return (
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5">
        <h2 className="text-base font-semibold mb-4">Alert Detail & Investigation</h2>
        <div className="py-20 text-center text-neutral-500 text-xs">
          <p>Select an alert from the feed to inspect telemetry payloads, model decision explanations, and take analyst action.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5">
      <h2 className="text-base font-semibold mb-4">Alert Detail & Investigation</h2>

      <div className="space-y-4 text-xs leading-relaxed">
        <div className="p-3 bg-neutral-900 rounded-md border border-neutral-800 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-neutral-400">Alert ID:</span>
            <span className="font-mono font-bold">#{alert.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Severity:</span>
            <SeverityBadge severity={alert.severity} />
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Status:</span>
            <span className="font-mono">{alert.status}</span>
          </div>
        </div>

        {/* Telemetry Payload */}
        <div>
          <p className="font-semibold text-neutral-300 mb-1">Telemetry Payload:</p>
          <div className="p-3 bg-black/60 rounded border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-40">
            {alert.event?.raw_payload}
          </div>
        </div>

        {/* Model Explanation */}
        {alert.prediction && (
          <div className="p-3 bg-neutral-900/80 rounded border border-neutral-800 space-y-2">
            <p className="font-semibold text-neutral-300">ML Model Decision Explanation:</p>
            <p className="text-neutral-400">{alert.prediction.explanation}</p>
            <div className="w-full bg-neutral-800 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${alert.prediction.score * 100}%` }}
              />
            </div>
            <p className="text-right text-[10px] text-neutral-500">Threat Score: {(alert.prediction.score * 100).toFixed(1)}%</p>
          </div>
        )}

        {/* Analyst Actions */}
        <div className="pt-3 border-t border-neutral-800 space-y-2">
          <p className="font-semibold text-neutral-300">Analyst Workflow Actions:</p>
          <div className="flex flex-wrap gap-2">
            <Button 
              className="text-xs bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/40"
              onClick={() => onAction(alert.id, "ACKNOWLEDGED", "TRUE_POSITIVE")}
            >
              Acknowledge
            </Button>
            <Button 
              className="text-xs bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/40"
              onClick={() => onAction(alert.id, "RESOLVED", "TRUE_POSITIVE")}
            >
              Resolve
            </Button>
            <Button 
              className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
              onClick={() => onAction(alert.id, "FALSE_POSITIVE", "FALSE_POSITIVE")}
            >
              Mark False Positive
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
