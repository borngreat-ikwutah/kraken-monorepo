import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import type { AlertItem } from "../types/alert.types"
import { SeverityBadge } from "./SeverityBadge"
import { StatusBadge } from "./StatusBadge"
import { 
  Empty, 
  EmptyMedia, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription 
} from "@workspace/ui/components/empty"
import { 
  Check, 
  ArrowUpRight, 
  XCircle, 
  Brain, 
  TerminalWindow, 
  Crosshair,
  Bell,
  Copy,
  User,
  EnvelopeSimple,
  PaperPlaneTilt
} from "@phosphor-icons/react"

interface AlertDetailDrawerProps {
  alert: AlertItem | null
  onAction: (alertId: number, status: string, feedback?: string) => void
}

export function AlertDetailDrawer({ alert, onAction }: AlertDetailDrawerProps) {
  const [selectedAssignee, setSelectedAssignee] = useState<string>("Alex Mercer (SOC Lead)")
  const [selectedChannel, setSelectedChannel] = useState<string>("Email Dispatch")
  const [dispatchMessage, setDispatchMessage] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  const handleDispatchAlert = () => {
    if (!alert) return
    setDispatchMessage(`Dispatched Incident #${alert.id} to ${selectedAssignee} via ${selectedChannel}`)
    setTimeout(() => {
      setDispatchMessage(null)
    }, 4500)
  }

  const handleCopyBrief = () => {
    if (!alert) return
    const text = `[KrakenSec Incident #${alert.id}] ${alert.severity} ${alert.threat_type}\nSummary: ${alert.summary}\nSource IP: ${alert.event?.source_ip || "N/A"} -> ${alert.event?.destination_ip || "N/A"}\nModel: ${alert.prediction?.model_name || "ML Ensemble"} (${((alert.prediction?.score || 0) * 100).toFixed(1)}% confidence)`
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  if (!alert) {
    return (
      <Card className="bg-white border-neutral-200/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <CardTitle className="text-base font-bold text-neutral-950">Incident Investigation</CardTitle>
          <p className="text-xs text-neutral-500">Payload inspection & model attribution</p>
        </CardHeader>
        <CardContent className="p-6">
          <Empty className="my-12">
            <EmptyMedia variant="icon">
              <Crosshair className="w-6 h-6 text-neutral-400" weight="duotone" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Incident Selected</EmptyTitle>
              <EmptyDescription>
                Select an alert from the live feed to inspect telemetry payloads, model confidence scores, and take triage action.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
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
              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-semibold rounded-xl"
              onClick={() => onAction(alert.id, "ACKNOWLEDGED", "TRUE_POSITIVE")}
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              <span>Acknowledge</span>
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold rounded-xl"
              onClick={() => onAction(alert.id, "RESOLVED", "TRUE_POSITIVE")}
            >
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Resolve</span>
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200 font-semibold rounded-xl"
              onClick={() => onAction(alert.id, "FALSE_POSITIVE", "FALSE_POSITIVE")}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              <span>False Pos</span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Alert / Escalate to Specific Person or Team */}
        <div className="space-y-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Escalate & Alert Team:</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyBrief}
              className="h-6 px-2 text-[10px] text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
              title="Copy incident investigation brief to clipboard"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedLink ? "Copied!" : "Copy Brief"}</span>
            </Button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                Assignee / Responder:
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Alex Mercer (SOC Lead)">Alex Mercer (SOC Lead)</option>
                  <option value="Sarah Connor (Incident Responder)">Sarah Connor (Incident Responder)</option>
                  <option value="DevSecOps On-Call Team">DevSecOps On-Call Team</option>
                  <option value="Network Infrastructure Admin">Network Infrastructure Admin</option>
                  <option value="Threat Intelligence Team">Threat Intelligence Team</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                Notification Method:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel("Email (Urgent Dispatch)")}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    selectedChannel.includes("Email")
                      ? "bg-blue-50 border-blue-300 text-blue-800 shadow-2xs"
                      : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <EnvelopeSimple className="w-3.5 h-3.5 text-rose-500" weight="duotone" />
                  <span>Email Dispatch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel("SOC Console Notification")}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    selectedChannel.includes("SOC Console")
                      ? "bg-blue-50 border-blue-300 text-blue-800 shadow-2xs"
                      : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 text-blue-600" weight="duotone" />
                  <span>SOC Console</span>
                </button>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleDispatchAlert}
              className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <PaperPlaneTilt className="w-3.5 h-3.5" weight="bold" />
              <span>Dispatch Alert to {selectedAssignee.split(" ")[0]}</span>
            </Button>

            {dispatchMessage && (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold text-center animate-fadeIn">
                ✓ {dispatchMessage}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
