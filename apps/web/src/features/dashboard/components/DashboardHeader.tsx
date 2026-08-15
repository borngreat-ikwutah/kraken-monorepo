import { TelemetrySimulatorControls } from "../../telemetry/components/TelemetrySimulatorControls"

interface DashboardHeaderProps {
  backendStatus: string
  onTelemetryIngested: () => void
}

export function DashboardHeader({ backendStatus, onTelemetryIngested }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-800 gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Threat Detection SOC Dashboard</h1>
          <span className="px-2.5 py-0.5 text-xs font-mono rounded-full border bg-neutral-900 border-neutral-700 text-neutral-300">
            {backendStatus}
          </span>
        </div>
        <p className="text-sm text-neutral-400 mt-1">
          Real-time security telemetry ingestion & ML threat inference pipeline
        </p>
      </div>

      <TelemetrySimulatorControls onIngested={onTelemetryIngested} />
    </div>
  )
}
