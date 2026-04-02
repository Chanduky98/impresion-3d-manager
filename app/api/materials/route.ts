import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { MaterialSchema } from "@/lib/schemas"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      include: { pieces: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(materials)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching materials" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = MaterialSchema.parse(body)
    const material = await prisma.material.create({ data: validatedData })
    return NextResponse.json(material, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error creating material" },
      { status: 400 }
    )
  }
}
