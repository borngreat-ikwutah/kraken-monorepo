import { createFileRoute } from "@tanstack/react-router"
import { IngestionSandboxView } from "../features/dashboard/components/IngestionSandboxView"

export const Route = createFileRoute("/dashboard/simulator")({
  component: SimulatorPage,
})

function SimulatorPage() {
  return <IngestionSandboxView />
}
