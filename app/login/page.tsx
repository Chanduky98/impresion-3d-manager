"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks"
import { Button } from "@/components/Button"
import { FormField, Input } from "@/components/FormField"

export default function LoginPage() {
  const [email, setEmail] = useState("admin@impresion3d.local")
  const [password, setPassword] = useState("Chanduk11")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const router = useRouter()
  const { login, register } = useAuth()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (password.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres")
      }

      await register(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Error al registrarse")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">🖨️ Impresión 3D</h1>
          <p className="text-muted-foreground mt-2">
            {showRegister ? "Crear nueva cuenta" : "Inicia sesión"}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={showRegister ? handleRegister : handleLogin}
          className="bg-card rounded-lg border border-border p-8 space-y-6"
        >
          <FormField label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@impresion3d.local"
              required
            />
          </FormField>

          <FormField label="Contraseña">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={showRegister ? "Mínimo 8 caracteres" : "Tu contraseña"}
              required
            />
          </FormField>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading
              ? "Cargando..."
              : showRegister
              ? "Crear cuenta"
              : "Iniciar sesión"}
          </Button>
        </form>

        {/* Toggle register/login */}
        <div className="text-center">
          <p className="text-muted-foreground">
            {showRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
            <button
              onClick={() => setShowRegister(!showRegister)}
              className="text-primary hover:underline ml-2 font-semibold"
            >
              {showRegister ? "Inicia sesión" : "Regístrate"}
            </button>
          </p>
        </div>

        {/* Default credentials info */}
        {!showRegister && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-semibold mb-2">🔐 Credenciales de prueba:</p>
            <p>Email: <code className="bg-blue-100 px-1 rounded">admin@impresion3d.local</code></p>
            <p>Password: <code className="bg-blue-100 px-1 rounded">Chanduk11</code></p>
          </div>
        )}
      </div>
    </div>
  )
}
