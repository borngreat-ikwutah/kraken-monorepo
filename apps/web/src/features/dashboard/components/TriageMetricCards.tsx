import type { ReactNode } from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Brain,
  Pulse,
  ShieldWarning,
  TrendDown,
  TrendUp,
} from "@phosphor-icons/react"

interface TriageMetricCardsProps {
  totalEvents: number
  eventsDelta: number
  threatAlertsFired: number
  criticalCount: number
  precisionRate: number
  falsePositiveRate: number
}

interface MetricTileProps {
  label: string
  value: string
  hint: string
  icon: ReactNode
  iconClassName: string
  footer: ReactNode
}

function MetricTile({
  label,
  value,
  hint,
  icon,
  iconClassName,
  footer,
}: MetricTileProps) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              {label}
            </p>
            <p className="mt-2 font-sans text-3xl font-extrabold tracking-tight text-slate-900">
              {value}
            </p>
          </div>
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
          >
            {icon}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">{footer}</div>
        <p className="mt-2 text-[11px] font-medium text-slate-400">{hint}</p>
      </CardContent>
    </Card>
  )
}

export function TriageMetricCards({
  totalEvents,
  eventsDelta,
  threatAlertsFired,
  criticalCount,
  precisionRate,
  falsePositiveRate,
}: TriageMetricCardsProps) {
  const eventsTrendUp = eventsDelta >= 0

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <MetricTile
        label="Total Telemetry Events"
        value={totalEvents.toLocaleString()}
        hint="Rolling ingest volume across all sensors"
        icon={<Pulse className="h-5 w-5" weight="duotone" />}
        iconClassName="bg-blue-50 text-blue-600"
        footer={
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              eventsTrendUp
                ? "bg-blue-50 text-blue-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {eventsTrendUp ? (
              <TrendUp className="h-3 w-3" weight="bold" />
            ) : (
              <TrendDown className="h-3 w-3" weight="bold" />
            )}
            {eventsTrendUp ? `+${eventsDelta}%` : `${eventsDelta}%`}
          </span>
        }
      />

      <MetricTile
        label="Threat Alerts Fired"
        value={`${threatAlertsFired.toLocaleString()}`}
        hint="Open incidents awaiting analyst triage"
        icon={<ShieldWarning className="h-5 w-5" weight="duotone" />}
        iconClassName="bg-rose-50 text-rose-600"
        footer={
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">
            <ShieldWarning className="h-3 w-3" weight="fill" />
            {criticalCount} critical
          </span>
        }
      />

      <MetricTile
        label="ML Precision Rate"
        value={`${precisionRate}%`}
        hint="Ensemble scoring agreement on reviewed alerts"
        icon={<Brain className="h-5 w-5" weight="duotone" />}
        iconClassName="bg-emerald-50 text-emerald-600"
        footer={
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
            <TrendDown className="h-3 w-3" weight="bold" />
            {falsePositiveRate}% false positives
          </span>
        }
      />
    </div>
  )
}
