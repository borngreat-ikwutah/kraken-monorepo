import type { AlertItem } from "../types/alert.types"
import { SeverityBadge } from "./SeverityBadge"
import { StatusBadge } from "./StatusBadge"

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
  return (
    <div className="lg:col-span-2 bg-neutral-900/40 border border-neutral-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Prioritized Alert Feed</h2>
        <div className="flex items-center gap-1.5">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
            <button
              key={sev}
              onClick={() => onFilterChange(sev)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                filterSeverity === sev 
                  ? "bg-neutral-100 text-neutral-900" 
                  : "bg-neutral-800/80 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500 py-12 text-center">Loading threat alerts...</p>
      ) : alerts.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-400">No alerts found for this filter.</p>
          <p className="text-xs text-neutral-500 mt-1">Click one of the "Simulate Threat" buttons above to test ingestion!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectAlert(alert)}
              className={`p-4 rounded-lg border transition cursor-pointer ${
                selectedAlert?.id === alert.id
                  ? "bg-neutral-800/90 border-neutral-500"
                  : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={alert.severity} />
                  <StatusBadge status={alert.status} />
                  <span className="text-xs font-mono text-neutral-400">
                    {alert.threat_type}
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-500">
                  {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : ""}
                </span>
              </div>

              <p className="text-sm font-medium mt-2 text-neutral-200">{alert.summary}</p>

              {alert.prediction && (
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/60 text-xs text-neutral-400">
                  <span>Model: <code className="text-neutral-300">{alert.prediction.model_name}</code></span>
                  <span>Confidence Score: <strong className="text-neutral-200">{(alert.prediction.score * 100).toFixed(1)}%</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
