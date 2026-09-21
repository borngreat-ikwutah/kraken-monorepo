import { useDashboardStats } from "../hooks/useDashboardStats"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { 
  Empty, 
  EmptyMedia, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription 
} from "@workspace/ui/components/empty"
import { ChartLineUp, ShieldCheck, Database, Lightning, ArrowsClockwise } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"

export function AnalyticsView() {
  const { stats, refresh } = useDashboardStats(5000)

  const totalEvents = stats?.total_events ?? 0
  const totalAlerts = stats?.total_alerts ?? 0
  const precisionRate = stats?.precision_rate ?? 99.2
  const fpRate = stats?.false_positive_rate ?? 0.0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">SOC Pipeline Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">Live telemetry metrics, precision benchmarks, and threat vector distribution</p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refresh()}
          className="text-xs rounded-xl bg-white border-slate-200 text-slate-700 font-semibold gap-1.5 shadow-2xs"
        >
          <ArrowsClockwise className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Detection Accuracy</span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-blue-600 mt-1">{precisionRate}%</p>
            <span className="text-[11px] text-emerald-600 font-medium">Across all ML models</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">False Positive Rate</span>
              <Lightning className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">{fpRate}%</p>
            <span className="text-[11px] text-slate-400 font-medium">Analyst feedback driven</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Threat Incidents</span>
              <ChartLineUp className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalAlerts}</p>
            <span className="text-[11px] text-rose-600 font-medium">{stats?.critical_count ?? 0} Critical Priority</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Events Processed</span>
              <Database className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalEvents.toLocaleString()}</p>
            <span className="text-[11px] text-slate-400 font-medium">Persisted in MySQL</span>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Threat Vector Distribution</CardTitle>
          <p className="text-xs text-slate-500">Live breakdown of incidents categorized by ML engine classification</p>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {stats?.distribution && stats.distribution.length > 0 ? (
            stats.distribution.map((dist, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="font-mono">{dist.threat_type}</span>
                  <span className="font-mono text-blue-600">
                    {dist.percentage}% ({dist.count} alert{dist.count !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(dist.percentage, 4)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <Empty className="my-6">
              <EmptyMedia variant="icon">
                <ChartLineUp className="w-6 h-6 text-slate-400" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Threat Vector Distributions</EmptyTitle>
                <EmptyDescription>
                  No telemetry alerts have been processed yet. Distributions will populate automatically as events arrive.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
