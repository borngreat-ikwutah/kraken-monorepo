import { useCallback, useEffect, useRef, useState } from "react"
import type { AlertItem } from "../../alerts/types/alert.types"
import { fetchAlertByIdApi, patchAlertApi } from "../../alerts/api/alertService"

/**
 * Builds the plain-text incident brief copied to the analyst clipboard.
 * Kept as a pure function so it can be unit tested and reused by other surfaces.
 */
export function buildIncidentBrief(alert: AlertItem): string {
  const sourceIp = alert.event?.source_ip || "N/A"
  const destinationIp = alert.event?.destination_ip || "N/A"
  const modelName = alert.prediction?.model_name || "ML Ensemble"
  const confidence = ((alert.prediction?.score ?? 0) * 100).toFixed(1)

  return [
    `[KrakenSec Incident #${alert.id}] ${alert.severity} ${alert.threat_type}`,
    `Summary: ${alert.summary}`,
    `Source IP: ${sourceIp} -> ${destinationIp}`,
    `Model: ${modelName} (${confidence}% confidence)`,
  ].join("\n")
}

interface UseIncidentTriageOptions {
  alert: AlertItem | null
  onClose: () => void
  onRefresh: () => void
}

export function useIncidentTriage({
  alert,
  onClose,
  onRefresh,
}: UseIncidentTriageOptions) {
  const [details, setDetails] = useState<AlertItem | null>(alert)
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false)
  const [dispatchMessage, setDispatchMessage] = useState<string | null>(null)
  const [selectedAssignee, setSelectedAssignee] = useState<string>(
    "Alex Mercer (SOC Lead)"
  )
  const [selectedChannel, setSelectedChannel] =
    useState<string>("Email Dispatch")

  // Keep the latest callbacks in a ref so the global key listener stays mounted once
  const onCloseRef = useRef<() => void>(onClose)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Hydrate the full incident payload from GET /api/alerts/:id whenever the selection changes
  useEffect(() => {
    if (!alert) {
      setDetails(null)
      return
    }

    let isMounted = true
    setDetails(alert)
    setDetailsLoading(true)
    setCopiedBrief(false)
    setDispatchMessage(null)

    const loadDetails = async () => {
      const fresh = await fetchAlertByIdApi(alert.id)
      if (!isMounted) return
      setDetails(fresh || alert)
      setDetailsLoading(false)
    }
    loadDetails()

    return () => {
      isMounted = false
    }
  }, [alert])

  // Escape dismisses the slide-over drawer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Clear any pending copy / dispatch timers when the drawer unmounts
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timerId) => clearTimeout(timerId))
    }
  }, [])

  const handleAction = useCallback(
    async (status: string, feedback?: string): Promise<AlertItem | null> => {
      if (!details) return null
      setActionLoading(true)
      try {
        const updated = await patchAlertApi(details.id, {
          status,
          analyst_feedback: feedback,
        })
        if (updated) setDetails(updated)
        onRefresh()
        return updated
      } finally {
        setActionLoading(false)
      }
    },
    [details, onRefresh]
  )

  const handleCopyBrief = useCallback(() => {
    if (!details) return
    const text = buildIncidentBrief(details)
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedBrief(true)
    const timerId = window.setTimeout(() => setCopiedBrief(false), 2500)
    timersRef.current.push(timerId)
  }, [details])

  const handleDispatchAlert = useCallback(() => {
    if (!details) return
    setDispatchMessage(
      `Dispatched Incident #${details.id} to ${selectedAssignee} via ${selectedChannel}`
    )
    const timerId = window.setTimeout(() => setDispatchMessage(null), 4500)
    timersRef.current.push(timerId)
  }, [details, selectedAssignee, selectedChannel])

  return {
    details,
    detailsLoading,
    actionLoading,
    copiedBrief,
    dispatchMessage,
    selectedAssignee,
    selectedChannel,
    setSelectedAssignee,
    setSelectedChannel,
    handleAction,
    handleCopyBrief,
    handleDispatchAlert,
  }
}
