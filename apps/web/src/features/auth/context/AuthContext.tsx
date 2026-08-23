import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import type { User, LoginPayload, RegisterPayload } from "../types/auth.types"
import { loginApi, registerApi, getMeApi } from "../api/authService"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<{ success: boolean; message?: string }>
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEFAULT_USER: User = {
  id: 1,
  name: "SOC Analyst",
  email: "analyst@krakensec.io",
  organization: "Threat Intelligence Lab",
  role: "ANALYST"
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_USER)
  const [token, setToken] = useState<string | null>("tok_demo_session")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const savedToken = localStorage.getItem("krakensec_auth_token")
    const savedUser = localStorage.getItem("krakensec_auth_user")

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        getMeApi(savedToken).then((fetchedUser) => {
          if (fetchedUser) {
            setUser(fetchedUser)
            localStorage.setItem("krakensec_auth_user", JSON.stringify(fetchedUser))
          }
        })
      } catch {
        // Use default
      }
    }
  }, [])

  const login = async (payload: LoginPayload): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)
    const res = await loginApi(payload)
    setIsLoading(false)

    if (res.status === "success" && res.user && res.token) {
      setUser(res.user)
      setToken(res.token)
      localStorage.setItem("krakensec_auth_token", res.token)
      localStorage.setItem("krakensec_auth_user", JSON.stringify(res.user))
      return { success: true }
    }

    return { success: false, message: res.message || "Failed to authenticate" }
  }

  const register = async (payload: RegisterPayload): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)
    const res = await registerApi(payload)
    setIsLoading(false)

    if (res.status === "success" && res.user && res.token) {
      setUser(res.user)
      setToken(res.token)
      localStorage.setItem("krakensec_auth_token", res.token)
      localStorage.setItem("krakensec_auth_user", JSON.stringify(res.user))
      return { success: true }
    }

    return { success: false, message: res.message || "Registration failed" }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("krakensec_auth_token")
    localStorage.removeItem("krakensec_auth_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
