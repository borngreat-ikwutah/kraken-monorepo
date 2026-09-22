import { Database, ArrowClockwise, MagnifyingGlass, CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (value: string) => void
  eventType: string
  onEventTypeChange: (value: string) => void
}

const EVENT_TYPE_OPTIONS = ["ALL", "url", "email", "network_flow"] as const

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

export function QueryHistoryTable({
  logs,
  total,
  loading,
  error,
  onRefresh,
  page,
  totalPages,
  onPageChange,
  search,
  onSearchChange,
  eventType,
  onEventTypeChange,
}: QueryHistoryTableProps) {
  const start = total === 0 ? 0 : (page - 1) * 10 + 1
  const end = Math.min(total, page * 10)

  return (
    <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
      <CardHeader className="pb-3 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            className="text-xs rounded-xl font-semibold gap-1.5 h-8 px-3 shrink-0"
          >
            <ArrowClockwise className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by payload text or IP…"
              className="pl-9 text-xs bg-slate-50/60 border-slate-200 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {EVENT_TYPE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onEventTypeChange(option)}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold whitespace-nowrap transition-all ${
                  eventType === option
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {option === "ALL" ? "All" : option}
              </button>
            ))}
          </div>
        </div>
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
                <EmptyTitle>No matching queries</EmptyTitle>
                <EmptyDescription>
                  {search || eventType !== "ALL"
                    ? "Try clearing the search or choosing a different type."
                    : "Run a check above — it will be saved to the database and show up here."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <>
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-500">
                Showing {start}–{end} of {total}
                {loading && " (updating…)"}
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => onPageChange(page - 1)}
                  className="h-8 px-2.5 rounded-lg text-xs font-semibold"
                >
                  <CaretLeft className="w-3.5 h-3.5" weight="bold" />
                  <span>Prev</span>
                </Button>
                <span className="text-[11px] font-mono text-slate-500 px-1">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => onPageChange(page + 1)}
                  className="h-8 px-2.5 rounded-lg text-xs font-semibold"
                >
                  <span>Next</span>
                  <CaretRight className="w-3.5 h-3.5" weight="bold" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
