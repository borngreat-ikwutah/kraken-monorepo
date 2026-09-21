import { useState, useEffect, useCallback } from "react"
import type { AnalyticsMetrics, TimeseriesAnalytics } from "../../alerts/types/alert.types"
import { fetchAnalyticsMetricsApi, fetchTimeseriesApi } from "../../alerts/api/alertService"

export function useAnalytics(autoRefreshInterval: number = 5000) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [timeseries, setTimeseries] = useState<TimeseriesAnalytics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [m, t] = await Promise.all([
        fetchAnalyticsMetricsApi(),
        fetchTimeseriesApi()
      ])
      setMetrics(m)
      setTimeseries(t)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics data")
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!autoRefreshInterval) return
    const interval = setInterval(() => {
      loadData(true)
    }, autoRefreshInterval)
    return () => clearInterval(interval)
  }, [autoRefreshInterval, loadData])

  return {
    metrics,
    timeseries,
    loading,
    error,
    refresh: loadData
  }
}
