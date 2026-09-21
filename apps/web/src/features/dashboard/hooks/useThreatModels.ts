import { useState, useEffect, useCallback } from "react"
import type { ThreatModelInfo } from "../../alerts/types/alert.types"
import { fetchModelsApi } from "../../alerts/api/alertService"

export function useThreatModels() {
  const [models, setModels] = useState<ThreatModelInfo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadModels = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchModelsApi()
      setModels(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load models")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadModels()
  }, [loadModels])

  return {
    models,
    loading,
    error,
    refresh: loadModels
  }
}
