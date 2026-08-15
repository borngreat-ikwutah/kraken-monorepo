import type { AlertItem } from "../types/alert.types"

const BACKEND_URL = "http://localhost:5000"

export const fetchHealthStatus = async (): Promise<string> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`)
    const data = await res.json()
    return data.service ? `Connected (${data.version})` : "Online"
  } catch {
    return "Backend Offline (Check :5000)"
  }
}

export const fetchAlertsFromApi = async (severity: string = "ALL"): Promise<AlertItem[]> => {
  try {
    const url = severity === "ALL"
      ? `${BACKEND_URL}/api/alerts`
      : `${BACKEND_URL}/api/alerts?severity=${severity}`
    const res = await fetch(url)
    const data = await res.json()
    return data.alerts || []
  } catch (err) {
    console.error("Failed to fetch alerts:", err)
    return []
  }
}

export const submitAlertFeedbackApi = async (
  alertId: number,
  status: string,
  feedback?: string
): Promise<AlertItem | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/alerts/${alertId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, analyst_feedback: feedback })
    })
    const data = await res.json()
    return data.alert || null
  } catch (err) {
    console.error("Failed to submit feedback:", err)
    return null
  }
}
