export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PieceSchema } from "@/lib/schemas"
import { validateSession } from "@/lib/auth"
import { withCORS } from "@/lib/middleware"


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

    const piece = await prisma.piece.findUnique({
      where: { id: params.id },
      include: { material: true },
    })
    if (!piece) return withCORS(NextResponse.json({ error: "Not found" }, { status: 404 }))
    return withCORS(NextResponse.json(piece))
  } catch (error) {
    return withCORS(NextResponse.json({ error: "Error fetching piece" }, { status: 500 }))
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

    const validatedData = PieceSchema.parse(body)

    // Convertir materialId a material relación para Prisma
    const { materialId, isPersonal, ...dataWithoutMaterialId } = validatedData as any
    const updateData: any = dataWithoutMaterialId

    if (materialId) {
      updateData.material = {
        connect: { id: materialId },
      }
    }

    // Agregar isPersonal si existe
    if (isPersonal !== undefined) {
      updateData.isPersonal = isPersonal
    }

    const piece = await prisma.piece.update({
      where: { id: params.id },
      data: updateData,
      include: { material: true },
    })
    return withCORS(NextResponse.json(piece))
  } catch (error: any) {
    return withCORS(
      NextResponse.json(
        {
          error: error.message || "Error updating piece",
        },
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

    const piece = await prisma.piece.delete({ where: { id: params.id } })

    return withCORS(NextResponse.json({ success: true }))
  } catch (error: any) {
    // Detectar si es un error de restricción de clave foránea
    let errorMessage = "Error al eliminar la pieza"
    if (error.code === "P2014" || error.message?.includes("Foreign key constraint")) {
      errorMessage = "No se puede eliminar esta pieza porque está vinculada a pedidos u trabajos de impresión activos. Marca la pieza como 'Descontinuada' en su lugar."
    }

    return withCORS(
      NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    )
  }
}
