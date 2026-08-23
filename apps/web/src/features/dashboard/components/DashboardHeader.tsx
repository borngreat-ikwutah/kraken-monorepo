import { Link } from "@tanstack/react-router"
import { ArrowLeft, Pulse } from "@phosphor-icons/react"
import { Badge } from "@workspace/ui/components/badge"
import { TelemetrySimulatorControls } from "../../telemetry/components/TelemetrySimulatorControls"

interface DashboardHeaderProps {
  backendStatus: string
  onTelemetryIngested: () => void
}

export function DashboardHeader({ backendStatus, onTelemetryIngested }: DashboardHeaderProps) {
  const isOnline = backendStatus.toLowerCase().includes("healthy") || backendStatus.toLowerCase().includes("online")

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-950 px-2.5 py-1 rounded-lg bg-white border border-neutral-200 shadow-2xs hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900"></div>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-950 tracking-tight">
              KrakenSec SOC Console
            </h1>
          </div>

          <Badge 
            variant="outline"
            className={`font-mono text-xs font-semibold gap-1.5 px-2.5 py-0.5 rounded-full ${
              isOnline 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            <Pulse className={`w-3.5 h-3.5 ${isOnline ? "text-emerald-500 animate-pulse" : "text-blue-500"}`} weight="bold" />
            <span>{backendStatus}</span>
          </Badge>
        </div>

        <p className="text-xs sm:text-sm text-neutral-500 mt-1.5">
          Real-time security telemetry ingestion, Isolation Forest anomaly scoring & Transformer NLP detection
        </p>
      </div>

      <TelemetrySimulatorControls onIngested={onTelemetryIngested} />
    </div>
  )
}
