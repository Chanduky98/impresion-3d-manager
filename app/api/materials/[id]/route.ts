export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MaterialSchema } from "@/lib/schemas"


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const material = await prisma.material.findUnique({
      where: { id: params.id },
      include: { pieces: true },
    })
    if (!material) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(material)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching material" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = MaterialSchema.parse(body)
    const material = await prisma.material.update({
      where: { id: params.id },
      data: validatedData,
    })
    return NextResponse.json(material)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error updating material" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el material tiene piezas asociadas
    const material = await prisma.material.findUnique({
      where: { id: params.id },
      include: {
        pieces: {
          include: {
            printJobs: true,
            orderItems: true,
          },
        },
      },
    })

    if (!material) {
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
    }

    // Verificar si hay piezas con trabajos o pedidos activos
    let hasRestrictions = false
    for (const piece of material.pieces) {
      if (piece.printJobs.length > 0 || piece.orderItems.length > 0) {
        hasRestrictions = true
        break
      }
    }

    if (hasRestrictions) {
      return NextResponse.json(
        {
          error: "No se puede eliminar este material porque tiene piezas vinculadas a trabajos de impresión u órdenes de clientes.",
        },
        { status: 400 }
      )
    }

    // Eliminar piezas asociadas sin restricciones
    if (material.pieces.length > 0) {
      await prisma.piece.deleteMany({
        where: { materialId: params.id },
      })
    }

    // Eliminar el material
    await prisma.material.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting material:", error)
    return NextResponse.json(
      { error: error.message || "Error al eliminar el material" },
      { status: 400 }
    )
  }
}
