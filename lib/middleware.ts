import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "./auth"

export interface AuthenticatedRequest extends NextRequest {
  user?: any
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest) => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        { error: "No autorizado - Token requerido" },
        { status: 401 }
      )
    }

    const user = await validateSession(token)

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      )
    }

    req.user = user
    return handler(req)
  }
}

// Middleware para verificar rol admin
export async function withAdminAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest) => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        { error: "No autorizado - Token requerido" },
        { status: 401 }
      )
    }

    const user = await validateSession(token)

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      )
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Acceso denegado - Solo administradores" },
        { status: 403 }
      )
    }

    req.user = user
    return handler(req)
  }
}

// CORS seguro
export function withCORS(response: NextResponse) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ]
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  response.headers.set("Access-Control-Allow-Origin", origin)
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  )
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )
  response.headers.set("Access-Control-Allow-Credentials", "true")

  return response
}
