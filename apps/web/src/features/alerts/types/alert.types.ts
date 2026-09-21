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

export interface ThreatVectorDistribution {
  threat_type: string
  count: number
  percentage: number
}

export interface EventTypeBreakdown {
  event_type: string
  count: number
}

export interface AnalyticsMetrics {
  total_events: number
  events_delta_pct: number
  total_alerts: number
  open_alerts: number
  critical_open_count: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  false_positives: number
  acknowledged: number
  resolved: number
  precision_rate: number
  false_positive_rate: number
}

export interface TimeseriesDay {
  day: string
  date: string
  count: number
  is_today: boolean
}

export interface TimeseriesVelocityMonth {
  month: string
  volume: number
}

export interface TimeseriesAnalytics {
  velocity: {
    rate_str: string
    rate_increase: string
    vectors: {
      network_flow: number
      phishing_smtp: number
      malicious_url: number
      syslog: number
    }
    months: TimeseriesVelocityMonth[]
  }
  weekly_threat_volume: {
    total_events: number
    delta_label: string
    days: TimeseriesDay[]
  }
}

export interface DashboardStats {
  total_events: number
  total_alerts: number
  active_incidents: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  false_positives: number
  acknowledged: number
  resolved: number
  precision_rate: number
  false_positive_rate: number
  distribution: ThreatVectorDistribution[]
  event_breakdown: EventTypeBreakdown[]
}

export interface ThreatModelInfo {
  id: string
  name: string
  type: string
  status: string
  accuracy: string
  latency: string
  features: string[]
  description: string
}

export interface StreamBufferState {
  isPaused: boolean
  bufferedCount: number
  maxDisplayed: number
  flushIntervalMs: number
}

export interface UseAlertsOptions {
  initialSeverity?: string
  initialStatus?: string
  autoRefreshInterval?: number
  flushIntervalMs?: number
  maxDisplayed?: number
}


