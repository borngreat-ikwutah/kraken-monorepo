import { useEffect, useRef, useState } from "react"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import {
  ArrowsClockwise,
  EnvelopeSimple,
  Globe,
  LinkSimple,
  Scroll,
} from "@phosphor-icons/react"
import type {
  TimeseriesVelocityMonth,
  TimeseriesAnalytics,
} from "../../alerts/types/alert.types"

interface DetectionVelocityCardProps {
  velocityRate: string
  velocityDelta: string
  vectors: TimeseriesAnalytics["velocity"]["vectors"]
  months: TimeseriesVelocityMonth[]
  onSync: () => void
}

const VECTOR_TILES = [
  {
    key: "network_flow",
    label: "Network Anomalies",
    icon: Globe,
    accent: "text-blue-600 bg-blue-50",
  },
  {
    key: "phishing_smtp",
    label: "Phishing Emails",
    icon: EnvelopeSimple,
    accent: "text-rose-600 bg-rose-50",
  },
  {
    key: "malicious_url",
    label: "Malicious URLs",
    icon: LinkSimple,
    accent: "text-amber-600 bg-amber-50",
  },
  {
    key: "syslog",
    label: "Suspicious Logs",
    icon: Scroll,
    accent: "text-slate-600 bg-slate-100",
  },
] as const

export function DetectionVelocityCard({
  velocityRate,
  velocityDelta,
  vectors,
  months,
  onSync,
}: DetectionVelocityCardProps) {
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const syncTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (syncTimerRef.current !== null) clearTimeout(syncTimerRef.current)
    }
  }, [])

  const handleSync = () => {
    setIsSyncing(true)
    onSync()
    syncTimerRef.current = window.setTimeout(() => setIsSyncing(false), 900)
  }

  const maxVolume = Math.max(...months.map((month) => month.volume), 1)

  return (
    <Card className="flex flex-col rounded-2xl border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Detection Velocity
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2.5">
            <span className="font-sans text-2xl font-extrabold text-slate-900">
              {velocityRate}
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
              {velocityDelta}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={handleSync}
          disabled={isSyncing}
          className="w-fit gap-1 rounded-lg text-xs font-semibold text-slate-600"
        >
          <ArrowsClockwise
            className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
          />
          <span>{isSyncing ? "Syncing" : "Sync"}</span>
        </Button>
      </div>

      {/* Monthly event volume trend (timeseries.velocity.months) */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Monthly Event Volume
          </p>
          <p className="font-mono text-[10px] text-slate-400">
            {months.length} months retained
          </p>
        </div>

        {months.length === 0 ? (
          <div className="mt-3 flex h-20 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-[11px] font-medium text-slate-400">
            Awaiting telemetry window from /api/analytics/timeseries
          </div>
        ) : (
          <div className="mt-3 flex h-20 items-end gap-1.5">
            {months.map((month, index) => {
              const isLatest = index === months.length - 1
              const heightPct = Math.max((month.volume / maxVolume) * 100, 6)
              return (
                <div
                  key={month.month}
                  className="group flex h-full flex-1 flex-col items-center gap-1"
                >
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      title={`${month.month}: ${month.volume.toLocaleString()} events`}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isLatest
                          ? "bg-blue-600 group-hover:bg-blue-500"
                          : "bg-blue-100 group-hover:bg-blue-300"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span
                    className={`font-mono text-[9px] ${
                      isLatest ? "font-bold text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {month.month}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Threat vector breakdown */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {VECTOR_TILES.map((tile) => {
          const Icon = tile.icon
          return (
            <div
              key={tile.key}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-colors hover:border-slate-200 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${tile.accent}`}
                >
                  <Icon className="h-4 w-4" weight="duotone" />
                </span>
                <span className="font-mono text-lg font-bold text-slate-900">
                  {vectors[tile.key].toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-semibold text-slate-500">
                {tile.label}
              </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
