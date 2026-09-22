import { useState, useCallback } from "react"
import { ingestEventApi } from "../api/ingestService"
import type { CustomIngestPayload, IngestionResult, SubmissionMode } from "../types/ingest.types"

export function useIngest() {
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>("url")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<IngestionResult | null>(null)

  // Input states
  const [inputUrl, setInputUrl] = useState<string>("http://secure-login.micros0ft-support.ru/oauth2/token-refresh")
  const [inputEmailText, setInputEmailText] = useState<string>(
    "URGENT: Your corporate cloud account access will be suspended within 2 hours due to unauthorized login attempts. Click here to verify your identity: http://bit.ly/secure-auth-check"
  )
  const [inputSender, setInputSender] = useState<string>("security-alerts@service-verify-auth.net")
  const [inputSrcIp, setInputSrcIp] = useState<string>("192.168.1.188")
  const [inputDstPort, setInputDstPort] = useState<string>("4444")
  const [inputBytes, setInputBytes] = useState<string>("1250000")
  const [inputPackets, setInputPackets] = useState<string>("8500")

  const [customJsonPayload, setCustomJsonPayload] = useState<string>(`{
  "event_type": "url",
  "source_ip": "185.220.101.5",
  "destination_ip": "10.0.0.5",
  "payload": "http://192.168.1.10/admin-login-credential-harvest/verify.php?token=xyz9982"
}`)

  const loadPreset = useCallback((preset: "url_phish" | "dga" | "email_urgent" | "network_c2" | "benign_url") => {
    setError(null)
    switch (preset) {
      case "url_phish":
        setSubmissionMode("url")
        setInputUrl("http://login-appleid-verify-security-update.click/account/login?ref=192.168.1.1")
        break
      case "dga":
        setSubmissionMode("url")
        setInputUrl("http://x7k9p2l1m4n8q9z0v3b2c1.top/command-and-control/beacon")
        break
      case "email_urgent":
        setSubmissionMode("email")
        setInputSender("account-security@paypal-security-center.info")
        setInputEmailText("FINAL WARNING: Unauthorized billing activity detected on your account. Review immediately to avoid irreversible suspension: https://verify-auth-session.org/login")
        break
      case "network_c2":
        setSubmissionMode("flow")
        setInputSrcIp("185.220.101.5")
        setInputDstPort("4444")
        setInputBytes("2450000")
        setInputPackets("12800")
        break
      case "benign_url":
        setSubmissionMode("url")
        setInputUrl("https://github.com/torvalds/linux/blob/master/README.md")
        break
    }
  }, [])

  const submitIngest = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    setLoading(true)
    setError(null)

    let requestData: CustomIngestPayload = {}

    try {
      if (submissionMode === "url") {
        requestData = {
          event_type: "url",
          source_ip: "127.0.0.1",
          destination_ip: "0.0.0.0",
          payload: inputUrl
        }
      } else if (submissionMode === "email") {
        requestData = {
          event_type: "email",
          source_ip: "185.220.101.5",
          destination_ip: "10.0.0.45",
          payload: {
            sender: inputSender,
            body_text: inputEmailText
          }
        }
      } else if (submissionMode === "flow") {
        requestData = {
          event_type: "network_flow",
          source_ip: inputSrcIp,
          destination_ip: "10.0.0.1",
          payload: {
            protocol: "TCP",
            dst_port: parseInt(inputDstPort, 10) || 80,
            bytes_sent: parseInt(inputBytes, 10) || 1000,
            packets_sent: parseInt(inputPackets, 10) || 10,
            duration: 0.15
          }
        }
      } else {
        requestData = JSON.parse(customJsonPayload) as CustomIngestPayload
      }

      const res = await ingestEventApi(requestData)
      setResult(res)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process ingestion payload"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [submissionMode, inputUrl, inputEmailText, inputSender, inputSrcIp, inputDstPort, inputBytes, inputPackets, customJsonPayload])

  return {
    submissionMode,
    setSubmissionMode,
    loading,
    error,
    result,
    setResult,
    inputUrl,
    setInputUrl,
    inputEmailText,
    setInputEmailText,
    inputSender,
    setInputSender,
    inputSrcIp,
    setInputSrcIp,
    inputDstPort,
    setInputDstPort,
    inputBytes,
    setInputBytes,
    inputPackets,
    setInputPackets,
    customJsonPayload,
    setCustomJsonPayload,
    submitIngest,
    loadPreset
  }
}
