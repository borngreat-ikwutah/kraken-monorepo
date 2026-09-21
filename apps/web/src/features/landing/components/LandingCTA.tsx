import { Link } from "@tanstack/react-router"
import { useAuth } from "../../auth/context/AuthContext"

export function LandingCTA() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="py-24 bg-white border-t border-neutral-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <h2 className="text-3xl sm:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
          Ready to supercharge your threat detection?
        </h2>

        <p className="text-neutral-500 text-base sm:text-lg max-w-xl mx-auto mt-4 mb-8">
          Join security teams using KrakenSec to triage incidents 5x faster with machine learning.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="px-8 py-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-600/25 transition-all text-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get started with free demo"}
          </Link>
        </div>

      </div>
    </section>
  )
}
