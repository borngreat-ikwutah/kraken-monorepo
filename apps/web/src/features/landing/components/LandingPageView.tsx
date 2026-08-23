import { LandingNavbar } from "./LandingNavbar"
import { LandingHero } from "./LandingHero"
import { LandingFeatures } from "./LandingFeatures"
import { LandingCTA } from "./LandingCTA"
import { LandingFooter } from "./LandingFooter"

export function LandingPageView() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-blue-600 selection:text-white">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
