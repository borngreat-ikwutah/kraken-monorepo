import type { ReactNode } from "react"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { SeverityBadge } from "../../alerts/components/SeverityBadge"
import { StatusBadge } from "../../alerts/components/StatusBadge"
import type { AlertItem, SeverityType } from "../../alerts/types/alert.types"
import { useIncidentTriage } from "../hooks/useIncidentTriage"
import {
  ArrowUpRight,
  Bell,
  Brain,
  Check,
  Copy,
  Crosshair,
  EnvelopeSimple,
  PaperPlaneTilt,
  TerminalWindow,
  User,
  X,
  XCircle,
} from "@phosphor-icons/react"

interface IncidentTriageDrawerProps {
  alert: AlertItem | null
  onClose: () => void
  onRefresh: () => void
}

interface DetailRowProps {
  label: string
  children: ReactNode
}

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="truncate text-right font-mono font-semibold text-slate-800">
        {children}
      </span>
    </div>
  )
}

const SEVERITY_ACCENT: Record<SeverityType, string> = {
  CRITICAL: "border-t-rose-500",
  HIGH: "border-t-orange-500",
  MEDIUM: "border-t-amber-500",
  LOW: "border-t-blue-500",
}

export function IncidentTriageDrawer({
  alert,
  onClose,
  onRefresh,
}: IncidentTriageDrawerProps) {
  const {
    details,
    detailsLoading,
    actionLoading,
    copiedBrief,
    dispatchMessage,
    selectedAssignee,
    selectedChannel,
    setSelectedAssignee,
    setSelectedChannel,
    handleAction,
    handleCopyBrief,
    handleDispatchAlert,
  } = useIncidentTriage({ alert, onClose, onRefresh })

  if (!alert) return null

  const severity: SeverityType = details?.severity ?? alert.severity
  const detectedAt = details?.created_at
    ? new Date(details.created_at).toLocaleString()
    : "N/A"

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 animate-in bg-slate-900/30 backdrop-blur-sm duration-200 fade-in"
      />

      {/* Right-aligned slide-over panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="incident-drawer-title"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md animate-in flex-col overflow-hidden border-t-4 border-l border-slate-200 bg-slate-50 shadow-2xl duration-300 slide-in-from-right ${SEVERITY_ACCENT[severity]}`}
      >
        {/* Drawer Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <h2
              id="incident-drawer-title"
              className="text-base font-bold text-slate-900"
            >
              Incident Details
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                #{alert.id}
              </span>
              <SeverityBadge severity={severity} />
              {details && <StatusBadge status={details.status} />}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close incident details"
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X weight="bold" className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 text-xs">
          {detailsLoading && !details ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
              <p>Fetching incident #{alert.id} payload...</p>
            </div>
          ) : details ? (
            <>
              {/* Incident identity */}
              <div className="space-y-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">
                    Threat Vector:
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {details.threat_type}
                  </span>
                </div>
                <DetailRow label="Event Type:">
                  {details.event?.event_type || "N/A"}
                </DetailRow>
                <DetailRow label="Source IP:">
                  {details.event?.source_ip || "N/A"}
                </DetailRow>
                <DetailRow label="Destination IP:">
                  {details.event?.destination_ip || "N/A"}
                </DetailRow>
                <DetailRow label="Detected At:">{detectedAt}</DetailRow>
              </div>

              <div className="space-y-1.5">
                <p className="font-semibold text-slate-900">Incident Summary</p>
                <p className="leading-relaxed text-slate-600">
                  {details.summary}
                </p>
              </div>

              {/* Raw telemetry payload */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <TerminalWindow className="h-4 w-4 text-slate-600" />
                  <span>Raw Event Payload</span>
                </div>
                <pre className="max-h-48 overflow-auto rounded-xl bg-slate-900 p-3.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-100 shadow-inner">
                  {details.event?.raw_payload || "No raw payload available"}
                </pre>
              </div>
              {/* Model signal attribution */}
              {details.prediction && (
                <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-950">
                    <Brain className="h-4 w-4 text-blue-600" weight="duotone" />
                    <span>Model Signal Attribution</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {details.prediction.explanation}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                      <span className="font-mono">
                        {details.prediction.model_name}
                      </span>
                      <span className="font-bold text-blue-700">
                        {(details.prediction.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                        style={{
                          width: `${Math.min(details.prediction.score * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Classification label:{" "}
                      <span className="font-mono font-semibold">
                        {details.prediction.threat_label}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <Separator className="my-2" />

              {/* Analyst workflow actions (PATCH /api/alerts/:id) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">
                    Analyst Workflow Action
                  </p>
                  {actionLoading && (
                    <span className="text-[10px] font-semibold text-blue-600">
                      Saving…
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                      actionLoading || details.status === "ACKNOWLEDGED"
                    }
                    onClick={() => handleAction("ACKNOWLEDGED")}
                    className="h-8 gap-1 border-blue-200 bg-blue-50 text-xs text-blue-700 hover:bg-blue-100"
                  >
                    <Check className="h-3.5 w-3.5" /> Ack
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={actionLoading || details.status === "RESOLVED"}
                    onClick={() => handleAction("RESOLVED", "TRUE_POSITIVE")}
                    className="h-8 gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700 hover:bg-emerald-100"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" /> Resolve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                      actionLoading || details.status === "FALSE_POSITIVE"
                    }
                    onClick={() =>
                      handleAction("FALSE_POSITIVE", "FALSE_POSITIVE")
                    }
                    className="h-8 gap-1 border-slate-200 bg-slate-100 text-xs text-slate-600 hover:bg-slate-200"
                  >
                    <XCircle className="h-3.5 w-3.5" /> False
                  </Button>
                </div>

                {details.analyst_feedback && (
                  <p className="flex items-start gap-1.5 rounded-lg bg-slate-100 p-2.5 text-[11px] text-slate-600">
                    <Crosshair className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <span>
                      <span className="font-semibold">Analyst feedback:</span>{" "}
                      {details.analyst_feedback}
                    </span>
                  </p>
                )}
              </div>

              {/* Escalation & notification builder */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Bell className="h-4 w-4 text-blue-600" weight="duotone" />
                    Escalate &amp; Alert Team
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={handleCopyBrief}
                    className={`h-6 px-2 text-[10px] ${
                      copiedBrief
                        ? "text-emerald-600"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {copiedBrief ? (
                      <Check
                        className="mr-1 h-3 w-3 text-emerald-500"
                        weight="bold"
                      />
                    ) : (
                      <Copy className="mr-1 h-3 w-3" />
                    )}
                    {copiedBrief ? "Copied!" : "Copy Brief"}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="incident-assignee"
                      className="text-[10px] font-bold tracking-widest text-slate-500 uppercase"
                    >
                      Assignee / Responder
                    </label>
                    <div className="relative">
                      <User className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-slate-400" />
                      <select
                        id="incident-assignee"
                        value={selectedAssignee}
                        onChange={(event) =>
                          setSelectedAssignee(event.target.value)
                        }
                        className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pr-3 pl-8 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Alex Mercer (SOC Lead)">
                          Alex Mercer (SOC Lead)
                        </option>
                        <option value="Sarah Chen (L2 Analyst)">
                          Sarah Chen (L2 Analyst)
                        </option>
                        <option value="Marcus Johnson (IR Team)">
                          Marcus Johnson (IR Team)
                        </option>
                        <option value="Threat Intelligence Team">
                          Threat Intelligence Team
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                      Notification Method
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        aria-pressed={selectedChannel === "Email Dispatch"}
                        onClick={() => setSelectedChannel("Email Dispatch")}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-semibold transition-all ${
                          selectedChannel === "Email Dispatch"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <EnvelopeSimple className="h-3.5 w-3.5" /> Email
                        Dispatch
                      </button>
                      <button
                        type="button"
                        aria-pressed={selectedChannel === "SOC Console"}
                        onClick={() => setSelectedChannel("SOC Console")}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-semibold transition-all ${
                          selectedChannel === "SOC Console"
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Bell className="h-3.5 w-3.5" /> SOC Console
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleDispatchAlert}
                    className="mt-1 h-8 w-full gap-2 bg-blue-600 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    <PaperPlaneTilt weight="fill" className="h-3.5 w-3.5" />
                    Dispatch Alert to {selectedAssignee.split(" ")[0]}
                  </Button>

                  {dispatchMessage && (
                    <p className="animate-in rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-center text-[10px] font-semibold text-emerald-700 fade-in slide-in-from-bottom-2">
                      <Check className="mr-1 inline h-3 w-3" weight="bold" />
                      {dispatchMessage}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="py-16 text-center text-slate-400">
              Incident #{alert.id} could not be loaded. Refresh the feed to
              retry.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
