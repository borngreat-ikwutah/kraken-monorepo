import { createFileRoute } from "@tanstack/react-router"
import { SOCDashboardView } from "../features/dashboard/components/SOCDashboardView"

export const Route = createFileRoute("/")({ component: SOCDashboardPage })

function SOCDashboardPage() {
  return <SOCDashboardView />
}
