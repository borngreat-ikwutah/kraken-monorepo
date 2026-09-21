import type { CustomIngestPayload, IngestionResult } from "../types/ingest.types"

const BACKEND_URL = "http://localhost:5000"

export const ingestEventApi = async (data: CustomIngestPayload): Promise<IngestionResult> => {
  const res = await fetch(`${BACKEND_URL}/api/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10000)
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || `Server returned HTTP ${res.status}`)
  }

  const json = (await res.json()) as IngestionResult
  return json
}

export const ingestTelemetryApi = async (type: "network" | "phishing" | "url"): Promise<IngestionResult> => {
  let payload: CustomIngestPayload = {}

  if (type === "network") {
    payload = {
      source_type: "network",
      event_type: "network_flow",
      source_ip: "192.168.1.188",
      destination_ip: "45.33.32.156",
      payload: {
        protocol: "TCP",
        dst_port: 4444,
        bytes_sent: 1250000,
        bytes_recv: 450,
        packets_sent: 8500,
        packets_recv: 10,
        duration: 0.12
      }
    }
  } else if (type === "phishing") {
    payload = {
      source_type: "email",
      event_type: "email",
      source_ip: "185.220.101.5",
      destination_ip: "10.0.0.45",
      payload: {
        sender: "security-alert@micros0ft-verify.com",
        body_text: "URGENT: Corporate security alert. Please verify your credentials immediately: http://auth-verify.xyz"
      }
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

  return await ingestEventApi(payload)
}
