export interface User {
  id: number
  name: string
  email: string
  organization?: string
  role?: string
  created_at?: string
}

export interface AuthResponse {
  status: "success" | "error"
  message?: string
  token?: string
  user?: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  organization?: string
}
