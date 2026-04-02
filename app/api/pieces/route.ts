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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.response

    const pieces = await prisma.piece.findMany({
      include: { material: true },
      orderBy: { createdAt: "desc" },
    })
    return withCORS(NextResponse.json(pieces))
  } catch (error) {
    return withCORS(
      NextResponse.json({ error: "Error fetching pieces" }, { status: 500 })
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.response

    const body = await request.json()
    const validatedData = PieceSchema.parse(body)

    // Convertir materialId a material relación para Prisma
    const { materialId, isPersonal, ...dataWithoutMaterialId } = validatedData as any
    const createData: any = dataWithoutMaterialId

    if (materialId) {
      createData.material = {
        connect: { id: materialId },
      }
    }

    // Agregar isPersonal si está presente
    if (isPersonal !== undefined) {
      createData.isPersonal = isPersonal
    }

    const piece = await prisma.piece.create({
      data: createData,
      include: { material: true },
    })
    return withCORS(NextResponse.json(piece, { status: 201 }))
  } catch (error: any) {
    return withCORS(
      NextResponse.json(
        { error: error.message || "Error creating piece" },
        { status: 400 }
      )
    )
  }
}
