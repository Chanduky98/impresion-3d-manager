import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { ClientSchema } from "@/lib/schemas"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: { orders: { include: { items: { include: { piece: true } } } } },
    })
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching client" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = ClientSchema.parse(body)
    const client = await prisma.client.update({
      where: { id: params.id },
      data: validatedData,
    })
    return NextResponse.json(client)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error updating client" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== DELETE /api/clients/[id] ===")
    console.log("Client ID:", params.id)

    const client = await prisma.client.delete({ where: { id: params.id } })
    console.log("Client deleted successfully:", client.name)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("=== DELETE ERROR ===")
    console.error("Error message:", error.message)
    console.error("Error code:", error.code)
    console.error("Full error:", error)

    // Detectar si es un error de restricción de clave foránea
    let errorMessage = "Error al eliminar el cliente"
    if (error.code === "P2014" || error.message?.includes("Foreign key constraint")) {
      errorMessage = "No se puede eliminar este cliente porque tiene pedidos asociados."
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
