import { Link } from "@tanstack/react-router"
import { ArrowRight } from "@phosphor-icons/react"
import { useAuth } from "../../auth/context/AuthContext"

export function LandingNavbar() {
  const { isAuthenticated } = useAuth()

  return (
    <header className="w-full bg-white border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <div className="grid grid-cols-2 gap-1 w-6 h-6">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900"></div>
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight text-neutral-900 font-sans">
            KrakenSec
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-neutral-600">
          <a href="#features" className="hover:text-neutral-950 transition-colors">
            Features
          </a>
          <a href="#solutions" className="hover:text-neutral-950 transition-colors">
            Solutions
          </a>
          <a href="#models" className="hover:text-neutral-950 transition-colors">
            ML Models
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-600/20 transition-all"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" weight="bold" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-neutral-700 hover:text-neutral-950 transition-colors hidden sm:inline-block"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-neutral-800 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 shadow-xs transition-all"
              >
                Get demo
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
