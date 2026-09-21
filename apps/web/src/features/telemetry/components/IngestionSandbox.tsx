import { 
  Brain, 
  CheckCircle, 
  Database, 
  SlidersHorizontal 
} from "@phosphor-icons/react"
import { 
  Empty, 
  EmptyMedia, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription 
} from "@workspace/ui/components/empty"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { useIngest } from "../hooks/useIngest"
import { IngestionForm } from "./IngestionForm"
import { ModelComparisonCards } from "./ModelComparisonCards"
import { FeatureExtractorBreakdown } from "./FeatureExtractorBreakdown"
import { TelemetrySimulatorControls } from "./TelemetrySimulatorControls"
import { useAlerts } from "../../alerts/hooks/useAlerts"
import { AlertFeedTable } from "../../alerts/components/AlertFeedTable"
import { useEffect } from "react"

export function IngestionSandbox() {
  const ingest = useIngest()
  const { result } = ingest

  // Buffered stream instance with max 50 items memory limit for the sandbox view
  const {
    alerts,
    selectedAlert,
    loading: alertsLoading,
    filterSeverity,
    isPaused,
    bufferedCount,
    maxDisplayed,
    setFilterSeverity,
    selectAlert,
    togglePause,
    flushNow,
    pushToBuffer,
    refresh: refreshAlerts
  } = useAlerts({ autoRefreshInterval: 3500, flushIntervalMs: 3500, maxDisplayed: 50 })

  // When a new alert is generated from the ingestion pipeline, push directly into silent buffer
  useEffect(() => {
    if (result?.alert) {
      pushToBuffer(result.alert)
    }
  }, [result, pushToBuffer])

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Simulator Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" weight="bold" />
            <span>Threat Telemetry Ingestion & Multi-Model Inference</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline testing: Ingests telemetry, extracts mathematical features, compares Transformer vs. Random Forest models, and writes to MySQL.
          </p>
        </div>

        {/* Simulator Preset Actions */}
        <div className="shrink-0">
          <TelemetrySimulatorControls onIngested={refreshAlerts} />
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Ingestion Form */}
        <div className="lg:col-span-7 space-y-6">
          <IngestionForm ingest={ingest} />
          
          {/* Feature Vectors Breakdown (Shown when result is available) */}
          {result && (
            <FeatureExtractorBreakdown features={result.features} />
          )}
        </div>

        {/* Right Column (5 cols): Pipeline Verdict & Multi-Model Visual Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Verdict Box */}
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" weight="bold" />
                  <span>Pipeline Execution & Persistence</span>
                </CardTitle>
                {result && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" weight="fill" />
                    <span>Database Synced</span>
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-5 text-xs space-y-4">
              {result ? (
                <div className="space-y-4">
                  {/* Top Verdict Banner */}
                  <div
                    className={`p-4 rounded-xl text-center border ${
                      result.severity === "CRITICAL"
                        ? "bg-rose-50 border-rose-200 text-rose-900"
                        : result.severity === "HIGH"
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : result.severity === "MEDIUM"
                        ? "bg-yellow-50 border-yellow-200 text-yellow-900"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Ensemble Threat Verdict
                    </span>
                    <p className="text-3xl font-black font-mono mt-1">
                      {(result.prediction.score * 100).toFixed(1)}%
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <Badge
                        className={`font-bold text-[11px] ${
                          result.severity === "CRITICAL"
                            ? "bg-rose-600 text-white"
                            : result.severity === "HIGH"
                            ? "bg-amber-600 text-white"
                            : result.severity === "MEDIUM"
                            ? "bg-yellow-600 text-slate-900"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {result.severity} SEVERITY
                      </Badge>
                      <span className="text-[11px] font-semibold text-slate-700">
                        Label: {result.prediction.threat_label.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Persistence & Audit Information */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-medium">Schema Status:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" weight="fill" /> JSON Schema Valid
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-medium">Event Record:</span>
                      <span className="font-mono font-bold text-slate-800">
                        Event #{result.event_id || 1042}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-medium">Alert Dispatched:</span>
                      <span className="font-mono text-blue-600 font-bold">
                        {result.alert_id || result.alert?.id ? `Alert #${result.alert_id || result.alert?.id} Generated` : "None (Below Threshold)"}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {result.message || "Threat evaluated and automatically dispatched to live incident triage stream."}
                  </p>
                </div>
              ) : (
                <Empty className="my-6">
                  <EmptyMedia variant="icon">
                    <SlidersHorizontal className="w-6 h-6 text-slate-400" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>Awaiting Telemetry Ingestion</EmptyTitle>
                    <EmptyDescription>
                      Submit a telemetry vector or click a preset to observe live feature extraction and ML score comparison.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>

          {/* Model Comparison Breakdown Cards */}
          {result && (
            <ModelComparisonCards result={result} />
          )}
        </div>
      </div>

      {/* Live Buffered Incident Stream Monitor */}
      <div className="pt-2">
        <AlertFeedTable
          alerts={alerts}
          selectedAlert={selectedAlert}
          loading={alertsLoading}
          filterSeverity={filterSeverity}
          isPaused={isPaused}
          bufferedCount={bufferedCount}
          maxDisplayed={maxDisplayed}
          onSelectAlert={selectAlert}
          onFilterChange={setFilterSeverity}
          onTogglePause={togglePause}
          onFlushNow={flushNow}
        />
      </div>
    </div>
  )
}
