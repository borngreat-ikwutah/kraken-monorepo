import type { SeverityType } from "../types/alert.types"

interface SeverityBadgeProps {
  severity: SeverityType
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const getBadgeStyle = (sev: SeverityType) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "HIGH":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    }
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getBadgeStyle(severity)}`}>
      {severity}
    </span>
  )
}
