import { useState } from "react"
import { Link, useRouterState, useRouter } from "@tanstack/react-router"
import { 
  Pulse, 
  Brain, 
  TerminalWindow, 
  ChartLineUp, 
  SignOut,
  Bell,
  MagnifyingGlass,
  Funnel,
  Export,
  User
} from "@phosphor-icons/react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { useAuth } from "../../auth/context/AuthContext"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const routerState = useRouterState()
  const router = useRouter()
  const currentPath = routerState.location.pathname
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = () => {
    logout()
    router.navigate({ to: "/login" })
  }

  const userInitials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "SA"

  const generalNavItems = [
    {
      to: "/dashboard/feed" as const,
      label: "Incident Triage",
      icon: Pulse,
      badge: "4"
    },
    {
      to: "/dashboard/models" as const,
      label: "ML Models",
      icon: Brain
    },
    {
      to: "/dashboard/simulator" as const,
      label: "Telemetry Ingestion",
      icon: TerminalWindow
    },
    {
      to: "/dashboard/metrics" as const,
      label: "SOC Analytics",
      icon: ChartLineUp
    }
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex antialiased">
      {/* Nexus-Style Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div>
          {/* Logo Header using the 4-Dot Brand Mark */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid grid-cols-2 gap-1 w-6 h-6">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-900"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-900"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-900"></div>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 font-sans">
                KrakenSec
              </span>
            </Link>
          </div>

          {/* Nav Section: GENERAL */}
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              General
            </div>

            {generalNavItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.to || (item.to === "/dashboard/feed" && currentPath === "/dashboard")

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} weight={isActive ? "bold" : "regular"} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {userInitials}
              </div>
              <div className="min-w-0 max-w-[120px]">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                  {user?.name || "SOC Analyst"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.organization || "Security Operator"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
              title="Logout"
            >
              <SignOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Nexus-Style Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          {/* Search Box */}
          <div className="relative w-72 sm:w-96">
            <MagnifyingGlass className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents, IPs, or threat models..." 
              className="pl-9 pr-12 text-xs bg-slate-50/70 border-slate-200 rounded-xl focus-visible:bg-white"
            />
            <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
              ⌘ + F
            </span>
          </div>

          {/* Right Tools & Profile */}
          <div className="flex items-center gap-3">
            <button type="button" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" weight="bold" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">SOC Operator</p>
                <p className="text-[10px] text-slate-400">Threat Intelligence</p>
              </div>
            </div>
          </div>
        </header>

        {/* Routed Page Content */}
        <main className="p-6 sm:p-8 flex-1">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Title & Filters Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Security Dashboard</h1>
                <p className="text-xs text-slate-500 mt-0.5">Real-time threat telemetry analysis & model inference</p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button variant="outline" size="sm" className="text-xs rounded-xl bg-white border-slate-200 text-slate-700 font-semibold gap-1.5 shadow-2xs">
                  <Funnel className="w-3.5 h-3.5 text-slate-400" />
                  <span>Filter</span>
                </Button>
                <Button variant="outline" size="sm" className="text-xs rounded-xl bg-white border-slate-200 text-slate-700 font-semibold gap-1.5 shadow-2xs">
                  <Export className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export</span>
                </Button>
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
