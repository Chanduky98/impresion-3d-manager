export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { SettingsSchema } from "@/lib/schemas"

const prisma = new PrismaClient()

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst()
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          electricityCostPerKwh: 0.25,
          currencySymbol: "€",
          defaultMarginPercent: 30,
        },
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = SettingsSchema.parse(body)

    let settings = await prisma.settings.findFirst()
    if (!settings) {
      settings = await prisma.settings.create({ data: validatedData })
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: validatedData,
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error updating settings" },
      { status: 400 }
    )
  }
}
