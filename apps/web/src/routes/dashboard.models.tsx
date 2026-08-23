import { createFileRoute } from "@tanstack/react-router"
import { ModelsView } from "../features/dashboard/components/ModelsView"

export const Route = createFileRoute("/dashboard/models")({
  component: ModelsPage,
})

function ModelsPage() {
  return <ModelsView />
}
