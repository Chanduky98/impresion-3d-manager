import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: string
  email: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Cargar token del localStorage al iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token")
    const savedUser = localStorage.getItem("auth_user")

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }

    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al iniciar sesión")
      }

      const data = await response.json()

      // Guardar token y usuario
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("auth_user", JSON.stringify(data.user))

      setToken(data.token)
      setUser(data.user)

      return data
    } catch (error: any) {
      throw new Error(error.message || "Error al iniciar sesión")
    }
  }

  async function logout() {
    try {
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }

      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")

      setToken(null)
      setUser(null)

      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  async function register(email: string, password: string) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al registrarse")
      }

      const data = await response.json()

      // Auto login después de registrarse
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("auth_user", JSON.stringify(data.user))

      setToken(data.token)
      setUser(data.user)

      return data
    } catch (error: any) {
      throw new Error(error.message || "Error al registrarse")
    }
  }

  return {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!token,
  }
}

/**
 * Hook para hacer fetch con autenticación automática
 */
export function useFetch() {
  const { token } = useAuth()

  async function fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    } as any

    // Agregar token si existe
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Si es 401, el token expiró
    if (response.status === 401) {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
      window.location.href = "/login"
      throw new Error("Sesión expirada")
    }

    return response
  }

  return { fetchWithAuth }
}
