import { useCallback } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  Empty,
  EmptyActions,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@workspace/ui/components/empty"
import { useAlerts } from "../../alerts/hooks/useAlerts"
import { useAnalytics } from "../hooks/useAnalytics"
import { SeverityBadge } from "../../alerts/components/SeverityBadge"
import { StatusBadge } from "../../alerts/components/StatusBadge"
import type { SeverityType } from "../../alerts/types/alert.types"
import { TriageMetricCards } from "./TriageMetricCards"
import { DetectionVelocityCard } from "./DetectionVelocityCard"
import { WeeklyThreatHistogram } from "./WeeklyThreatHistogram"
import { IncidentTriageDrawer } from "./IncidentTriageDrawer"
import {
  ArrowUpRight,
  MagnifyingGlass,
  Pause,
  Play,
  ShieldWarning,
  X,
} from "@phosphor-icons/react"

const SEVERITY_FILTERS = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const

const SEVERITY_STRIPE: Record<SeverityType, string> = {
  CRITICAL: "bg-rose-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-blue-500",
}

const FALLBACK_WEEK_DAYS = [
  { day: "Sun", date: "", count: 0, is_today: false },
  { day: "Mon", date: "", count: 0, is_today: false },
  { day: "Tue", date: "", count: 0, is_today: false },
  { day: "Wed", date: "", count: 0, is_today: false },
  { day: "Thu", date: "", count: 0, is_today: false },
  { day: "Fri", date: "", count: 0, is_today: false },
  { day: "Sat", date: "", count: 0, is_today: false },
]

function formatRelativeTime(isoTimestamp: string): string {
  if (!isoTimestamp) return ""
  const timestamp = new Date(isoTimestamp).getTime()
  if (Number.isNaN(timestamp)) return ""

  const elapsedSeconds = Math.round((Date.now() - timestamp) / 1000)
  if (elapsedSeconds < 60) return `${Math.max(elapsedSeconds, 0)}s ago`
  const elapsedMinutes = Math.floor(elapsedSeconds / 60)
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`
  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `${elapsedHours}h ago`
  return new Date(timestamp).toLocaleDateString()
}

export function TriageFeedView() {
  const {
    alerts,
    loading: alertsLoading,
    selectedAlert,
    isPaused,
    bufferedCount,
    filterSeverity,
    searchTerm,
    maxDisplayed,
    setFilterSeverity,
    setSearchTerm,
    selectAlert,
    togglePause,
    flushNow,
    refresh: refreshAlerts,
  } = useAlerts({
    autoRefreshInterval: 3000,
    flushIntervalMs: 3500,
    maxDisplayed: 100,
  })

  const { metrics, timeseries, refresh: refreshAnalytics } = useAnalytics(4000)

  const handleRefreshAll = useCallback(() => {
    refreshAlerts()
    refreshAnalytics()
  }, [refreshAlerts, refreshAnalytics])

  const closeDrawer = useCallback(() => {
    selectAlert(null)
  }, [selectAlert])

  // Top metrics from GET /api/analytics/metrics
  const totalEvents = metrics?.total_events ?? alerts.length * 12
  const eventsDelta = metrics?.events_delta_pct ?? 0
  const threatAlertsFired =
    metrics?.open_alerts ?? metrics?.total_alerts ?? alerts.length
  const criticalCount =
    metrics?.critical_open_count ??
    metrics?.critical_count ??
    alerts.filter((alert) => alert.severity === "CRITICAL").length
  const precisionRate = metrics?.precision_rate ?? 100
  const falsePositiveRate = metrics?.false_positive_rate ?? 0

  // Timeseries aggregations from GET /api/analytics/timeseries
  const velocityRate = timeseries?.velocity.rate_str ?? "0.00 ev/s"
  const velocityDelta =
    timeseries?.velocity.rate_increase ?? "Awaiting stream baseline"
  const vectorCounts = timeseries?.velocity.vectors ?? {
    network_flow: 0,
    phishing_smtp: 0,
    malicious_url: 0,
    syslog: 0,
  }
  const velocityMonths = timeseries?.velocity.months ?? []
  const weeklyDays = timeseries?.weekly_threat_volume.days ?? FALLBACK_WEEK_DAYS
  const weeklyTotal =
    timeseries?.weekly_threat_volume.total_events ?? alerts.length
  const weeklyDelta =
    timeseries?.weekly_threat_volume.delta_label ?? `+${weeklyTotal} events`

  const isFiltered = filterSeverity !== "ALL" || searchTerm.trim().length > 0
  const newIncidentCount = alerts.filter(
    (alert) => alert.status === "NEW"
  ).length

  const clearFilters = () => {
    setFilterSeverity("ALL")
    setSearchTerm("")
  }

  return (
    <div className="relative space-y-6 pb-10">
      {/* 1. Aggregate detection metrics (GET /api/analytics/metrics) */}
      <TriageMetricCards
        totalEvents={totalEvents}
        eventsDelta={eventsDelta}
        threatAlertsFired={threatAlertsFired}
        criticalCount={criticalCount}
        precisionRate={precisionRate}
        falsePositiveRate={falsePositiveRate}
      />

      {/* 2. Detection velocity, vector mix & weekly volume (GET /api/analytics/timeseries) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DetectionVelocityCard
          velocityRate={velocityRate}
          velocityDelta={velocityDelta}
          vectors={vectorCounts}
          months={velocityMonths}
          onSync={handleRefreshAll}
        />
        <WeeklyThreatHistogram
          total={weeklyTotal}
          deltaLabel={weeklyDelta}
          days={weeklyDays}
        />
      </div>

      {/* 3. Live buffered incident stream (GET /api/alerts) */}
      <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
        <CardHeader className="flex flex-col gap-3 border-b border-slate-100 p-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <CardTitle className="text-base font-bold text-slate-900">
                Live Incident Triage Stream
              </CardTitle>
              {isPaused ? (
                <span className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Feed paused
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live · 3.5s batch
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {alerts.length} of {maxDisplayed} incidents streamed ·{" "}
              {newIncidentCount} awaiting first review
              {!selectedAlert && alerts.length > 0 ? " · select a row to open triage details" : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={togglePause}
              title={
                isPaused
                  ? "Resume the live batch stream"
                  : "Pause the live batch stream"
              }
              className={`h-8 gap-1.5 rounded-xl px-3 text-xs font-semibold shadow-2xs transition-all ${
                isPaused
                  ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="h-3.5 w-3.5 text-amber-600" weight="fill" />
                  <span>Resume Feed</span>
                </>
              ) : (
                <>
                  <Pause className="h-3.5 w-3.5 text-slate-500" weight="fill" />
                  <span>Pause Live Feed</span>
                </>
              )}
            </Button>

            <div className="hidden h-4 w-px bg-slate-200 sm:block" />

            {/* Severity segmented filter */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              {SEVERITY_FILTERS.map((severity) => {
                const isActive = filterSeverity === severity
                return (
                  <button
                    key={severity}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setFilterSeverity(severity)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-white text-blue-700 shadow-xs ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {severity}
                  </button>
                )
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {/* Telemetry captured in the silent buffer while paused */}
          {isPaused && bufferedCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/80 bg-amber-50 p-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                </span>
                <div>
                  <p className="text-xs font-bold text-amber-950">
                    {bufferedCount} new alert{bufferedCount === 1 ? "" : "s"}{" "}
                    buffered
                  </p>
                  <p className="text-[10px] text-amber-800">
                    Incoming telemetry is held in the background until you flush
                    or resume.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={flushNow}
                className="h-7 rounded-lg border-amber-300 bg-white px-3 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-100/60"
              >
                Flush Buffer ({bufferedCount})
              </Button>
            </div>
          )}

          {/* Query filter (GET /api/alerts?q=...) */}
          <div className="relative mb-4">
            <MagnifyingGlass className="absolute top-2.5 left-3.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search incidents by IP, threat vector or summary..."
              className="rounded-xl border-slate-200 bg-slate-50/50 pr-9 pl-9 text-xs sm:text-sm"
            />
            {searchTerm.length > 0 && (
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => setSearchTerm("")}
                className="absolute top-2.5 right-3 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" weight="bold" />
              </button>
            )}
          </div>

          {alertsLoading && alerts.length === 0 ? (
            /* Skeleton placeholder keeps layout stable during the first fetch */
            <div className="space-y-3">
              {[0, 1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="animate-pulse rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-16 rounded bg-slate-100" />
                    <span className="h-5 w-20 rounded bg-slate-100" />
                    <span className="h-5 w-24 rounded bg-slate-100" />
                  </div>
                  <span className="mt-3 block h-3.5 w-3/4 rounded bg-slate-100" />
                  <span className="mt-2 block h-3 w-1/2 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <Empty className="my-6">
              <EmptyMedia variant="icon">
                <ShieldWarning
                  className="h-6 w-6 text-amber-500"
                  weight="duotone"
                />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Threat Incidents Found</EmptyTitle>
                <EmptyDescription>
                  {isFiltered
                    ? "No alerts match the current severity filter or search query."
                    : "The detection pipeline has not produced any incidents yet. Ingest telemetry to populate the stream."}
                </EmptyDescription>
              </EmptyHeader>
              {isFiltered && (
                <EmptyActions>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 rounded-xl border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    Clear filters
                  </Button>
                </EmptyActions>
              )}
            </Empty>
          ) : (
            <div className="max-h-[640px] space-y-3 overflow-y-auto pr-1">
              {alerts.map((alert) => {
                const isActive = selectedAlert?.id === alert.id
                const sourceIp = alert.event?.source_ip
                const destinationIp = alert.event?.destination_ip

                return (
                  <button
                    key={alert.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => selectAlert(alert)}
                    className={`group relative flex w-full flex-col overflow-hidden rounded-xl border p-4 pl-5 text-left transition-all focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none ${
                      isActive
                        ? "border-blue-500/80 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    {/* Severity accent stripe */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-0 left-0 w-1 ${SEVERITY_STRIPE[alert.severity]}`}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={alert.severity} />
                        <StatusBadge status={alert.status} />
                        <span className="font-mono text-xs font-bold text-slate-600">
                          {alert.threat_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                        <span title={alert.created_at}>
                          {formatRelativeTime(alert.created_at)}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>#{alert.id}</span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5 text-blue-500 opacity-0 transition-opacity group-hover:opacity-100"
                          weight="bold"
                        />
                      </div>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">
                      {alert.summary}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
                      <span className="font-mono">
                        {sourceIp
                          ? `${sourceIp} → ${destinationIp || "unknown"}`
                          : "No IP telemetry attached"}
                      </span>
                      {alert.prediction && (
                        <span className="font-medium">
                          {alert.prediction.model_name} ·{" "}
                          <strong className="font-bold text-blue-600">
                            {(alert.prediction.score * 100).toFixed(1)}%
                          </strong>
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide-over triage drawer (GET/PATCH /api/alerts/:id) */}
      {selectedAlert && (
        <IncidentTriageDrawer
          alert={selectedAlert}
          onClose={closeDrawer}
          onRefresh={handleRefreshAll}
        />
      )}
    </div>
  )
}
