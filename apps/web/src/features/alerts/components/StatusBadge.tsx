import type { StatusType } from "../types/alert.types"

interface StatusBadgeProps {
  status: StatusType
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeStyle = (st: StatusType) => {
    switch (st) {
      case "NEW":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "ACKNOWLEDGED":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "FALSE_POSITIVE":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
      default:
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
    }
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getBadgeStyle(status)}`}>
      {status}
    </span>
  )
}
