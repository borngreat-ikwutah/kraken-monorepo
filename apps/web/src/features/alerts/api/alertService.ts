import type { AlertItem } from "../types/alert.types"

const BACKEND_URL = "http://localhost:5000"

// Mock seed dataset for standalone running state without backend requirement
const INITIAL_MOCK_ALERTS: AlertItem[] = [
  {
    id: 1042,
    severity: "CRITICAL",
    status: "NEW",
    threat_type: "NETWORK_ANOMALY",
    summary: "High-Frequency SYN Flood & Port Scan Detected",
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    event: {
      id: 1042,
      event_type: "network_flow",
      source_ip: "192.168.1.188",
      destination_ip: "10.0.0.5",
      raw_payload: JSON.stringify({
        protocol: "TCP",
        dst_port: 445,
        bytes_sent: 1250000,
        bytes_recv: 450,
        packets_sent: 8500,
        packets_recv: 10,
        duration: 0.12
      }, null, 2)
    },
    prediction: {
      model_name: "IsolationForest_v1.2",
      score: 0.965,
      threat_label: "ANOMALOUS_PORT_SCAN",
      explanation: "Extreme packet rate (70,833 pkt/s) with asymmetrical byte ratio (99.96% outbound) exceeds baseline distribution by 4.8 standard deviations."
    }
  },
  {
    id: 1041,
    severity: "HIGH",
    status: "ACKNOWLEDGED",
    threat_type: "PHISHING_EMAIL",
    summary: "Credential Harvester Payload in Inbound SMTP Message",
    created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    event: {
      id: 1041,
      event_type: "email",
      source_ip: "185.220.101.5",
      destination_ip: "10.0.0.45",
      raw_payload: JSON.stringify({
        sender: "security-verify@banking-secure-auth.net",
        recipient: "student@school.edu",
        subject: "URGENT: Immediate Account Suspension Notice - Action Required",
        body_text: "Dear Student, Your credentials will be revoked in 2 hours. Click here immediately to verify: http://bit.ly/bank-auth-verify"
      }, null, 2)
    },
    prediction: {
      model_name: "MiniLM_Phishing_Transformer",
      score: 0.918,
      threat_label: "PHISHING_CREDENTIAL_THEFT",
      explanation: "High urgency cue score (0.94) and deceptive domain mismatch detected in body link URL."
    }
  },
  {
    id: 1040,
    severity: "MEDIUM",
    status: "NEW",
    threat_type: "MALICIOUS_URL",
    summary: "Suspicious Typosquatting Domain Navigation",
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    event: {
      id: 1040,
      event_type: "url",
      source_ip: "10.0.2.14",
      destination_ip: "192.168.1.1",
      raw_payload: JSON.stringify({
        url: "http://secure-login.micros0ft-support.ru/oauth2/token-refresh",
        submitted_by: "edr_sensor_04"
      }, null, 2)
    },
    prediction: {
      model_name: "Lexical_Domain_Forest",
      score: 0.784,
      threat_label: "TYPOSQUATTING_DOMAIN",
      explanation: "High domain Shannon entropy (3.82) combined with zero-day registered TLD (.ru) and Microsoft character substitution."
    }
  },
  {
    id: 1039,
    severity: "LOW",
    status: "RESOLVED",
    threat_type: "LOG_ANOMALY",
    summary: "Repeated Failed SSH Authentication Attempts",
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    event: {
      id: 1039,
      event_type: "syslog",
      source_ip: "172.16.0.88",
      destination_ip: "10.0.0.1",
      raw_payload: JSON.stringify({
        service: "sshd",
        event: "Failed password for invalid user admin",
        attempts: 5,
        port: 22
      }, null, 2)
    },
    prediction: {
      model_name: "LogEntropyClassifier",
      score: 0.542,
      threat_label: "BRUTEFORCE_ATTEMPT",
      explanation: "Failed password spike over 30s threshold, auto-blocked by local fail2ban rule."
    }
  }
]

let localAlertsStore: AlertItem[] = [...INITIAL_MOCK_ALERTS]

export const fetchHealthStatus = async (): Promise<string> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(1000) })
    const data = await res.json()
    return data.service ? `Connected (${data.version})` : "Active"
  } catch {
    return "Active"
  }
}

export const fetchAlertsFromApi = async (severity: string = "ALL"): Promise<AlertItem[]> => {
  try {
    const url = severity === "ALL"
      ? `${BACKEND_URL}/api/alerts`
      : `${BACKEND_URL}/api/alerts?severity=${severity}`
    const res = await fetch(url, { signal: AbortSignal.timeout(1000) })
    const data = await res.json()
    if (data.alerts && data.alerts.length > 0) {
      return data.alerts
    }
  } catch {
    // Graceful fallback to rich local state
  }

  if (severity === "ALL") {
    return localAlertsStore
  }
  return localAlertsStore.filter(a => a.severity === severity)
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
      body: JSON.stringify({ status, analyst_feedback: feedback }),
      signal: AbortSignal.timeout(1000)
    })
    const data = await res.json()
    if (data.alert) return data.alert
  } catch {
    // Update local state directly
  }

  localAlertsStore = localAlertsStore.map(item => {
    if (item.id === alertId) {
      return {
        ...item,
        status: status as any,
        analyst_feedback: feedback
      }
    }
    return item
  })

  return localAlertsStore.find(a => a.id === alertId) || null
}

export const addMockAlert = (newAlert: AlertItem) => {
  localAlertsStore = [newAlert, ...localAlertsStore]
}
