export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { invalidateSession } from "@/lib/auth"
import { withCORS } from "@/lib/middleware"

export async function OPTIONS() {
  return withCORS(NextResponse.json({}))
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return withCORS(
        NextResponse.json(
          { error: "Token requerido" },
          { status: 400 }
        )
      )
    }

    await invalidateSession(token)

    return withCORS(
      NextResponse.json(
        { success: true, message: "Sesión cerrada" },
        { status: 200 }
      )
    )
  } catch (error: any) {
    console.error("Error en logout:", error)
    return withCORS(
      NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
    )
  }
}
