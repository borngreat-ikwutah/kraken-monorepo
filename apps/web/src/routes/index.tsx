import { createFileRoute } from "@tanstack/react-router"
import { LandingPageView } from "../features/landing/components/LandingPageView"

export const Route = createFileRoute("/")({ component: HomePage })

function HomePage() {
  return <LandingPageView />
}
