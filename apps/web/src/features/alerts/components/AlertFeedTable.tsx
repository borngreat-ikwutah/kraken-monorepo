import { useState } from "react"
import type { AlertItem } from "../types/alert.types"
import { SeverityBadge } from "./SeverityBadge"
import { StatusBadge } from "./StatusBadge"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { 
  Empty, 
  EmptyMedia, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription 
} from "@workspace/ui/components/empty"
import { MagnifyingGlass, ShieldWarning, Pause, Play } from "@phosphor-icons/react"

interface AlertFeedTableProps {
  alerts: AlertItem[]
  selectedAlert: AlertItem | null
  loading: boolean
  filterSeverity: string
  isPaused?: boolean
  bufferedCount?: number
  maxDisplayed?: number
  onSelectAlert: (alert: AlertItem) => void
  onFilterChange: (severity: string) => void
  onTogglePause?: () => void
  onFlushNow?: () => void
}

export function AlertFeedTable({
  alerts,
  selectedAlert,
  loading,
  filterSeverity,
  isPaused = false,
  bufferedCount = 0,
  maxDisplayed = 100,
  onSelectAlert,
  onFilterChange,
  onTogglePause,
  onFlushNow
}: AlertFeedTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAlerts = alerts.filter(a => {
    if (!searchTerm) return true
    const query = searchTerm.toLowerCase()
    return (
      a.summary.toLowerCase().includes(query) ||
      a.threat_type.toLowerCase().includes(query) ||
      (a.event?.source_ip ? a.event.source_ip.toLowerCase().includes(query) : false)
    )
  })

  return (
    <Card className="lg:col-span-2 bg-white border-neutral-200/80 shadow-xs">
      <CardHeader className="pb-3 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold text-neutral-950">Prioritized Alert Feed</CardTitle>
            {isPaused ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Feed Paused
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Batch Stream
              </span>
            )}
            <span className="text-[10px] font-mono text-neutral-400">
              Max: {maxDisplayed}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">Real-time incident stream and confidence scores</p>
        </div>

        <div className="flex items-center gap-2">
          {onTogglePause && (
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePause}
              className={`text-xs rounded-xl font-semibold gap-1.5 transition-all shadow-2xs h-8 px-3 ${
                isPaused
                  ? "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100"
                  : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-600" weight="fill" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-neutral-500" weight="fill" />
                  <span>Pause</span>
                </>
              )}
            </Button>
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
              <button
                key={sev}
                onClick={() => onFilterChange(sev)}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                  filterSeverity === sev 
                    ? "bg-neutral-900 text-white shadow-xs" 
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        {/* Paused Buffer Notification Banner */}
        {isPaused && bufferedCount > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold text-amber-950">
                {bufferedCount} new alert{bufferedCount === 1 ? "" : "s"} hidden in buffer
              </span>
            </div>
            {onFlushNow && (
              <Button
                size="sm"
                variant="outline"
                onClick={onFlushNow}
                className="text-xs h-7 px-3 bg-white border-amber-300 text-amber-900 hover:bg-amber-100/60 rounded-lg font-bold shadow-2xs"
              >
                Flush Buffer Now
              </Button>
            )}
          </div>
        )}
        {/* Search Filter Input */}
        <div className="relative mb-4">
          <MagnifyingGlass className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
          <Input 
            placeholder="Search by threat type, IP, or summary..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs sm:text-sm bg-neutral-50/50 border-neutral-200"
          />
        </div>

        {loading ? (
          <p className="text-sm text-neutral-400 py-16 text-center font-medium">Loading threat alerts...</p>
        ) : filteredAlerts.length === 0 ? (
          <Empty className="my-6">
            <EmptyMedia variant="icon">
              <ShieldWarning className="w-6 h-6 text-amber-500" weight="duotone" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Threat Incidents Found</EmptyTitle>
              <EmptyDescription>
                No telemetry alerts matching the current filter criteria were returned from the pipeline.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedAlert?.id === alert.id
                    ? "bg-blue-50/50 border-blue-500/80 shadow-xs ring-1 ring-blue-500/20"
                    : "bg-white border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <StatusBadge status={alert.status} />
                    <span className="text-xs font-mono font-medium text-neutral-500">
                      {alert.threat_type}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : ""}
                  </span>
                </div>

                <p className="text-sm font-semibold mt-2.5 text-neutral-900">{alert.summary}</p>

                {alert.prediction && (
                  <div className="flex flex-wrap items-center justify-between mt-3 pt-2.5 border-t border-neutral-100 text-xs text-neutral-500">
                    <span>Model: <code className="font-mono text-neutral-800 font-semibold">{alert.prediction.model_name}</code></span>
                    <span className="font-medium">Confidence: <strong className="text-blue-600 font-bold">{(alert.prediction.score * 100).toFixed(1)}%</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
