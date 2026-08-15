interface MetricCardsProps {
  totalAlerts: number
  criticalCount: number
  highCount: number
  mediumCount: number
}

export function MetricCards({ totalAlerts, criticalCount, highCount, mediumCount }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4">
        <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Total Alerts</p>
        <p className="text-2xl font-bold mt-2">{totalAlerts}</p>
      </div>
      <div className="bg-neutral-900/60 border border-red-900/30 rounded-lg p-4">
        <p className="text-xs text-red-400 font-medium uppercase tracking-wider">Critical Threat</p>
        <p className="text-2xl font-bold text-red-500 mt-2">{criticalCount}</p>
      </div>
      <div className="bg-neutral-900/60 border border-orange-900/30 rounded-lg p-4">
        <p className="text-xs text-orange-400 font-medium uppercase tracking-wider">High Threat</p>
        <p className="text-2xl font-bold text-orange-400 mt-2">{highCount}</p>
      </div>
      <div className="bg-neutral-900/60 border border-amber-900/30 rounded-lg p-4">
        <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">Medium Threat</p>
        <p className="text-2xl font-bold text-amber-400 mt-2">{mediumCount}</p>
      </div>
    </div>
  )
}
