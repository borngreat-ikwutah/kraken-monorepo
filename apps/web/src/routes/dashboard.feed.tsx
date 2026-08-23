import { createFileRoute } from "@tanstack/react-router"
import { TriageFeedView } from "../features/dashboard/components/TriageFeedView"

export const Route = createFileRoute("/dashboard/feed")({
  component: TriageFeedPage,
})

function TriageFeedPage() {
  return <TriageFeedView />
}
