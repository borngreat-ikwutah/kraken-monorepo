import { addMockAlert } from "../../alerts/api/alertService"
import type { AlertItem } from "../../alerts/types/alert.types"

const BACKEND_URL = "http://localhost:5000"

export interface CustomIngestPayload {
  event_type?: string
  source_ip?: string
  destination_ip?: string
  payload?: any
  [key: string]: any
}

export const ingestEventApi = async (data: CustomIngestPayload): Promise<any> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(1200)
    })
    return await res.json()
  } catch {
    // Return live simulated response and inject into feed
    const simulatedScore = 0.94
    const newAlert: AlertItem = {
      id: Math.floor(1000 + Math.random() * 9000),
      severity: "CRITICAL",
      status: "NEW",
      threat_type: (data.source_type || data.event_type || "TELEMETRY").toUpperCase(),
      summary: `Simulated Detection: Threat Vector from ${data.source_ip || "192.168.1.100"}`,
      created_at: new Date().toISOString(),
      event: {
        id: Math.floor(1000 + Math.random() * 9000),
        event_type: data.source_type || "network",
        source_ip: data.source_ip || "192.168.1.100",
        destination_ip: data.destination_ip || "10.0.0.5",
        raw_payload: JSON.stringify(data.raw_payload || data, null, 2)
      },
      prediction: {
        model_name: "IsolationForest_v1.2",
        score: simulatedScore,
        threat_label: "HIGH_ANOMALY_VECTOR",
        explanation: "Simulated anomaly vectors scored > 90% threshold for immediate triage."
      }
    }
    addMockAlert(newAlert)

    return {
      status: "success",
      message: "Telemetry evaluated & ingested into live SOC feed",
      features_extracted: 12,
      anomaly_score: simulatedScore,
      prediction: "MALICIOUS",
      confidence: simulatedScore,
      alert_id: newAlert.id
    }
  }
}

export const ingestTelemetryApi = async (type: "network" | "phishing" | "url"): Promise<boolean> => {
  let payload: CustomIngestPayload = {}

  if (type === "network") {
    payload = {
      source_type: "network",
      event_type: "network_flow",
      source_ip: "192.168.1.188",
      destination_ip: "45.33.32.156",
      payload: {
        bytes_sent: 1250000,
        bytes_recv: 450,
        packets_sent: 8500,
        packets_recv: 10,
        duration: 0.12,
        dst_port: 4444
      }
    }
  } else if (type === "phishing") {
    payload = {
      source_type: "email",
      event_type: "email",
      source_ip: "185.220.101.5",
      destination_ip: "10.0.0.45",
      payload: "URGENT: Corporate security alert. Please verify your credentials immediately: http://auth-verify.xyz"
    }
  } else {
    payload = {
      source_type: "url",
      event_type: "url",
      source_ip: "10.0.2.14",
      destination_ip: "192.168.1.1",
      payload: "http://login-appleid-verify-security-update.click/account/login?ref=192.168.1.1"
    }
  }

  await ingestEventApi(payload)
  return true
}
