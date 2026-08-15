import { useState, useEffect } from "react"
import type { AlertItem } from "../../alerts/types/alert.types"
import { fetchAlertsFromApi, fetchHealthStatus, submitAlertFeedbackApi } from "../../alerts/api/alertService"
import { DashboardHeader } from "./DashboardHeader"
import { MetricCards } from "./MetricCards"
import { AlertFeedTable } from "../../alerts/components/AlertFeedTable"
import { AlertDetailDrawer } from "../../alerts/components/AlertDetailDrawer"

export function SOCDashboardView() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [backendStatus, setBackendStatus] = useState<string>("Connecting...")
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL")

  const loadHealth = async () => {
    const status = await fetchHealthStatus()
    setBackendStatus(status)
  }

  const loadAlerts = async () => {
    setLoading(true)
    const fetched = await fetchAlertsFromApi(filterSeverity)
    setAlerts(fetched)
    setLoading(false)
  }

  useEffect(() => {
    loadHealth()
    loadAlerts()
  }, [filterSeverity])

  const handleFeedbackAction = async (alertId: number, status: string, feedback?: string) => {
    const updated = await submitAlertFeedbackApi(alertId, status, feedback)
    loadAlerts()
    if (selectedAlert && selectedAlert.id === alertId && updated) {
      setSelectedAlert(updated)
    }
  }

  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length
  const highCount = alerts.filter(a => a.severity === "HIGH").length
  const mediumCount = alerts.filter(a => a.severity === "MEDIUM").length

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-sans">
      <DashboardHeader 
        backendStatus={backendStatus} 
        onTelemetryIngested={loadAlerts} 
      />

      <MetricCards 
        totalAlerts={alerts.length}
        criticalCount={criticalCount}
        highCount={highCount}
        mediumCount={mediumCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AlertFeedTable 
          alerts={alerts}
          selectedAlert={selectedAlert}
          loading={loading}
          filterSeverity={filterSeverity}
          onSelectAlert={setSelectedAlert}
          onFilterChange={setFilterSeverity}
        />

        <AlertDetailDrawer 
          alert={selectedAlert}
          onAction={handleFeedbackAction}
        />
      </div>
    </div>
  )
}
