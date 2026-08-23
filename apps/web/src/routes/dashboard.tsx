import { createFileRoute, redirect } from "@tanstack/react-router"
import { DashboardWrapper } from "../features/dashboard/components/DashboardWrapper"

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
      throw redirect({ to: "/dashboard/feed" })
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  return <DashboardWrapper />
}
