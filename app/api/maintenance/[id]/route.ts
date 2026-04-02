export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const maintenance = await prisma.maintenance.findUnique({
      where: { id: params.id },
      include: { printer: true },
    })
    if (!maintenance) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(maintenance)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching maintenance" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, cost, completedAt } = body

    const maintenance = await prisma.maintenance.update({
      where: { id: params.id },
      data: {
        status,
        cost,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      },
      include: { printer: true },
    })
    return NextResponse.json(maintenance)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error updating maintenance" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.maintenance.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error deleting maintenance" },
      { status: 400 }
    )
  }
}
