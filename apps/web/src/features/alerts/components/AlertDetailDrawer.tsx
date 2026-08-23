import { Button } from "@workspace/ui/components/button"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import type { AlertItem } from "../types/alert.types"
import { SeverityBadge } from "./SeverityBadge"
import { StatusBadge } from "./StatusBadge"
import { Check, ArrowUpRight, XCircle, Brain, TerminalWindow } from "@phosphor-icons/react"

interface AlertDetailDrawerProps {
  alert: AlertItem | null
  onAction: (alertId: number, status: string, feedback?: string) => void
}

export function AlertDetailDrawer({ alert, onAction }: AlertDetailDrawerProps) {
  if (!alert) {
    return (
      <Card className="bg-white border-neutral-200/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <CardTitle className="text-base font-bold text-neutral-950">Incident Investigation</CardTitle>
          <p className="text-xs text-neutral-500">Payload inspection & model attribution</p>
        </CardHeader>
        <CardContent className="py-24 text-center text-neutral-400 text-xs">
          <p>Select an alert from the feed to inspect telemetry payloads, model decision explanations, and take analyst action.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-neutral-200/80 shadow-xs">
      <CardHeader className="pb-3 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-neutral-950">Incident Investigation</CardTitle>
          <span className="font-mono text-xs font-bold text-neutral-400">#{alert.id}</span>
        </div>
        <p className="text-xs text-neutral-500">Payload inspection & model attribution</p>
      </CardHeader>

      <CardContent className="p-5 space-y-5 text-xs">
        {/* Incident Status Info Box */}
        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500 font-medium">Severity Level:</span>
            <SeverityBadge severity={alert.severity} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500 font-medium">Current Status:</span>
            <StatusBadge status={alert.status} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500 font-medium">Threat Vector:</span>
            <span className="font-mono font-semibold text-neutral-800">{alert.threat_type}</span>
          </div>
        </div>

        {/* Telemetry Payload Box */}
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-neutral-900 mb-1.5">
            <TerminalWindow className="w-4 h-4 text-neutral-600" />
            <span>Telemetry Payload:</span>
          </div>
          <div className="p-3 bg-neutral-900 text-neutral-100 rounded-xl border border-neutral-800 font-mono text-[11px] overflow-x-auto max-h-44 shadow-inner">
            {alert.event?.raw_payload}
          </div>
        </div>

        {/* Model Explanation */}
        {alert.prediction && (
          <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 space-y-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-blue-950">
              <Brain className="w-4 h-4 text-blue-600" />
              <span>ML Model Decision & Explanation:</span>
            </div>
            <p className="text-neutral-700 leading-relaxed">{alert.prediction.explanation}</p>
            
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-medium text-neutral-600">
                <span>Threat Probability</span>
                <span className="font-bold text-blue-600">{(alert.prediction.score * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${alert.prediction.score * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Analyst Actions */}
        <div className="space-y-2.5">
          <p className="font-bold text-neutral-900">Analyst Workflow Actions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button 
              size="sm"
              variant="outline"
              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-semibold"
              onClick={() => onAction(alert.id, "ACKNOWLEDGED", "TRUE_POSITIVE")}
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              <span>Acknowledge</span>
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold"
              onClick={() => onAction(alert.id, "RESOLVED", "TRUE_POSITIVE")}
            >
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Resolve</span>
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200 font-semibold"
              onClick={() => onAction(alert.id, "FALSE_POSITIVE", "FALSE_POSITIVE")}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              <span>False Pos</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
