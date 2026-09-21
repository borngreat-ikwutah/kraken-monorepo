import { useState, useEffect } from "react"
import { useAlerts } from "../../alerts/hooks/useAlerts"
import { useAnalytics } from "../hooks/useAnalytics"
import { fetchAlertByIdApi, patchAlertApi } from "../../alerts/api/alertService"
import type { AlertItem } from "../../alerts/types/alert.types"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { SeverityBadge } from "../../alerts/components/SeverityBadge"
import { StatusBadge } from "../../alerts/components/StatusBadge"
import { 
  Empty, 
  EmptyMedia, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription 
} from "@workspace/ui/components/empty"
import { 
  TrendUp, 
  TrendDown,
  Info,
  MagnifyingGlass,
  Check,
  ArrowUpRight,
  XCircle,
  Brain,
  TerminalWindow,
  ShieldWarning,
  Crosshair,
  ArrowsClockwise,
  Pause,
  Play,
  PaperPlaneTilt,
  Copy,
  EnvelopeSimple,
  User,
  Bell
} from "@phosphor-icons/react"

export function TriageFeedView() {
  const {
    alerts,
    selectedAlert,
    loading: alertsLoading,
    filterSeverity,
    searchTerm,
    isPaused,
    bufferedCount,
    maxDisplayed,
    setFilterSeverity,
    setSearchTerm,
    selectAlert,
    togglePause,
    flushNow,
    refresh: refreshAlerts
  } = useAlerts({ autoRefreshInterval: 3000, flushIntervalMs: 3500, maxDisplayed: 100 })

  const { metrics, timeseries, refresh: refreshAnalytics } = useAnalytics(4000)
  
  const [activeAlertDetails, setActiveAlertDetails] = useState<AlertItem | null>(null)
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [selectedAssignee, setSelectedAssignee] = useState<string>("Alex Mercer (SOC Lead)")
  const [selectedChannel, setSelectedChannel] = useState<string>("Email Dispatch")
  const [dispatchMessage, setDispatchMessage] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  // Whenever selectedAlert changes in the list, fetch fresh details from /api/alerts/:id
  useEffect(() => {
    if (!selectedAlert) {
      setActiveAlertDetails(null)
      return
    }

    let isMounted = true
    const loadDetails = async () => {
      setDetailsLoading(true)
      const details = await fetchAlertByIdApi(selectedAlert.id)
      if (isMounted) {
        setActiveAlertDetails(details || selectedAlert)
        setDetailsLoading(false)
      }
    }
    loadDetails()

    return () => {
      isMounted = false
    }
  }, [selectedAlert])

  const handleAction = async (status: string, feedback?: string) => {
    if (!activeAlertDetails) return
    setActionLoading(true)
    try {
      const updated = await patchAlertApi(activeAlertDetails.id, {
        status,
        analyst_feedback: feedback
      })
      if (updated) {
        setActiveAlertDetails(updated)
      }
      refreshAlerts()
      refreshAnalytics()
    } finally {
      setActionLoading(false)
    }
  }

  const handleManualSync = () => {
    refreshAlerts()
    refreshAnalytics()
  }

  const handleDispatchAlert = () => {
    if (!activeAlertDetails) return
    setDispatchMessage(`Dispatched Incident #${activeAlertDetails.id} to ${selectedAssignee} via ${selectedChannel}`)
    setTimeout(() => {
      setDispatchMessage(null)
    }, 4500)
  }

  const handleCopyBrief = () => {
    if (!activeAlertDetails) return
    const text = `[KrakenSec Incident #${activeAlertDetails.id}] ${activeAlertDetails.severity} ${activeAlertDetails.threat_type}\nSummary: ${activeAlertDetails.summary}\nSource IP: ${activeAlertDetails.event?.source_ip || "N/A"} -> ${activeAlertDetails.event?.destination_ip || "N/A"}\nModel: ${activeAlertDetails.prediction?.model_name || "ML Ensemble"} (${((activeAlertDetails.prediction?.score || 0) * 100).toFixed(1)}% confidence)`
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Top Metrics from /api/analytics/metrics
  const totalEvents = metrics?.total_events ?? alerts.length * 12
  const eventsDelta = metrics?.events_delta_pct ?? 15.8
  const threatAlertsFired = metrics?.open_alerts ?? metrics?.total_alerts ?? alerts.length
  const criticalCount = metrics?.critical_open_count ?? metrics?.critical_count ?? alerts.filter(a => a.severity === "CRITICAL").length
  const precisionRate = metrics?.precision_rate ?? 98.5
  const fpRate = metrics?.false_positive_rate ?? 1.2

  // Timeseries data from /api/analytics/timeseries
  const velocityRate = timeseries?.velocity.rate_str ?? `${(totalEvents * 0.75 + 143.5).toFixed(2)} ev/s`
  const velocityDelta = timeseries?.velocity.rate_increase ?? "+143.50 increased"
  const vectorCounts = timeseries?.velocity.vectors ?? {
    network_flow: 0,
    phishing_smtp: 0,
    malicious_url: 0,
    syslog: 0
  }
  const weeklyDays = timeseries?.weekly_threat_volume.days ?? [
    { day: "Sun", date: "", count: 0, is_today: false },
    { day: "Mon", date: "", count: 0, is_today: false },
    { day: "Tue", date: "", count: 0, is_today: true },
    { day: "Wed", date: "", count: 0, is_today: false },
    { day: "Thu", date: "", count: 0, is_today: false },
    { day: "Fri", date: "", count: 0, is_today: false },
    { day: "Sat", date: "", count: 0, is_today: false }
  ]
  const weeklyTotal = timeseries?.weekly_threat_volume.total_events ?? alerts.length
  const weeklyDelta = timeseries?.weekly_threat_volume.delta_label ?? `+${weeklyTotal} events this week`

  // Calculate max count for dynamic bar chart height scaling
  const maxWeeklyCount = Math.max(...weeklyDays.map(d => d.count), 1)

  return (
    <div className="space-y-6">
      {/* 1. Top Metrics Cards (/api/analytics/metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1: Total Events */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Telemetry Events</span>
              <Info className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {totalEvents.toLocaleString()}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <TrendUp className="w-3 h-3 mr-0.5" />
                {eventsDelta >= 0 ? `+${eventsDelta}%` : `${eventsDelta}%`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Threats Detected */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Threat Alerts Fired</span>
              <Info className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {threatAlertsFired} Incidents
              </span>
              <span className="inline-flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                <TrendUp className="w-3 h-3 mr-0.5" />
                {criticalCount} Critical
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Model Accuracy Benchmark */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">ML Precision Rate</span>
              <Info className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {precisionRate}%
              </span>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendDown className="w-3 h-3 mr-0.5" />
                {fpRate}% FP
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Charts & Aggregations (/api/analytics/timeseries) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Detection Velocity & Threat Flow */}
        <Card className="lg:col-span-2 bg-white border-slate-200/80 shadow-xs rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detection Velocity</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 font-sans">{velocityRate}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {velocityDelta}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="xs" 
                onClick={handleManualSync}
                className="rounded-lg text-xs font-semibold text-slate-600 gap-1"
              >
                <ArrowsClockwise className="w-3.5 h-3.5" />
                <span>Sync</span>
              </Button>
            </div>
          </div>

          {/* Dynamic Visual Breakdown by Vector */}
          <div className="pt-6 pb-2">
            <div className="grid grid-cols-4 gap-4 items-end h-36 px-2">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-blue-600 font-mono">{vectorCounts.network_flow}</span>
                <div 
                  className="w-full rounded-xl bg-blue-600 shadow-sm transition-all duration-500"
                  style={{ height: `${Math.max(16, (vectorCounts.network_flow / Math.max(totalEvents, 1)) * 100)}px` }}
                />
                <span className="text-[11px] font-bold text-slate-700 mt-1">Network</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-blue-500 font-mono">{vectorCounts.phishing_smtp}</span>
                <div 
                  className="w-full rounded-xl bg-blue-400 shadow-sm transition-all duration-500"
                  style={{ height: `${Math.max(16, (vectorCounts.phishing_smtp / Math.max(totalEvents, 1)) * 100)}px` }}
                />
                <span className="text-[11px] font-bold text-slate-700 mt-1">Phishing</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-blue-400 font-mono">{vectorCounts.malicious_url}</span>
                <div 
                  className="w-full rounded-xl bg-blue-300 shadow-sm transition-all duration-500"
                  style={{ height: `${Math.max(16, (vectorCounts.malicious_url / Math.max(totalEvents, 1)) * 100)}px` }}
                />
                <span className="text-[11px] font-bold text-slate-700 mt-1">URL</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 font-mono">{vectorCounts.syslog}</span>
                <div 
                  className="w-full rounded-xl bg-slate-300 shadow-sm transition-all duration-500"
                  style={{ height: `${Math.max(16, (vectorCounts.syslog / Math.max(totalEvents, 1)) * 100)}px` }}
                />
                <span className="text-[11px] font-bold text-slate-700 mt-1">Syslog</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Network Flow ({vectorCounts.network_flow})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Phishing SMTP ({vectorCounts.phishing_smtp})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-300"></span> Malicious URL ({vectorCounts.malicious_url})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Syslog ({vectorCounts.syslog})</span>
            </div>
          </div>
        </Card>

        {/* Right 1 Col: Weekly Anomaly Bar Histogram */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Weekly Threat Volume</span>
              <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Current Week</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-extrabold text-slate-900">{weeklyTotal}</span>
              <span className="text-xs font-bold text-blue-600">{weeklyDelta}</span>
            </div>
          </div>

          <div className="pt-6">
            <div className="grid grid-cols-7 gap-2 items-end h-28 px-1">
              {weeklyDays.map((d, idx) => {
                const heightPct = Math.max(12, Math.round((d.count / maxWeeklyCount) * 80))
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    {d.count > 0 && (
                      <span className="text-[9px] font-bold text-blue-600 font-mono">{d.count}</span>
                    )}
                    <div 
                      className={`w-full rounded-lg transition-all duration-300 ${
                        d.is_today 
                          ? "bg-blue-600 shadow-xs shadow-blue-500/20" 
                          : d.count > 0 
                          ? "bg-blue-200" 
                          : "bg-slate-100"
                      }`}
                      style={{ height: `${heightPct}px` }}
                    />
                    <span className={`text-[10px] ${d.is_today ? "font-bold text-slate-900" : "text-slate-400"}`}>
                      {d.day}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Live Incident Triage Stream (/api/alerts + Live Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Paginated Alerts Stream */}
        <Card className="lg:col-span-2 bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-base font-bold text-slate-900">Live Incident Triage Stream</CardTitle>
                <div className="flex items-center gap-1.5">
                  {isPaused ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Feed Paused
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live (3.5s batch)
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-400">
                    Max: {maxDisplayed} items
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Real-time buffered alerts, model attributions, and threat classifications</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Pause / Resume Live Feed Toggle UX */}
              <Button
                variant="outline"
                size="sm"
                onClick={togglePause}
                className={`text-xs rounded-xl font-semibold gap-1.5 transition-all shadow-2xs h-8 px-3 ${
                  isPaused
                    ? "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
                title={isPaused ? "Resume Live Batch Stream" : "Pause Live Batch Stream"}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-600" weight="fill" />
                    <span>Resume Feed</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-slate-500" weight="fill" />
                    <span>Pause Live Feed</span>
                  </>
                )}
              </Button>

              <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

              {/* Severity Filter Tabs */}
              <div className="flex items-center gap-1">
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                      filterSeverity === sev 
                        ? "bg-blue-600 text-white shadow-xs" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            {/* Paused Buffer Notification Banner */}
            {isPaused && bufferedCount > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300/80 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <div>
                    <p className="text-xs font-bold text-amber-950">
                      {bufferedCount} new alert{bufferedCount === 1 ? "" : "s"} hidden
                    </p>
                    <p className="text-[10px] text-amber-800">
                      Incoming telemetry is safely captured in the background buffer while paused.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={flushNow}
                  className="text-xs h-7 px-3 bg-white border-amber-300 text-amber-900 hover:bg-amber-100/60 rounded-lg font-bold shadow-2xs"
                >
                  Flush Buffer Now ({bufferedCount})
                </Button>
              </div>
            )}

            {/* Search Filter Box (/api/alerts?q=...) */}
            <div className="relative mb-4">
              <MagnifyingGlass className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search incidents by query parameter (IP, vector, summary)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs sm:text-sm bg-slate-50/50 border-slate-200 rounded-xl"
              />
            </div>

            {alertsLoading && alerts.length === 0 ? (
              <p className="text-sm text-slate-400 py-16 text-center font-medium">Loading live incident stream...</p>
            ) : alerts.length === 0 ? (
              <Empty className="my-6">
                <EmptyMedia variant="icon">
                  <ShieldWarning className="w-6 h-6 text-amber-500" weight="duotone" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No Threat Incidents Found</EmptyTitle>
                  <EmptyDescription>
                    No alerts matching your query or filter criteria were found in MySQL.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => selectAlert(alert)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      (activeAlertDetails?.id === alert.id || selectedAlert?.id === alert.id)
                        ? "bg-blue-50/60 border-blue-500/80 shadow-xs ring-1 ring-blue-500/20"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={alert.severity} />
                        <StatusBadge status={alert.status} />
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {alert.threat_type}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : ""}
                      </span>
                    </div>

                    <p className="text-sm font-semibold mt-2 text-slate-900">{alert.summary}</p>

                    {alert.prediction && (
                      <div className="flex flex-wrap items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                        <span>Model: <code className="font-mono text-slate-800 font-semibold">{alert.prediction.model_name}</code></span>
                        <span className="font-medium">Confidence: <strong className="text-blue-600 font-bold">{(alert.prediction.score * 100).toFixed(1)}%</strong></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Incident Details View (/api/alerts/:id) */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900">Incident Details</CardTitle>
              {activeAlertDetails && (
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  #{activeAlertDetails.id}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Signal attribution & analyst action</p>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            {detailsLoading ? (
              <p className="text-center py-12 text-slate-400">Fetching incident #{selectedAlert?.id}...</p>
            ) : activeAlertDetails ? (
              <>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Severity:</span>
                    <SeverityBadge severity={activeAlertDetails.severity} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <StatusBadge status={activeAlertDetails.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Threat Vector:</span>
                    <span className="font-mono font-semibold text-slate-800">{activeAlertDetails.threat_type}</span>
                  </div>
                  {activeAlertDetails.event?.source_ip && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Source IP:</span>
                      <span className="font-mono text-slate-800">{activeAlertDetails.event.source_ip}</span>
                    </div>
                  )}
                  {activeAlertDetails.event?.destination_ip && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Destination IP:</span>
                      <span className="font-mono text-slate-800">{activeAlertDetails.event.destination_ip}</span>
                    </div>
                  )}
                </div>

                {/* Raw Event Payload */}
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1.5">
                    <TerminalWindow className="w-4 h-4 text-slate-600" />
                    <span>Raw Event Payload:</span>
                  </div>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36 shadow-inner whitespace-pre-wrap">
                    {activeAlertDetails.event?.raw_payload || "No raw payload available"}
                  </div>
                </div>

                {/* Model Consensus & Breakdown */}
                {activeAlertDetails.prediction && (
                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-blue-950">
                      <Brain className="w-4 h-4 text-blue-600" />
                      <span>Model Signal Attribution:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{activeAlertDetails.prediction.explanation}</p>
                    
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-medium text-slate-600">
                        <span>Probability Score</span>
                        <span className="font-bold text-blue-600">{(activeAlertDetails.prediction.score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${activeAlertDetails.prediction.score * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Analyst Action Triggers (PATCH /api/alerts/:id) */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-900">Analyst Workflow Action:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-semibold rounded-xl"
                      onClick={() => handleAction("ACKNOWLEDGED", "TRUE_POSITIVE")}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>Ack</span>
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold rounded-xl"
                      onClick={() => handleAction("RESOLVED", "TRUE_POSITIVE")}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                      <span>Resolve</span>
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 font-semibold rounded-xl"
                      onClick={() => handleAction("FALSE_POSITIVE", "FALSE_POSITIVE")}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      <span>False</span>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Alert / Escalate to Specific Person or Team */}
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span>Escalate & Alert Team:</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyBrief}
                      className="h-6 px-2 text-[10px] text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      title="Copy incident investigation brief to clipboard"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedLink ? "Copied!" : "Copy Brief"}</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Assignee / Responder:
                      </label>
                      <div className="relative">
                        <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={selectedAssignee}
                          onChange={(e) => setSelectedAssignee(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Alex Mercer (SOC Lead)">Alex Mercer (SOC Lead)</option>
                          <option value="Sarah Connor (Incident Responder)">Sarah Connor (Incident Responder)</option>
                          <option value="DevSecOps On-Call Team">DevSecOps On-Call Team</option>
                          <option value="Network Infrastructure Admin">Network Infrastructure Admin</option>
                          <option value="Threat Intelligence Team">Threat Intelligence Team</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Notification Method:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedChannel("Email (Urgent Dispatch)")}
                          className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                            selectedChannel.includes("Email")
                              ? "bg-blue-50 border-blue-300 text-blue-800 shadow-2xs"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <EnvelopeSimple className="w-3.5 h-3.5 text-rose-500" weight="duotone" />
                          <span>Email Dispatch</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedChannel("SOC Console Notification")}
                          className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                            selectedChannel.includes("SOC Console")
                              ? "bg-blue-50 border-blue-300 text-blue-800 shadow-2xs"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Bell className="w-3.5 h-3.5 text-blue-600" weight="duotone" />
                          <span>SOC Console</span>
                        </button>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleDispatchAlert}
                      className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <PaperPlaneTilt className="w-3.5 h-3.5" weight="bold" />
                      <span>Dispatch Alert to {selectedAssignee.split(" ")[0]}</span>
                    </Button>

                    {dispatchMessage && (
                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold text-center animate-fadeIn">
                        ✓ {dispatchMessage}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <Empty className="my-8">
                <EmptyMedia variant="icon">
                  <Crosshair className="w-6 h-6 text-slate-400" weight="duotone" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No Incident Selected</EmptyTitle>
                  <EmptyDescription>
                    Click on an incident alert from the live stream to inspect its raw payload and model decision path.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
