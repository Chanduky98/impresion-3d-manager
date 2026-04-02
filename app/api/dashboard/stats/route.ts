export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateSession } from "@/lib/auth"
import { withCORS } from "@/lib/middleware"
import {
  calculateOrderStats,
  calculateProfitabilityStats,
  identifyMostProfitablePieces,
  calculateClientStats,
} from "@/lib/calculations"


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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.response
    const settings = await prisma.settings.findFirst()
    const printers = await prisma.printer.findMany()
    const orders = await prisma.order.findMany({
      include: { items: { include: { piece: true, order: true } }, client: true },
    })
    const printJobs = await prisma.printJob.findMany({
      include: { printer: true, piece: { include: { material: true } } },
    })
    const clients = await prisma.client.findMany({ include: { orders: true } })
    const maintenances = await prisma.maintenance.findMany()
    const maintenancesCosts = maintenances.reduce((sum, m) => sum + m.cost, 0)

    // Estadísticas básicas
    const activePrinters = printers.filter((p) => p.status === "active").length
    const totalPrinters = printers.length

    // Órdenes
    const completedOrders = orders.filter(
      (o) => o.status === "completed" || o.status === "delivered"
    )
    const pendingOrders = orders.filter((o) => o.status === "pending")

    // Ingresos y costes
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0)
    const totalOrderCosts = completedOrders.reduce((sum, o) => sum + o.totalCost, 0)

    // Costes de impresoras
    const printersPurchaseCost = printers.reduce((sum, p) => sum + (p.purchaseCost || 0), 0)

    // Costes totales
    const totalCosts = totalOrderCosts + maintenancesCosts
    const totalProfitWithoutPrinters = totalRevenue - totalCosts
    const totalProfitWithPrinters = totalRevenue - (totalCosts + printersPurchaseCost)
    const profitMargin = totalRevenue > 0 ? (totalProfitWithPrinters / totalRevenue) * 100 : 0

    // Tiempo de impresión
    let totalPrintTime = printJobs.reduce((sum, job) => {
      if (job.actualDuration) return sum + job.actualDuration
      if (job.piece) return sum + job.piece.estimatedTime
      return sum
    }, 0)

    // También contar las piezas de órdenes completadas/entregadas
    const completedOrdersPrintTime = completedOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => {
        return itemSum + (item.piece.estimatedTime * item.quantity)
      }, 0)
    }, 0)

    totalPrintTime += completedOrdersPrintTime

    // Piezas más rentables
    const allOrderItems = orders.flatMap((o) => o.items)
    const profitablePieces = identifyMostProfitablePieces(
      allOrderItems.map((item) => ({
        piece: { name: item.piece.name },
        unitCost: item.unitCost,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      }))
    )

    // Estadísticas de clientes
    const clientStats = calculateClientStats(clients)
    const topClients = clientStats.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)

    // Órdenes por estado
    const ordersByStatus = {
      pending: orders.filter((o) => o.status === "pending").length,
      in_progress: orders.filter((o) => o.status === "in_progress").length,
      completed: orders.filter((o) => o.status === "completed").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    }

    // Print jobs por estado
    const jobsByStatus = {
      pending: printJobs.filter((j) => j.status === "pending").length,
      printing: printJobs.filter((j) => j.status === "printing").length,
      completed: printJobs.filter((j) => j.status === "completed").length,
      failed: printJobs.filter((j) => j.status === "failed").length,
    }

    return withCORS(
      NextResponse.json({
        printers: {
          total: totalPrinters,
          active: activePrinters,
          inactive: totalPrinters - activePrinters,
        },
        orders: {
          total: orders.length,
          completed: completedOrders.length,
          pending: pendingOrders.length,
          byStatus: ordersByStatus,
        },
        printJobs: {
          total: printJobs.length,
          byStatus: jobsByStatus,
        },
        financials: {
          totalRevenue,
          totalOrderCosts,
          maintenanceCosts: maintenancesCosts,
          printersCosts: printersPurchaseCost,
          totalCosts,
          totalProfit: totalProfitWithPrinters,
          profitMargin,
          averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        },
        printTime: {
          total: totalPrintTime,
          totalHours: Math.round((totalPrintTime / 3600) * 100) / 100,
        },
        profitablePieces: profitablePieces.slice(0, 5),
        topClients,
        settings: {
          electricityCostPerKwh: settings?.electricityCostPerKwh || 0.25,
          currencySymbol: settings?.currencySymbol || "€",
        },
      })
    )
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return withCORS(
      NextResponse.json({ error: "Error fetching stats" }, { status: 500 })
    )
  }
}
