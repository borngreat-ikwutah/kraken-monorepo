import { useState, useEffect, useCallback, useRef } from "react"
import type { AlertItem, UseAlertsOptions } from "../types/alert.types"
import { fetchAlertsFromApi, submitAlertFeedbackApi } from "../api/alertService"

/**
 * Resolves which incident stays selected after a fresh fetch.
 *
 * Selection is never pre-seeded unless the caller opted in via
 * `autoSelectFirst`, so detail surfaces (drawers, panels) only open when an
 * analyst explicitly picks an incident. Once nothing is selected the hook keeps
 * it that way instead of silently re-selecting the newest alert on every poll.
 */
export function resolveSelectedAlert(
  previous: AlertItem | null,
  fetched: AlertItem[],
  isFirstLoad: boolean,
  autoSelectFirst: boolean
): AlertItem | null {
  if (isFirstLoad) return autoSelectFirst ? (fetched[0] ?? null) : null
  if (!previous) return null
  return fetched.find(alert => alert.id === previous.id) ?? null
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const {
    initialSeverity = "ALL",
    initialStatus = "ALL",
    autoRefreshInterval = 3000,
    flushIntervalMs = 3500,
    maxDisplayed = 100,
    autoSelectFirst = false
  } = options

  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [filterSeverity, setFilterSeverity] = useState<string>(initialSeverity)
  const [filterStatus, setFilterStatus] = useState<string>(initialStatus)
  const [searchTerm, setSearchTerm] = useState<string>("")

  // 1. Silent Buffer: useRef buffer prevents immediate re-renders during high-velocity data ingress
  const bufferRef = useRef<AlertItem[]>([])
  const isInitialLoadRef = useRef<boolean>(true)

  // 3. Pause UX State & Buffer Counting
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [bufferedCount, setBufferedCount] = useState<number>(0)

  // Push alerts into silent buffer without triggering React state updates
  const pushToBuffer = useCallback((incoming: AlertItem | AlertItem[]) => {
    const items = Array.isArray(incoming) ? incoming : [incoming]
    if (items.length === 0) return

    const existingBufferIds = new Set(bufferRef.current.map(a => a.id))
    const freshItems = items.filter(a => !existingBufferIds.has(a.id))

    if (freshItems.length > 0) {
      bufferRef.current.unshift(...freshItems)
      // Cap buffer storage to avoid unbounded memory growth
      if (bufferRef.current.length > 200) {
        bufferRef.current = bufferRef.current.slice(0, 200)
      }
      setBufferedCount(bufferRef.current.length)
    }
  }, [])

  // 2. Batch Flushing: Drains the bufferRef into the main React state array
  const flushBuffer = useCallback(() => {
    if (bufferRef.current.length === 0) {
      setBufferedCount(0)
      return
    }

    const itemsToFlush = [...bufferRef.current]
    bufferRef.current = []
    setBufferedCount(0)

    setAlerts(prev => {
      const prevIds = new Set(prev.map(a => a.id))
      const newItems = itemsToFlush.filter(a => !prevIds.has(a.id))
      if (newItems.length === 0) return prev
      
      const combined = [...newItems, ...prev]
      // 4. Memory Management: Trim displayed list to maxDisplayed (e.g. 50 or 100 items)
      return combined.slice(0, maxDisplayed)
    })
  }, [maxDisplayed])

  // Polling / Stream Ingestion Loader
  const loadAlerts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const fetched = await fetchAlertsFromApi(filterSeverity, filterStatus, searchTerm)
      
      const isFirstLoad = isInitialLoadRef.current
      if (isFirstLoad || !silent) {
        isInitialLoadRef.current = false
        // Direct update on initial load or manual user filter change
        setAlerts(fetched.slice(0, maxDisplayed))
        setSelectedAlert(prev => resolveSelectedAlert(prev, fetched, isFirstLoad, autoSelectFirst))
      } else {
        // High-velocity stream: push incoming updates into silent bufferRef
        setAlerts(currentAlerts => {
          const currentIds = new Set(currentAlerts.map(a => a.id))
          const incomingNew = fetched.filter(a => !currentIds.has(a.id))
          
          if (incomingNew.length > 0) {
            pushToBuffer(incomingNew)
          }
          return currentAlerts
        })
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [filterSeverity, filterStatus, searchTerm, maxDisplayed, pushToBuffer, autoSelectFirst])

  // Reload when filters change
  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  // Background stream polling interval
  useEffect(() => {
    if (!autoRefreshInterval) return
    const interval = setInterval(() => {
      loadAlerts(true)
    }, autoRefreshInterval)
    return () => clearInterval(interval)
  }, [autoRefreshInterval, loadAlerts])

  // 2. Batch Flushing interval (every 3 to 5 seconds): flushes buffer when not paused
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      flushBuffer()
    }, flushIntervalMs)
    return () => clearInterval(interval)
  }, [isPaused, flushIntervalMs, flushBuffer])

  // 3. Pause Toggle UX Handler
  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const nextState = !prev
      if (!nextState) {
        // If resuming, schedule immediate buffer flush
        setTimeout(() => flushBuffer(), 0)
      }
      return nextState
    })
  }, [flushBuffer])

  const flushNow = useCallback(() => {
    flushBuffer()
  }, [flushBuffer])

  const handleFeedback = async (alertId: number, status: string, feedback?: string, notes?: string) => {
    const updated = await submitAlertFeedbackApi(alertId, status, feedback, notes)
    if (updated) {
      setAlerts(prev => prev.map(a => (a.id === alertId ? updated : a)))
      if (selectedAlert?.id === alertId) {
        setSelectedAlert(updated)
      }
    } else {
      await loadAlerts(true)
    }
    return updated
  }

  // `null` clears the selection, allowing the triage drawer to be dismissed
  const selectAlert = (alert: AlertItem | null) => {
    setSelectedAlert(alert)
  }

  return {
    alerts,
    selectedAlert,
    loading,
    filterSeverity,
    filterStatus,
    searchTerm,
    isPaused,
    bufferedCount,
    maxDisplayed,
    setFilterSeverity,
    setFilterStatus,
    setSearchTerm,
    selectAlert,
    handleFeedback,
    togglePause,
    setIsPaused,
    flushNow,
    pushToBuffer,
    refresh: () => loadAlerts(false)
  }
}
