export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    console.log("Deleting order item:", params.itemId)

    await prisma.orderItem.delete({
      where: { id: params.itemId },
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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting item:", error)
    return NextResponse.json(
      { error: error.message || "Error deleting item" },
      { status: 400 }
    )
  }
}
