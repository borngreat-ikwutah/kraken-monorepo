import type { 
  AlertItem, 
  DashboardStats, 
  AnalyticsMetrics, 
  TimeseriesAnalytics, 
  ThreatModelInfo 
} from "../types/alert.types"

const BACKEND_URL = "http://localhost:5000"

export const fetchHealthStatus = async (): Promise<string> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return "Backend Offline"
    const data = await res.json()
    return data.service ? `Connected (${data.version})` : "Active"
  } catch {
    return "Backend Offline"
  }
}

export const fetchAlertsFromApi = async (
  severity: string = "ALL",
  status?: string,
  search?: string,
  limit: number = 100,
  offset: number = 0
): Promise<AlertItem[]> => {
  try {
    const params = new URLSearchParams()
    if (severity && severity !== "ALL") params.append("severity", severity)
    if (status && status !== "ALL") params.append("status", status)
    if (search && search.trim()) params.append("q", search.trim())
    if (limit) params.append("limit", String(limit))
    if (offset) params.append("offset", String(offset))

    const queryString = params.toString()
    const url = queryString ? `${BACKEND_URL}/api/alerts?${queryString}` : `${BACKEND_URL}/api/alerts`
    
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) {
      throw new Error(`Failed to fetch alerts: HTTP ${res.status}`)
    }
    const data = await res.json()
    return data.alerts || []
  } catch (error) {
    console.error("Error fetching alerts from backend:", error)
    return []
  }
}

export const fetchAlertByIdApi = async (alertId: number): Promise<AlertItem | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/alerts/${alertId}`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) {
      throw new Error(`Failed to fetch alert ${alertId}: HTTP ${res.status}`)
    }
    const data = await res.json()
    return data.alert || null
  } catch (error) {
    console.error(`Error fetching alert ${alertId}:`, error)
    return null
  }
}

export const patchAlertApi = async (
  alertId: number,
  data: { status?: string; analyst_feedback?: string; analyst_notes?: string }
): Promise<AlertItem | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/alerts/${alertId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(4000)
    })
    if (!res.ok) {
      throw new Error(`Failed to update alert ${alertId}: HTTP ${res.status}`)
    }
    const resJson = await res.json()
    return resJson.alert || null
  } catch (error) {
    console.error(`Error patching alert ${alertId}:`, error)
    return null
  }
}

export const submitAlertFeedbackApi = async (
  alertId: number,
  status: string,
  feedback?: string,
  notes?: string
): Promise<AlertItem | null> => {
  return patchAlertApi(alertId, {
    status,
    analyst_feedback: feedback,
    analyst_notes: notes
  })
}

export const fetchAnalyticsMetricsApi = async (): Promise<AnalyticsMetrics | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/analytics/metrics`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) {
      throw new Error(`Failed to fetch analytics metrics: HTTP ${res.status}`)
    }
    const data = await res.json()
    return data.metrics || null
  } catch (error) {
    console.error("Error fetching analytics metrics:", error)
    return null
  }
}

export const fetchTimeseriesApi = async (): Promise<TimeseriesAnalytics | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/analytics/timeseries`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) {
      throw new Error(`Failed to fetch timeseries: HTTP ${res.status}`)
    }
    const data = await res.json()
    return data.timeseries || null
  } catch (error) {
    console.error("Error fetching timeseries:", error)
    return null
  }
}

export const fetchDashboardStatsApi = async (): Promise<DashboardStats | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/stats`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) {
      throw new Error(`Failed to fetch stats: HTTP ${res.status}`)
    }
    const data = await res.json()
    return data.stats || null
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return null
  }
}

export const fetchModelsApi = async (): Promise<ThreatModelInfo[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/models`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) {
      throw new Error(`Failed to fetch models: HTTP ${res.status}`)
    }
    const data = await res.json()
    return data.models || []
  } catch (error) {
    console.error("Error fetching models:", error)
    return []
  }
}
