import { Outlet } from "@tanstack/react-router"
import { DashboardLayout } from "./DashboardLayout"

export function DashboardWrapper() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
