import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { ClientSchema } from "@/lib/schemas"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: { orders: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ClientSchema.parse(body)
    const client = await prisma.client.create({ data: validatedData })
    return NextResponse.json(client, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error creating client" },
      { status: 400 }
    )
  }
}
