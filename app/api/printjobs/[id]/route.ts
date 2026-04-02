export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.printJob.findUnique({
      where: { id: params.id },
      include: { printer: true, piece: { include: { material: true } } },
    })
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching print job" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, startTime, endTime, actualDuration, success, notes } = body

    const job = await prisma.printJob.update({
      where: { id: params.id },
      data: {
        status,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        actualDuration,
        success,
        notes,
      },
      include: { printer: true, piece: { include: { material: true } } },
    })
    return NextResponse.json(job)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error updating print job" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.printJob.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error deleting print job" },
      { status: 400 }
    )
  }
}
