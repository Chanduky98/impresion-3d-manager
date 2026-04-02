export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { PrinterSchema } from "@/lib/schemas"
import { validateSession } from "@/lib/auth"
import { withCORS } from "@/lib/middleware"

const prisma = new PrismaClient()

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.response

    const printer = await prisma.printer.findUnique({
      where: { id: params.id },
    })

    if (!printer) {
      return withCORS(
        NextResponse.json(
          { error: "Printer not found" },
          { status: 404 }
        )
      )
    }

    return withCORS(NextResponse.json(printer))
  } catch (error) {
    console.error("Error fetching printer:", error)
    return withCORS(
      NextResponse.json(
        { error: "Error fetching printer", details: String(error) },
        { status: 500 }
      )
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.response

    const body = await request.json()
    const validatedData = PrinterSchema.parse(body)

    const printer = await prisma.printer.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        purchaseDate: validatedData.purchaseDate
          ? new Date(validatedData.purchaseDate)
          : undefined,
      },
    })

    return withCORS(NextResponse.json(printer))
  } catch (error: any) {
    console.error("Error updating printer:", error)
    return withCORS(
      NextResponse.json(
        { error: error.message || "Error updating printer" },
        { status: 400 }
      )
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.response

    await prisma.printer.delete({
      where: { id: params.id },
    })

    return withCORS(NextResponse.json({ success: true }))
  } catch (error: any) {
    console.error("Error deleting printer:", error)
    return withCORS(
      NextResponse.json(
        { error: error.message || "Error deleting printer" },
        { status: 400 }
      )
    )
  }
}
