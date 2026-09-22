import { Database, ArrowClockwise } from "@phosphor-icons/react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@workspace/ui/components/empty"
import type { TelemetryLogEntry } from "../types/ingest.types"

interface QueryHistoryTableProps {
  logs: TelemetryLogEntry[]
  total: number
  loading: boolean
  error: string | null
  onRefresh: () => void
}

function verdictStyle(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "bg-rose-600 text-white"
    case "HIGH":
      return "bg-amber-600 text-white"
    case "MEDIUM":
      return "bg-yellow-500 text-slate-900"
    case "LOW":
      return "bg-blue-100 text-blue-800"
    case "BENIGN":
      return "bg-emerald-600 text-white"
    default:
      return "bg-slate-200 text-slate-700"
  }
}

export function QueryHistoryTable({ logs, total, loading, error, onRefresh }: QueryHistoryTableProps) {
  return (
    <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            ({total}) Telemetry Logs
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Every check above is persisted as a telemetry event. Newest first.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="text-xs rounded-xl font-semibold gap-1.5 h-8 px-3"
        >
          <ArrowClockwise className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {loading && logs.length === 0 ? (
          <p className="text-sm text-slate-400 py-10 text-center">Loading saved queries…</p>
        ) : error && logs.length === 0 ? (
          <div className="p-4">
            <Empty className="my-4">
              <EmptyMedia variant="icon">
                <Database className="w-6 h-6 text-slate-400" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Couldn&apos;t load saved queries</EmptyTitle>
                <EmptyDescription>
                  {error} Make sure the backend is running on port 5000, then refresh.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-4">
            <Empty className="my-4">
              <EmptyMedia variant="icon">
                <Database className="w-6 h-6 text-slate-400" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No saved queries yet</EmptyTitle>
                <EmptyDescription>
                  Run a check above — it will be saved to the database and show up here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="px-4 py-2.5 font-semibold">Time</th>
                  <th className="px-4 py-2.5 font-semibold">Type</th>
                  <th className="px-4 py-2.5 font-semibold">What was checked</th>
                  <th className="px-4 py-2.5 font-semibold">Verdict</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Score</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Event / Alert</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((entry) => {
                  const severity = entry.alert?.severity ?? "BENIGN"
                  return (
                    <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap">
                        {entry.created_at ? new Date(entry.created_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                        {entry.event_type}
                      </td>
                      <td className="px-4 py-2.5 max-w-[320px]">
                        <span
                          className="block truncate font-mono text-slate-700"
                          title={entry.raw_payload}
                        >
                          {entry.raw_payload || "—"}
                        </span>
                        {entry.source_ip && (
                          <span className="block truncate font-mono text-[10px] text-slate-400">
                            {entry.source_ip}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <Badge className={`${verdictStyle(severity)} font-bold text-[10px]`}>
                          {severity}
                        </Badge>{" "}
                        <span className="text-slate-500">
                          {entry.prediction?.threat_label ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                        {entry.prediction === null
                          ? "—"
                          : `${Math.round(entry.prediction.score * 100)}%`}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-500 whitespace-nowrap">
                        #{entry.id}
                        {entry.alert ? ` / Alert #${entry.alert.id}` : ""}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
