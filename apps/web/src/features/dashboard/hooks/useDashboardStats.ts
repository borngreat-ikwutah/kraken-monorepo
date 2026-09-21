import { useState, useEffect, useCallback } from "react"
import type { DashboardStats } from "../../alerts/types/alert.types"
import { fetchDashboardStatsApi } from "../../alerts/api/alertService"

export function useDashboardStats(autoRefreshInterval?: number) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await fetchDashboardStatsApi()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard stats")
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    if (!autoRefreshInterval) return
    const interval = setInterval(() => {
      loadStats(true)
    }, autoRefreshInterval)
    return () => clearInterval(interval)
  }, [autoRefreshInterval, loadStats])

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  }
}
