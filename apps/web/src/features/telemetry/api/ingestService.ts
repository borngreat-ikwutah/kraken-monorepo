const BACKEND_URL = "http://localhost:5000"

export const ingestTelemetryApi = async (type: "network" | "phishing" | "url"): Promise<boolean> => {
  let payload = {}

  if (type === "network") {
    payload = {
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
      event_type: "email",
      source_ip: "185.220.101.5",
      destination_ip: "10.0.0.45",
      payload: "URGENT: Your bank account has been suspended! Click immediately to verify password: http://secure-bank-update.xyz/login"
    }
  } else {
    payload = {
      event_type: "url",
      source_ip: "10.0.2.14",
      destination_ip: "192.168.1.1",
      payload: "http://login-appleid-verify-security-update.click/account/login?ref=192.168.1.1"
    }
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    return res.ok
  } catch (err) {
    console.error("Failed to ingest sample telemetry", err)
    return false
  }
}
