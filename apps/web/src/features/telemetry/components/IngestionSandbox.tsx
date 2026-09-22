import { useState, useEffect } from "react"
import { useIngest } from "../hooks/useIngest"
import { useTelemetryLogs } from "../hooks/useTelemetryLogs"
import { TelemetryWizard } from "./TelemetryWizard"
import { QueryHistoryTable } from "./QueryHistoryTable"

export function IngestionSandbox() {
  const ingest = useIngest()
  const [refreshKey, setRefreshKey] = useState<number>(0)
  const { logs, total, loading, error, refresh } = useTelemetryLogs(50, refreshKey)

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
        logs={logs}
        total={total}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
    </div>
  )
}
