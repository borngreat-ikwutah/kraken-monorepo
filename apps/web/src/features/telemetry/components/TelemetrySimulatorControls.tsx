import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { ingestTelemetryApi } from "../api/ingestService"

interface TelemetrySimulatorControlsProps {
  onIngested: () => void
}

export function TelemetrySimulatorControls({ onIngested }: TelemetrySimulatorControlsProps) {
  const [isSimulating, setIsSimulating] = useState<boolean>(false)

  const handleSimulate = async (type: "network" | "phishing" | "url") => {
    setIsSimulating(true)
    await ingestTelemetryApi(type)
    setIsSimulating(false)
    onIngested()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-neutral-400 mr-1">Simulate Threat:</span>
      <Button 
        disabled={isSimulating}
        className="text-xs bg-red-950/80 hover:bg-red-900 border border-red-800/50 text-red-200"
        onClick={() => handleSimulate("network")}
      >
        + Network Anomaly
      </Button>
      <Button 
        disabled={isSimulating}
        className="text-xs bg-amber-950/80 hover:bg-amber-900 border border-amber-800/50 text-amber-200"
        onClick={() => handleSimulate("phishing")}
      >
        + Phishing Email
      </Button>
      <Button 
        disabled={isSimulating}
        className="text-xs bg-orange-950/80 hover:bg-orange-900 border border-orange-800/50 text-orange-200"
        onClick={() => handleSimulate("url")}
      >
        + Malicious URL
      </Button>
    </div>
  )
}
