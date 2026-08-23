import { useState, useEffect } from "react"
import type { AlertItem } from "../../alerts/types/alert.types"
import { fetchAlertsFromApi, submitAlertFeedbackApi } from "../../alerts/api/alertService"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { SeverityBadge } from "../../alerts/components/SeverityBadge"
import { StatusBadge } from "../../alerts/components/StatusBadge"
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
  SlidersHorizontal,
  ArrowsDownUp
} from "@phosphor-icons/react"

export function TriageFeedView() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  const loadAlerts = async () => {
    setLoading(true)
    const fetched = await fetchAlertsFromApi(filterSeverity)
    setAlerts(fetched)
    if (fetched.length > 0 && !selectedAlert) {
      setSelectedAlert(fetched[0])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAlerts()
  }, [filterSeverity])

  const handleFeedbackAction = async (alertId: number, status: string, feedback?: string) => {
    const updated = await submitAlertFeedbackApi(alertId, status, feedback)
    loadAlerts()
    if (selectedAlert && selectedAlert.id === alertId && updated) {
      setSelectedAlert(updated)
    }
  }

  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length

  const filteredAlerts = alerts.filter(a => {
    if (!searchTerm) return true
    const query = searchTerm.toLowerCase()
    return (
      a.summary.toLowerCase().includes(query) ||
      a.threat_type.toLowerCase().includes(query) ||
      (a.event?.source_ip ? a.event.source_ip.toLowerCase().includes(query) : false)
    )
  })

  return (
    <div className="space-y-6">
      {/* 3 Nexus-Style Top Metric Cards */}
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
                {alerts.length ? (alerts.length * 3120).toLocaleString() : "12,450"}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <TrendUp className="w-3 h-3 mr-0.5" />
                15.8%
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
                {alerts.length} Incidents
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
                98.5%
              </span>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendDown className="w-3 h-3 mr-0.5" />
                1.2% FP
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Visual Bar Chart + Sub-Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ingestion Velocity & Threat Flow */}
        <Card className="lg:col-span-2 bg-white border-slate-200/80 shadow-xs rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detection Velocity</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 font-sans">9,257.51 ev/s</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  +143.50 increased
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="xs" className="rounded-lg text-xs font-semibold text-slate-600 gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Filter</span>
              </Button>
              <Button variant="outline" size="xs" className="rounded-lg text-xs font-semibold text-slate-600 gap-1">
                <ArrowsDownUp className="w-3 h-3" />
                <span>Sort</span>
              </Button>
            </div>
          </div>

          {/* Visual Blue Bar Grid matching Nexus design */}
          <div className="pt-6 pb-2">
            <div className="grid grid-cols-3 gap-8 items-end h-40 px-4">
              {/* Oct Column */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 font-mono">$2,988.20</span>
                <div className="w-full flex flex-col gap-1.5">
                  <div className="w-full h-5 rounded-lg bg-blue-200/80"></div>
                  <div className="w-full h-5 rounded-lg bg-blue-300/80"></div>
                  <div className="w-full h-5 rounded-lg bg-blue-400/90"></div>
                  <div className="w-full h-5 rounded-lg bg-blue-600"></div>
                </div>
                <span className="text-xs font-bold text-slate-500 mt-2">Oct</span>
              </div>

              {/* Nov Column */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 font-mono">$1,765.09</span>
                <div className="w-full flex flex-col gap-1.5">
                  <div className="w-full h-4 rounded-lg bg-blue-200/80"></div>
                  <div className="w-full h-4 rounded-lg bg-blue-300/80"></div>
                  <div className="w-full h-4 rounded-lg bg-blue-500"></div>
                </div>
                <span className="text-xs font-bold text-slate-500 mt-2">Nov</span>
              </div>

              {/* Dec Column */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-blue-600 font-mono font-bold">$4,005.65</span>
                <div className="w-full flex flex-col gap-1.5">
                  <div className="w-full h-5 rounded-lg bg-blue-200/80"></div>
                  <div className="w-full h-5 rounded-lg bg-blue-300/80"></div>
                  <div className="w-full h-5 rounded-lg bg-blue-400"></div>
                  <div className="w-full h-5 rounded-lg bg-blue-500"></div>
                  <div className="w-full h-5 rounded-lg bg-blue-600"></div>
                </div>
                <span className="text-xs font-bold text-slate-900 mt-2 font-bold">Dec</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Network Flow</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Phishing SMTP</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-300"></span> Malicious URL</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-200"></span> Syslog</span>
            </div>
          </div>
        </Card>

        {/* Right 1 Col: Weekly Anomaly Bar Histogram */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Weekly Threat Volume</span>
              <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Weekly</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-extrabold text-slate-900">24,473</span>
              <span className="text-xs font-bold text-blue-600">+749 events</span>
            </div>
          </div>

          <div className="pt-6">
            <div className="grid grid-cols-7 gap-2 items-end h-28 px-1">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-full h-10 rounded-lg bg-slate-100"></div>
                <span className="text-[10px] text-slate-400">Sun</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-full h-14 rounded-lg bg-slate-100"></div>
                <span className="text-[10px] text-slate-400">Mon</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-bold text-blue-600 font-mono">3,874</span>
                <div className="w-full h-20 rounded-lg bg-blue-600 shadow-sm shadow-blue-500/20"></div>
                <span className="text-[10px] font-bold text-slate-900">Tue</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-full h-8 rounded-lg bg-slate-100"></div>
                <span className="text-[10px] text-slate-400">Wed</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-full h-16 rounded-lg bg-slate-100"></div>
                <span className="text-[10px] text-slate-400">Thu</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-full h-12 rounded-lg bg-slate-100"></div>
                <span className="text-[10px] text-slate-400">Fri</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-full h-18 rounded-lg bg-slate-100"></div>
                <span className="text-[10px] text-slate-400">Sat</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Prioritized Incident Feed & Investigation Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incident Table */}
        <Card className="lg:col-span-2 bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Live Incident Triage Stream</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Real-time alerts, model attributions, and threat classifications</p>
            </div>

            <div className="flex items-center gap-1.5">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                    filterSeverity === sev 
                      ? "bg-blue-600 text-white shadow-xs" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-5">
            {/* Search Filter */}
            <div className="relative mb-4">
              <MagnifyingGlass className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search incidents by IP, type, or payload summary..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs sm:text-sm bg-slate-50/50 border-slate-200 rounded-xl"
              />
            </div>

            {loading ? (
              <p className="text-sm text-slate-400 py-16 text-center font-medium">Loading telemetry feed...</p>
            ) : filteredAlerts.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-700">No alerts found</p>
                <p className="text-xs text-slate-400 mt-1">Simulate new vectors from the Telemetry Ingestion tab.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedAlert?.id === alert.id
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

        {/* Right 1 Col: Deep Investigation Drawer */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900">Incident Details</CardTitle>
              {selectedAlert && (
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  #{selectedAlert.id}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Signal attribution & analyst action</p>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            {selectedAlert ? (
              <>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Severity:</span>
                    <SeverityBadge severity={selectedAlert.severity} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <StatusBadge status={selectedAlert.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Threat Vector:</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedAlert.threat_type}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1.5">
                    <TerminalWindow className="w-4 h-4 text-slate-600" />
                    <span>Raw Event Payload:</span>
                  </div>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36 shadow-inner">
                    {selectedAlert.event?.raw_payload}
                  </div>
                </div>

                {selectedAlert.prediction && (
                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-blue-950">
                      <Brain className="w-4 h-4 text-blue-600" />
                      <span>Model Signal Attribution:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{selectedAlert.prediction.explanation}</p>
                    
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-medium text-slate-600">
                        <span>Probability Score</span>
                        <span className="font-bold text-blue-600">{(selectedAlert.prediction.score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedAlert.prediction.score * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Analyst Actions */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-900">Analyst Workflow Action:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-semibold rounded-xl"
                      onClick={() => handleFeedbackAction(selectedAlert.id, "ACKNOWLEDGED", "TRUE_POSITIVE")}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>Ack</span>
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold rounded-xl"
                      onClick={() => handleFeedbackAction(selectedAlert.id, "RESOLVED", "TRUE_POSITIVE")}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                      <span>Resolve</span>
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 font-semibold rounded-xl"
                      onClick={() => handleFeedbackAction(selectedAlert.id, "FALSE_POSITIVE", "FALSE_POSITIVE")}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      <span>False</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="py-20 text-center text-slate-400">Select an incident to view details.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
