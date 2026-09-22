import { Card } from "@workspace/ui/components/card"
import type { TimeseriesDay } from "../../alerts/types/alert.types"

interface WeeklyThreatHistogramProps {
  total: number
  deltaLabel: string
  days: TimeseriesDay[]
}

export function WeeklyThreatHistogram({
  total,
  deltaLabel,
  days,
}: WeeklyThreatHistogramProps) {
  const maxCount = Math.max(...days.map((day) => day.count), 1)

  return (
    <Card className="flex flex-col rounded-2xl border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Weekly Threat Volume
          </p>
          <p className="mt-1 font-sans text-2xl font-extrabold text-slate-900">
            {total.toLocaleString()}
          </p>
        </div>
        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">
          {deltaLabel}
        </span>
      </div>

      <div className="relative mt-6 flex h-40 items-end gap-1.5">
        {/* Baseline gridlines keep the bars visually anchored */}
        {[25, 50, 75].map((offset) => (
          <span
            key={offset}
            aria-hidden="true"
            className="absolute inset-x-0 border-t border-dashed border-slate-100"
            style={{ bottom: `${offset}%` }}
          />
        ))}

        {days.map((day) => {
          const heightPct = Math.max((day.count / maxCount) * 100, 4)
          return (
            <div
              key={day.day}
              className="group flex h-full w-full flex-col items-center justify-end gap-1.5"
            >
              <span
                className={`font-mono text-[10px] ${
                  day.is_today ? "font-bold text-slate-700" : "text-slate-400"
                }`}
              >
                {day.count.toLocaleString()}
              </span>
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  title={`${day.day}${day.date ? ` (${day.date})` : ""}: ${day.count.toLocaleString()} events`}
                  className={`w-full max-w-[26px] rounded-t-md transition-all duration-500 ${
                    day.is_today
                      ? "bg-blue-600 group-hover:bg-blue-500"
                      : "bg-slate-200 group-hover:bg-blue-400"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span
                className={`text-[10px] ${
                  day.is_today ? "font-bold text-slate-900" : "text-slate-400"
                }`}
              >
                {day.day}
              </span>
            </div>
          )
        })}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
        <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
        Today
        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-slate-200" />
        Previous days
      </p>
    </Card>
  )
}
