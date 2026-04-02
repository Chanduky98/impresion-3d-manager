import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { client: true, items: { include: { piece: { include: { material: true } } } } },
    })
    if (!order) return withCORS(NextResponse.json({ error: "Not found" }, { status: 404 }))
    return withCORS(NextResponse.json(order))
  } catch (error) {
    return withCORS(NextResponse.json({ error: "Error fetching order" }, { status: 500 }))
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
    const { status, marginPercent, deliveryDate } = body

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        marginPercent,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      },
      include: { client: true, items: { include: { piece: true } } },
    })
    return withCORS(NextResponse.json(order))
  } catch (error: any) {
    return withCORS(
      NextResponse.json(
        { error: error.message || "Error updating order" },
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

    await prisma.orderItem.deleteMany({ where: { orderId: params.id } })
    await prisma.order.delete({ where: { id: params.id } })
    return withCORS(NextResponse.json({ success: true }))
  } catch (error: any) {
    return withCORS(
      NextResponse.json(
        { error: error.message || "Error deleting order" },
        { status: 400 }
      )
    )
  }
}
