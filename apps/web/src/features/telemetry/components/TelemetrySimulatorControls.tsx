import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { ingestTelemetryApi } from "../api/ingestService"
import { Lightning, EnvelopeSimple, Globe } from "@phosphor-icons/react"

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
      <span className="text-xs font-semibold text-neutral-500 mr-1">Simulate Ingest:</span>
      <Button 
        size="sm"
        disabled={isSimulating}
        variant="outline"
        className="text-xs bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 font-semibold"
        onClick={() => handleSimulate("network")}
      >
        <Lightning className="w-3.5 h-3.5 mr-1 text-rose-600" weight="fill" />
        <span>Network Anomaly</span>
      </Button>
      <Button 
        size="sm"
        disabled={isSimulating}
        variant="outline"
        className="text-xs bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 font-semibold"
        onClick={() => handleSimulate("phishing")}
      >
        <EnvelopeSimple className="w-3.5 h-3.5 mr-1 text-amber-600" weight="bold" />
        <span>Phishing Email</span>
      </Button>
      <Button 
        size="sm"
        disabled={isSimulating}
        variant="outline"
        className="text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 font-semibold"
        onClick={() => handleSimulate("url")}
      >
        <Globe className="w-3.5 h-3.5 mr-1 text-blue-600" weight="bold" />
        <span>Malicious URL</span>
      </Button>
    </div>
  )
}
