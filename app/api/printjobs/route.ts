export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrintJobSchema } from "@/lib/schemas"


export async function GET() {
  try {
    const jobs = await prisma.printJob.findMany({
      include: { printer: true, piece: { include: { material: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(jobs)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching print jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = PrintJobSchema.parse(body)

    const job = await prisma.printJob.create({
      data: validatedData,
      include: { printer: true, piece: { include: { material: true } } },
    })
    return NextResponse.json(job, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error creating print job" },
      { status: 400 }
    )
  }
}
