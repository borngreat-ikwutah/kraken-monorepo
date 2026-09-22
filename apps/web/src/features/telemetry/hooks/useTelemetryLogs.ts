import { useState, useEffect, useCallback } from "react"
import { fetchTelemetryLogsApi } from "../api/ingestService"
import type { TelemetryLogEntry } from "../types/ingest.types"

export function useTelemetryLogs(limit = 50, refreshKey = 0) {
  const [logs, setLogs] = useState<TelemetryLogEntry[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchTelemetryLogsApi(limit)
      setLogs(res.events)
      setTotal(res.count)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load telemetry logs"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    void refresh()
  }, [refresh, refreshKey])

  return { logs, total, loading, error, refresh }
}
