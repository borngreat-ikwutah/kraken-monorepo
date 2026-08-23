import { useState } from "react"
import type { AlertItem } from "../types/alert.types"
import { SeverityBadge } from "./SeverityBadge"
import { StatusBadge } from "./StatusBadge"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { MagnifyingGlass } from "@phosphor-icons/react"

interface AlertFeedTableProps {
  alerts: AlertItem[]
  selectedAlert: AlertItem | null
  loading: boolean
  filterSeverity: string
  onSelectAlert: (alert: AlertItem) => void
  onFilterChange: (severity: string) => void
}

export function AlertFeedTable({
  alerts,
  selectedAlert,
  loading,
  filterSeverity,
  onSelectAlert,
  onFilterChange
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
          <CardTitle className="text-base font-bold text-neutral-950">Prioritized Alert Feed</CardTitle>
          <p className="text-xs text-neutral-500 mt-0.5">Real-time incident stream and confidence scores</p>
        </div>

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
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
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
          <div className="py-16 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <p className="text-sm font-semibold text-neutral-700">No alerts found</p>
            <p className="text-xs text-neutral-400 mt-1">Try changing filters or simulate a threat above.</p>
          </div>
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
