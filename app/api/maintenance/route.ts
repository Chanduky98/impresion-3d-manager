export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { MaintenanceSchema } from "@/lib/schemas"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const maintenance = await prisma.maintenance.findMany({
      include: { printer: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(maintenance)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching maintenance" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = MaintenanceSchema.parse(body)

    const maintenance = await prisma.maintenance.create({
      data: {
        ...validatedData,
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : undefined,
      },
      include: { printer: true },
    })
    return NextResponse.json(maintenance, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error creating maintenance" },
      { status: 400 }
    )
  }
}
