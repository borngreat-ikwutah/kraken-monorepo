import { Link } from "@tanstack/react-router"
import { 
  Lightning, 
  Check, 
  WarningCircle, 
  SlackLogo, 
  EnvelopeSimple, 
  Globe, 
  Cpu
} from "@phosphor-icons/react"
import { useAuth } from "../../auth/context/AuthContext"

export function LandingHero() {
  const { isAuthenticated } = useAuth()
  return (
    <section className="relative pt-12 pb-24 sm:pb-32 overflow-hidden bg-white">
      {/* Subtle Dot Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.45] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#d4d4d8 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Floating Cards Canvas Area */}
        <div className="relative max-w-5xl mx-auto pt-6 pb-12 flex flex-col items-center justify-center text-center">
          
          {/* Top Floating Sticky Note (Yellow) */}
          <div className="hidden lg:block absolute -top-4 left-0 w-56 p-4 rounded-xl bg-[#fef08a] shadow-lg shadow-amber-950/5 border border-amber-300/60 rotate-[-6deg] text-left transition-transform hover:rotate-0 duration-300">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mx-auto -mt-2 mb-2 shadow-xs ring-2 ring-white/60"></div>
            <p className="font-handwriting text-neutral-800 text-xs leading-snug font-medium font-serif italic">
              "Continuous threat isolation keeps our cloud infrastructure safe and compliant."
            </p>
          </div>

          {/* Floating White Tile - Verified Check Icon (Left) */}
          <div className="hidden md:flex absolute top-24 left-10 w-16 h-16 rounded-2xl bg-white shadow-xl shadow-neutral-900/10 border border-neutral-100 items-center justify-center -rotate-12 transition-transform hover:rotate-0 duration-300">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Check className="w-6 h-6" weight="bold" />
            </div>
          </div>

          {/* Floating Reminders / Incidents Card (Top Right) */}
          <div className="hidden md:block absolute -top-2 right-4 w-60 p-4 rounded-2xl bg-white/95 backdrop-blur-xs shadow-xl shadow-neutral-900/8 border border-neutral-100 rotate-[4deg] text-left transition-transform hover:rotate-0 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-800">SOC Alerts</span>
              <span className="text-[10px] text-neutral-400 font-medium">Auto-Triage</span>
            </div>
            <div className="mt-2.5 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <WarningCircle className="w-5 h-5" weight="fill" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-800">Port Scan Blocked</p>
                <p className="text-[10px] text-neutral-400">Threat Score 96% • 1m ago</p>
              </div>
            </div>
          </div>

          {/* Floating Timer / Latency Widget (Right) */}
          <div className="hidden lg:flex absolute top-24 right-16 w-14 h-14 rounded-2xl bg-white shadow-xl shadow-neutral-900/10 border border-neutral-100 items-center justify-center rotate-12 transition-transform hover:rotate-0 duration-300">
            <Lightning className="w-7 h-7 text-amber-500" weight="fill" />
          </div>

          {/* Floating Today's Tasks / Threat Pipeline (Bottom Left) */}
          <div className="hidden lg:block absolute -bottom-16 -left-6 w-64 p-4 rounded-2xl bg-white shadow-xl shadow-neutral-900/10 border border-neutral-100 rotate-[-3deg] text-left transition-transform hover:rotate-0 duration-300">
            <span className="text-xs font-bold text-neutral-800">Model Inference</span>
            <div className="mt-3 space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] font-medium text-neutral-700 mb-1">
                  <span>Isolation Forest</span>
                  <span className="text-blue-600 font-semibold">99.4%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="w-[99.4%] h-full bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-medium text-neutral-700 mb-1">
                  <span>Transformer NLP</span>
                  <span className="text-emerald-500 font-semibold">98.1%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="w-[98%] h-full bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Integrations Card (Bottom Right) */}
          <div className="hidden lg:block absolute -bottom-14 right-2 w-64 p-4 rounded-2xl bg-white shadow-xl shadow-neutral-900/10 border border-neutral-100 rotate-[3deg] text-left transition-transform hover:rotate-0 duration-300">
            <span className="text-xs font-bold text-neutral-800">100+ Security Feeds</span>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shadow-xs">
                <SlackLogo className="w-6 h-6 text-[#ECB22E]" weight="duotone" />
              </div>
              <div className="w-11 h-11 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shadow-xs">
                <EnvelopeSimple className="w-6 h-6 text-rose-500" weight="duotone" />
              </div>
              <div className="w-11 h-11 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shadow-xs">
                <Globe className="w-6 h-6 text-blue-500" weight="duotone" />
              </div>
              <div className="w-11 h-11 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shadow-xs">
                <Cpu className="w-6 h-6 text-neutral-700" weight="duotone" />
              </div>
            </div>
          </div>

          {/* Central 3D Style 4-Dot Badge */}
          <div className="mb-8 w-16 h-16 rounded-2xl bg-white shadow-2xl shadow-neutral-900/15 border border-neutral-100 flex items-center justify-center transition-transform hover:scale-105 duration-200">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <div className="w-3 h-3 rounded-full bg-neutral-900"></div>
              <div className="w-3 h-3 rounded-full bg-neutral-900"></div>
              <div className="w-3 h-3 rounded-full bg-neutral-900"></div>
            </div>
          </div>

          {/* Main Hero Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-neutral-950 tracking-tight leading-[1.08] max-w-3xl">
            Detect, analyze, and triage <br className="hidden sm:inline" />
            <span className="text-neutral-400 font-bold">all in one place</span>
          </h1>

          {/* Hero Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-neutral-500 max-w-xl font-normal leading-relaxed">
            Efficiently ingest security telemetry, detect threats with hybrid ML models, and protect your cloud infrastructure.
          </p>

          {/* Main Action Button */}
          <div className="mt-8">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-600/25 transition-all text-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get free demo"}
            </Link>
          </div>

        </div>

      </div>
    </section>
  )
}
