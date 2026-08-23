import { createFileRoute } from "@tanstack/react-router"
import { AnalyticsView } from "../features/dashboard/components/AnalyticsView"

export const Route = createFileRoute("/dashboard/metrics")({
  component: AnalyticsPage,
})

function AnalyticsPage() {
  return <AnalyticsView />
}
