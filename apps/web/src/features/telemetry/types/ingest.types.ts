import type { AlertItem } from "../../alerts/types/alert.types"

export type EventType = "url" | "network_flow" | "email" | "log" | "text"

export interface NetworkFlowPayload {
  protocol?: string
  dst_port?: number
  bytes_sent?: number
  bytes_recv?: number
  packets_sent?: number
  packets_recv?: number
  duration?: number
}

export interface EmailPayload {
  sender?: string
  body_text?: string
  subject?: string
}

export interface CustomIngestPayload {
  event_type?: EventType | string
  source_type?: string
  source_ip?: string
  destination_ip?: string
  payload?: string | NetworkFlowPayload | EmailPayload | Record<string, unknown>
  raw_payload?: string | Record<string, unknown>
}

export interface SubModelScore {
  model_name: string
  score: number
  threat_label: string
  explanation?: string
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "BENIGN"
  weights?: number
}

export interface ModelPrediction {
  model_name: string
  score: number
  threat_label: string
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "BENIGN"
  explanation?: string
  models_evaluated?: SubModelScore[]
  components?: Record<string, number>
}

export interface IngestionResult {
  status: "success" | "error"
  event_id?: number
  alert_id?: number
  prediction: ModelPrediction
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "BENIGN"
  alert?: AlertItem | null
  features: Record<string, number | string | boolean>
  all_predictions?: ModelPrediction[]
  inference?: {
    top_prediction: ModelPrediction
    all_predictions: ModelPrediction[]
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "BENIGN"
  }
  features_extracted?: number
  confidence?: number
  message?: string
}

export type SubmissionMode = "url" | "payload" | "email" | "flow"
