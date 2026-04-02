import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail, verifyPassword, createSession } from "@/lib/auth"
import { withCORS } from "@/lib/middleware"

export async function OPTIONS() {
  return withCORS(NextResponse.json({}))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return withCORS(
        NextResponse.json(
          { error: "Email y contraseña requeridos" },
          { status: 400 }
        )
      )
    }

    const user = await getUserByEmail(email)

    if (!user || !user.active) {
      return withCORS(
        NextResponse.json(
          { error: "Credenciales inválidas" },
          { status: 401 }
        )
      )
    }

    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return withCORS(
        NextResponse.json(
          { error: "Credenciales inválidas" },
          { status: 401 }
        )
      )
    }

    const session = await createSession(user.id)

    return withCORS(
      NextResponse.json(
        {
          success: true,
          token: session.token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
        { status: 200 }
      )
    )
  } catch (error: any) {
    console.error("Error en login:", error)
    return withCORS(
      NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
    )
  }
}
