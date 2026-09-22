import { useState, useEffect } from "react"
import { useIngest } from "../hooks/useIngest"
import { useTelemetryLogs } from "../hooks/useTelemetryLogs"
import { TelemetryWizard } from "./TelemetryWizard"
import { QueryHistoryTable } from "./QueryHistoryTable"

export function IngestionSandbox() {
  const ingest = useIngest()
  const [refreshKey, setRefreshKey] = useState<number>(0)
  const telemetry = useTelemetryLogs(refreshKey)

  // Refresh the DB-backed table each time a new check completes
  useEffect(() => {
    if (ingest.result) {
      const timer = setTimeout(() => setRefreshKey((k) => k + 1), 800)
      return () => clearTimeout(timer)
    }
  }, [ingest.result])

  return (
    <div className="space-y-6">
      <TelemetryWizard ingest={ingest} />

      <QueryHistoryTable
        logs={telemetry.logs}
        total={telemetry.total}
        loading={telemetry.loading}
        error={telemetry.error}
        onRefresh={telemetry.refresh}
        page={telemetry.page}
        totalPages={telemetry.totalPages}
        onPageChange={telemetry.setPage}
        search={telemetry.search}
        onSearchChange={telemetry.setSearch}
        eventType={telemetry.eventType}
        onEventTypeChange={telemetry.setEventType}
      />
    </div>
  )
}
