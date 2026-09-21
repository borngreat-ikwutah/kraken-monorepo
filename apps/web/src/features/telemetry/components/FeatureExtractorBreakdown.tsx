import { Cpu, CheckCircle, WarningCircle } from "@phosphor-icons/react"
import { 
  Empty, 
  EmptyMedia, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription 
} from "@workspace/ui/components/empty"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"

interface FeatureExtractorBreakdownProps {
  features: Record<string, number | string | boolean>
}

export function FeatureExtractorBreakdown({ features }: FeatureExtractorBreakdownProps) {
  const entries = Object.entries(features)

  if (entries.length === 0) {
    return (
      <Card className="border-slate-200/80 bg-white shadow-xs rounded-2xl p-4">
        <Empty>
          <EmptyMedia variant="icon">
            <Cpu className="w-6 h-6 text-slate-400" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No Feature Vectors Extracted</EmptyTitle>
            <EmptyDescription>
              Submit an event payload to extract and inspect numerical feature vectors.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    )
  }

  const formatFeatureKey = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const formatFeatureValue = (val: number | string | boolean): string => {
    if (typeof val === "boolean") return val ? "True" : "False"
    if (typeof val === "number") {
      if (Number.isInteger(val)) return val.toString()
      return val.toFixed(3)
    }
    return String(val)
  }

  const isSuspiciousValue = (key: string, val: number | string | boolean): boolean => {
    if (typeof val === "number") {
      if (key.includes("entropy") && val > 3.8) return true
      if (key.includes("suspicious") && val > 0) return true
      if (key.includes("urgency") && val > 0.5) return true
      if (key.includes("keyword") && val > 0) return true
      if (key.includes("ip") && val > 0) return true
      if (key.includes("caps") && val > 0.15) return true
    }
    return false
  }

  return (
    <Card className="border-slate-200/80 bg-white shadow-xs rounded-2xl">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" weight="bold" />
            <span>Extracted Feature Vector ({entries.length} Signals)</span>
          </CardTitle>
          <span className="text-[10px] text-slate-500 font-medium">Preprocessed for ML Pipelines</span>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {entries.map(([key, val]) => {
            const suspicious = isSuspiciousValue(key, val)
            return (
              <div
                key={key}
                className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  suspicious
                    ? "bg-amber-50/60 border-amber-200/80"
                    : "bg-slate-50/70 border-slate-200/60"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-semibold text-slate-500 truncate" title={key}>
                    {formatFeatureKey(key)}
                  </span>
                  {suspicious ? (
                    <WarningCircle className="w-3 h-3 text-amber-600 shrink-0" weight="fill" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                </div>

                <div className="mt-1 flex items-baseline justify-between">
                  <span
                    className={`font-mono text-xs font-bold truncate ${
                      suspicious ? "text-amber-900 font-extrabold" : "text-slate-800"
                    }`}
                  >
                    {formatFeatureValue(val)}
                  </span>
                  {suspicious && (
                    <Badge className="bg-amber-200/60 text-amber-900 text-[9px] px-1 py-0 h-4 border-amber-300">
                      Signal
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
