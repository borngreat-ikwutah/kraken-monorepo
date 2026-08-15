export type SeverityType = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
export type StatusType = "NEW" | "ACKNOWLEDGED" | "RESOLVED" | "FALSE_POSITIVE"

export interface EventPayload {
  id: number
  event_type: string
  source_ip: string
  destination_ip: string
  raw_payload: string
}

export interface PredictionData {
  model_name: string
  score: number
  threat_label: string
  explanation: string
}

export interface AlertItem {
  id: number
  severity: SeverityType
  status: StatusType
  threat_type: string
  summary: string
  created_at: string
  analyst_feedback?: string
  analyst_notes?: string
  event?: EventPayload
  prediction?: PredictionData
}
