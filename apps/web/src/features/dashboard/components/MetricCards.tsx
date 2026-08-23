import { Card, CardContent } from "@workspace/ui/components/card"
import { ShieldCheck, WarningCircle, Lightning, Pulse } from "@phosphor-icons/react"

interface MetricCardsProps {
  totalAlerts: number
  criticalCount: number
  highCount: number
  mediumCount: number
}

export function MetricCards({ totalAlerts, criticalCount, highCount, mediumCount }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {/* Total Alerts */}
      <Card className="bg-white border-neutral-200/80 shadow-xs hover:shadow-sm transition-shadow">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Total Ingested</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1 font-mono">{totalAlerts}</p>
            <span className="text-[11px] text-neutral-400 font-medium mt-1 inline-block">Real-time telemetry</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" weight="duotone" />
          </div>
        </CardContent>
      </Card>

      {/* Critical Threats */}
      <Card className="bg-white border-rose-100 shadow-xs hover:shadow-sm transition-shadow">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider">Critical Threats</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1 font-mono">{criticalCount}</p>
            <span className="text-[11px] text-rose-500 font-medium mt-1 inline-block">Immediate triage required</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <WarningCircle className="w-6 h-6" weight="fill" />
          </div>
        </CardContent>
      </Card>

      {/* High Threats */}
      <Card className="bg-white border-amber-100 shadow-xs hover:shadow-sm transition-shadow">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">High Threats</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 font-mono">{highCount}</p>
            <span className="text-[11px] text-amber-500 font-medium mt-1 inline-block">Urgent investigation</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lightning className="w-6 h-6" weight="fill" />
          </div>
        </CardContent>
      </Card>

      {/* Medium Threats */}
      <Card className="bg-white border-neutral-200/80 shadow-xs hover:shadow-sm transition-shadow">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-600 font-semibold uppercase tracking-wider">Medium Threats</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-neutral-800 mt-1 font-mono">{mediumCount}</p>
            <span className="text-[11px] text-neutral-400 font-medium mt-1 inline-block">Automated observation</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
            <Pulse className="w-6 h-6" weight="duotone" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
