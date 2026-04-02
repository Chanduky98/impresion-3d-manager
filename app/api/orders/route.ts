export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { OrderSchema } from "@/lib/schemas"
import { generateOrderNumber } from "@/lib/utils"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { client: true, items: { include: { piece: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = OrderSchema.parse(body)
    const { items = [], ...orderData } = validatedData

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        ...orderData,
        deliveryDate: orderData.deliveryDate ? new Date(orderData.deliveryDate) : undefined,
        items: {
          create: items,
        },
      },
      include: { client: true, items: { include: { piece: true } } },
    })

    // Calcular totales
    const totalCost = items.reduce((sum, item) => sum + (item.unitCost || 0) * item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0)

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { totalCost, totalPrice },
      include: { client: true, items: { include: { piece: true } } },
    })

    return NextResponse.json(updated, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error creating order" },
      { status: 400 }
    )
  }
}
