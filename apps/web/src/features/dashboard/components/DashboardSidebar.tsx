import { Link, useRouterState, useRouter } from "@tanstack/react-router"
import { 
  Pulse, 
  Brain, 
  TerminalWindow, 
  ChartLineUp, 
  SignOut
} from "@phosphor-icons/react"
import { useAuth } from "../../auth/context/AuthContext"

interface DashboardSidebarProps {
  backendStatus: string
}

export function DashboardSidebar({ backendStatus }: DashboardSidebarProps) {
  const isOnline = backendStatus.toLowerCase().includes("healthy") || backendStatus.toLowerCase().includes("online")
  const routerState = useRouterState()
  const router = useRouter()
  const currentPath = routerState.location.pathname
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.navigate({ to: "/login" })
  }

  const userInitials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "SA"

  const navItems = [
    {
      to: "/dashboard/feed" as const,
      label: "Incident Triage",
      icon: Pulse,
      badge: "Live"
    },
    {
      to: "/dashboard/models" as const,
      label: "ML Threat Models",
      icon: Brain,
      tag: "Active"
    },
    {
      to: "/dashboard/simulator" as const,
      label: "Telemetry Ingestion",
      icon: TerminalWindow
    },
    {
      to: "/dashboard/metrics" as const,
      label: "Pipeline Analytics",
      icon: ChartLineUp
    }
  ]

  return (
    <aside className="w-64 bg-white border-r border-neutral-200/80 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Sidebar Header */}
      <div>
        <div className="h-16 px-6 border-b border-neutral-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <div className="w-2 h-2 rounded-full bg-neutral-900"></div>
              <div className="w-2 h-2 rounded-full bg-neutral-900"></div>
              <div className="w-2 h-2 rounded-full bg-neutral-900"></div>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-neutral-950 block leading-tight">
                KrakenSec
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">SOC Console</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Operations & Triage
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.to || (item.to === "/dashboard/feed" && currentPath === "/dashboard")

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-neutral-400"}`} weight={isActive ? "fill" : "regular"} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="h-4 px-1.5 text-[10px] font-bold rounded-full bg-blue-600 text-white flex items-center">
                    {item.badge}
                  </span>
                )}

                {item.tag && (
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    {item.tag}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-neutral-100 space-y-3">
        {/* Backend status pill */}
        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`} />
            <span className="text-neutral-600 font-medium">Pipeline:</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-neutral-800">{backendStatus}</span>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {userInitials}
            </div>
            <div className="min-w-0 max-w-[120px]">
              <p className="text-xs font-bold text-neutral-900 leading-tight truncate">
                {user?.name || "SOC Analyst"}
              </p>
              <p className="text-[10px] text-neutral-400 truncate">
                {user?.organization || user?.email || "School Demo Account"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            title="Logout"
          >
            <SignOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
