export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrderItemSchema } from "@/lib/schemas"


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    console.log("Adding item to order:", params.id, body)

    const validatedData = OrderItemSchema.parse(body)

    // Obtener la pieza con su material y settings
    const piece = await prisma.piece.findUnique({
      where: { id: validatedData.pieceId },
      include: { material: true },
    })

    if (!piece) {
      return NextResponse.json({ error: "Pieza no encontrada" }, { status: 404 })
    }

    // Si no se proporciona unitCost, calcularlo automáticamente
    let unitCost = validatedData.unitCost

    if (!unitCost) {
      // Obtener printers y settings para calcular el coste
      const [printers, settings] = await Promise.all([
        prisma.printer.findMany(),
        prisma.settings.findFirst(),
      ])

      const avgPrinterPower = printers.length > 0
        ? printers.reduce((sum, p) => sum + p.powerConsumption, 0) / printers.length
        : 300

      const electricityCostPerKwh = settings?.electricityCostPerKwh || 0.25

      // Calcular coste
      const materialCost = (piece.weight / 1000) * piece.material.costPerKg
      const printingHours = piece.estimatedTime / 3600 // segundos a horas
      const electricityCost = (avgPrinterPower / 1000) * printingHours * electricityCostPerKwh
      unitCost = materialCost + electricityCost
    }

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: params.id,
        pieceId: validatedData.pieceId,
        quantity: validatedData.quantity,
        unitCost: Math.round(unitCost * 100) / 100,
        unitPrice: validatedData.unitPrice,
      },
      include: { piece: true },
    })

    // Actualizar totales de la orden
    const items = await prisma.orderItem.findMany({
      where: { orderId: params.id },
    })

    let totalCost = 0
    let totalPrice = 0

    for (const item of items) {
      totalCost += item.unitCost * item.quantity
      totalPrice += item.unitPrice * item.quantity
    }

    await prisma.order.update({
      where: { id: params.id },
      data: { totalCost, totalPrice },
    })

    return NextResponse.json(orderItem, { status: 201 })
  } catch (error: any) {
    console.error("Error adding item:", error)
    return NextResponse.json(
      { error: error.message || "Error adding item" },
      { status: 400 }
    )
  }
}
