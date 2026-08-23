import { Link } from "@tanstack/react-router"

export function LandingFooter() {
  return (
    <footer className="border-t border-neutral-100 bg-white py-10 text-sm text-neutral-500 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-900"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-900"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-900"></div>
          </div>
          <span className="font-bold text-neutral-900">KrakenSec</span>
          <span className="text-neutral-400 text-xs ml-2">© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-neutral-500 font-medium">
          <Link to="/dashboard" className="hover:text-neutral-900 transition-colors">
            SOC Console
          </Link>
          <a href="#features" className="hover:text-neutral-900 transition-colors">
            Privacy Policy
          </a>
          <a href="#features" className="hover:text-neutral-900 transition-colors">
            Terms of Service
          </a>
        </div>

      </div>
    </footer>
  )
}
