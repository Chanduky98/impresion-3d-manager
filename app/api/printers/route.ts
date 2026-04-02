export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { PrinterSchema } from "@/lib/schemas"
import { validateSession } from "@/lib/auth"
import { withCORS } from "@/lib/middleware"

const prisma = new PrismaClient()

// Middleware para validar autenticación
async function requireAuth(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return {
      error: true,
      response: withCORS(
        NextResponse.json(
          { error: "No autorizado - Token requerido" },
          { status: 401 }
        )
      ),
    }
  }

  const user = await validateSession(token)

  if (!user) {
    return {
      error: true,
      response: withCORS(
        NextResponse.json(
          { error: "Token inválido o expirado" },
          { status: 401 }
        )
      ),
    }
  }

  return { error: false, user }
}

export async function OPTIONS() {
  return withCORS(NextResponse.json({}))
}

export async function GET(request: NextRequest) {
  try {
    // ✅ Validar autenticación
    const auth = await requireAuth(request)
    if (auth.error) return auth.response

    const printers = await prisma.printer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return withCORS(NextResponse.json(printers))
  } catch (error) {
    console.error("Error fetching printers:", error)
    return withCORS(
      NextResponse.json(
        { error: "Error fetching printers", details: String(error) },
        { status: 500 }
      )
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ Validar autenticación
    const auth = await requireAuth(request)
    if (auth.error) return auth.response

    const body = await request.json()
    const validatedData = PrinterSchema.parse(body)

    const printer = await prisma.printer.create({
      data: {
        ...validatedData,
        purchaseDate: validatedData.purchaseDate
          ? new Date(validatedData.purchaseDate)
          : undefined,
      },
    })

    return withCORS(NextResponse.json(printer, { status: 201 }))
  } catch (error: any) {
    console.error("Error creating printer:", error)
    return withCORS(
      NextResponse.json(
        { error: error.message || "Error creating printer" },
        { status: 400 }
      )
    )
  }
}
