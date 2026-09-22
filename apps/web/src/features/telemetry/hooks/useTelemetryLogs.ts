import { useState, useEffect, useCallback } from "react"
import { fetchTelemetryLogsApi } from "../api/ingestService"
import type { TelemetryLogEntry } from "../types/ingest.types"

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

export function useTelemetryLogs(refreshKey = 0) {
  const [logs, setLogs] = useState<TelemetryLogEntry[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [eventType, setEventType] = useState<string>("ALL")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchTelemetryLogsApi({
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        search: debouncedSearch,
        eventType,
      })
      setLogs(res.events)
      setTotal(res.count)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load telemetry logs"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, eventType])

  useEffect(() => {
    void refresh()
  }, [refresh, refreshKey])

  const handleEventTypeChange = useCallback((next: string) => {
    setEventType(next)
    setPage(1)
  }, [])

  return {
    logs,
    total,
    loading,
    error,
    refresh,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    search,
    setSearch,
    eventType,
    setEventType: handleEventTypeChange,
  }
}
