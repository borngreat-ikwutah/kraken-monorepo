import { useState } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@workspace/ui/components/card"
import { ArrowRight, LockKey, EnvelopeSimple, User as UserIcon, Buildings, WarningCircle } from "@phosphor-icons/react"
import { useAuth } from "../context/AuthContext"

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [organization, setOrganization] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const res = await register({ name, email, password, organization })
    setLoading(false)

    if (res.success) {
      router.navigate({ to: "/dashboard/feed" })
    } else {
      setErrorMessage(res.message || "Failed to create account")
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12">
      {/* Subtle Dot Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg shadow-slate-900/10 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Create an account</h1>
          <p className="text-sm text-slate-500 mt-1">Get started with the KrakenSec SOC Platform</p>
        </div>

        {/* Register Card using shadcn */}
        <Card className="border-slate-200/80 shadow-xl shadow-slate-900/5 bg-white rounded-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">SOC Analyst Registration</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Setup your security operator credentials
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3.5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-medium">
                  <WarningCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-slate-700 font-bold">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Alex Mercer" 
                    className="pl-9 text-xs sm:text-sm rounded-xl bg-slate-50/50 border-slate-200"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="org" className="text-xs text-slate-700 font-bold">Organization / Team</Label>
                <div className="relative">
                  <Buildings className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input 
                    id="org" 
                    type="text" 
                    placeholder="Threat Intelligence Lab" 
                    className="pl-9 text-xs sm:text-sm rounded-xl bg-slate-50/50 border-slate-200"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-slate-700 font-bold">Work Email</Label>
                <div className="relative">
                  <EnvelopeSimple className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="analyst@krakensec.io" 
                    className="pl-9 text-xs sm:text-sm rounded-xl bg-slate-50/50 border-slate-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-slate-700 font-bold">Password</Label>
                <div className="relative">
                  <LockKey className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••••••" 
                    className="pl-9 text-xs sm:text-sm rounded-xl bg-slate-50/50 border-slate-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-600/20 py-2.5"
              >
                <span>{loading ? "Creating Account..." : "Create Account & Access SOC"}</span>
                <ArrowRight className="w-4 h-4 ml-1" weight="bold" />
              </Button>

              <p className="text-xs text-slate-500 text-center mt-2">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
