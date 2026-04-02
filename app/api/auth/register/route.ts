export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/auth"
import { withCORS } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"


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

    if (password.length < 8) {
      return withCORS(
        NextResponse.json(
          { error: "La contraseña debe tener al menos 8 caracteres" },
          { status: 400 }
        )
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return withCORS(
        NextResponse.json(
          { error: "El usuario ya existe" },
          { status: 400 }
        )
      )
    }

    // Verificar si hay usuarios en la BD
    const userCount = await prisma.user.count()
    const role = userCount === 0 ? "admin" : "user" // El primer usuario es admin

    const user = await createUser(email, password, role)

    return withCORS(
      NextResponse.json(
        {
          success: true,
          message: userCount === 0 ? "Admin creado correctamente" : "Usuario creado correctamente",
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
        { status: 201 }
      )
    )
  } catch (error: any) {
    console.error("Error en registro:", error)
    return withCORS(
      NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
    )
  }
}
