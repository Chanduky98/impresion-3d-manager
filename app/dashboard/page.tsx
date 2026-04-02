"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/StatsCard"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Printer,
  DollarSign,
  Zap,
  TrendingUp,
  Clock,
  Package,
  AlertCircle,
} from "lucide-react"
import { formatCurrency, formatDuration } from "@/lib/utils"

interface DashboardStats {
  printers: {
    total: number
    active: number
    inactive: number
  }
  orders: {
    total: number
    completed: number
    pending: number
    byStatus: Record<string, number>
  }
  printJobs: {
    total: number
    byStatus: Record<string, number>
  }
  financials: {
    totalRevenue: number
    totalOrderCosts: number
    maintenanceCosts: number
    printersCosts: number
    totalCosts: number
    totalProfit: number
    profitMargin: number
    averageOrderValue: number
  }
  printTime: {
    total: number
    totalHours: number
  }
  profitablePieces: Array<{
    name: string
    totalProfit: number
    profitMargin: number
  }>
  topClients: Array<{
    name: string
    totalSpent: number
    totalOrders: number
  }>
  settings: {
    electricityCostPerKwh: number
    currencySymbol: string
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()

    // Refrescar datos cada 10 segundos
    const interval = setInterval(fetchStats, 10000)

    return () => clearInterval(interval)
  }, [])

  async function fetchStats() {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        window.location.href = "/login"
        return
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return <div className="text-center py-8">Cargando...</div>
  }

  const currencySymbol = stats.settings.currencySymbol

  // Datos para gráfico de órdenes
  const ordersChartData = [
    { name: "Pendientes", value: stats.orders.byStatus.pending },
    { name: "En Progreso", value: stats.orders.byStatus.in_progress },
    { name: "Completadas", value: stats.orders.byStatus.completed },
    { name: "Entregadas", value: stats.orders.byStatus.delivered },
  ]

  const COLORS = ["#f59e0b", "#8b5cf6", "#3b82f6", "#10b981"]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen de actividad e indicadores</p>
      </div>

      {/* Stats Cards - Primera fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Ingresos Totales"
          value={formatCurrency(stats.financials.totalRevenue, currencySymbol)}
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: stats.financials.profitMargin, direction: "up" }}
        />
        <StatsCard
          title="Beneficio"
          value={formatCurrency(stats.financials.totalProfit, currencySymbol)}
          icon={<TrendingUp className="w-6 h-6" />}
          valueClassName={stats.financials.totalProfit > 0 ? "text-green-600" : "text-red-600"}
        />
        <StatsCard
          title="Impresoras Activas"
          value={`${stats.printers.active}/${stats.printers.total}`}
          icon={<Printer className="w-6 h-6" />}
        />
        <StatsCard
          title="Horas de Impresión"
          value={stats.printTime.totalHours.toFixed(1)}
          icon={<Clock className="w-6 h-6" />}
        />
      </div>

      {/* Stats Cards - Segunda fila: Desglose de Costes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Coste de Órdenes"
          value={formatCurrency(stats.financials.totalOrderCosts, currencySymbol)}
          icon={<Package className="w-6 h-6" />}
          valueClassName="text-orange-600"
        />
        <StatsCard
          title="Coste de Mantenimiento"
          value={formatCurrency(stats.financials.maintenanceCosts, currencySymbol)}
          icon={<Zap className="w-6 h-6" />}
          valueClassName="text-orange-600"
        />
        <StatsCard
          title="Coste de Impresoras"
          value={formatCurrency(stats.financials.printersCosts, currencySymbol)}
          icon={<Printer className="w-6 h-6" />}
          valueClassName="text-orange-600"
        />
        <StatsCard
          title="Coste Total"
          value={formatCurrency(stats.financials.totalCosts, currencySymbol)}
          icon={<AlertCircle className="w-6 h-6" />}
          valueClassName="text-red-600"
        />
      </div>

      {/* Stats Cards - Tercera fila */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Órdenes Completadas"
          value={stats.orders.completed}
          icon={<Package className="w-6 h-6" />}
        />
        <StatsCard
          title="Órdenes Pendientes"
          value={stats.orders.pending}
          icon={<AlertCircle className="w-6 h-6" />}
        />
        <StatsCard
          title="Valor Promedio por Orden"
          value={formatCurrency(
            stats.financials.averageOrderValue,
            currencySymbol
          )}
          icon={<Zap className="w-6 h-6" />}
        />
      </div>

      {/* Órdenes por Estado - Cards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Órdenes por Estado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <p className="text-amber-600 text-sm font-medium">Pendientes</p>
            <p className="text-4xl font-bold text-amber-700 mt-2">{stats.orders.byStatus.pending}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
            <p className="text-purple-600 text-sm font-medium">En Progreso</p>
            <p className="text-4xl font-bold text-purple-700 mt-2">{stats.orders.byStatus.in_progress}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-600 text-sm font-medium">Completadas</p>
            <p className="text-4xl font-bold text-blue-700 mt-2">{stats.orders.byStatus.completed}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-green-600 text-sm font-medium">Entregadas</p>
            <p className="text-4xl font-bold text-green-700 mt-2">{stats.orders.byStatus.delivered}</p>
          </div>
        </div>
      </div>

      {/* Piezas Más Rentables - Tabla */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Piezas Más Rentables</h3>
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {stats.profitablePieces.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left py-3 px-4 font-semibold">Ranking</th>
                    <th className="text-left py-3 px-4 font-semibold">Pieza</th>
                    <th className="text-right py-3 px-4 font-semibold">Beneficio</th>
                    <th className="text-right py-3 px-4 font-semibold">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.profitablePieces.map((piece, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{piece.name}</td>
                      <td className="text-right py-3 px-4 font-semibold text-green-600">
                        {formatCurrency(piece.totalProfit, currencySymbol)}
                      </td>
                      <td className="text-right py-3 px-4 text-blue-600">
                        {piece.profitMargin.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No hay datos de piezas rentables aún
            </div>
          )}
        </div>
      </div>

      {/* Tabla de clientes top */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Top Clientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                <th className="text-right py-3 px-4 font-semibold">Órdenes</th>
                <th className="text-right py-3 px-4 font-semibold">Total Gastado</th>
              </tr>
            </thead>
            <tbody>
              {stats.topClients.map((client, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted">
                  <td className="py-3 px-4">{client.name}</td>
                  <td className="text-right py-3 px-4">{client.totalOrders}</td>
                  <td className="text-right py-3 px-4 font-semibold">
                    {formatCurrency(client.totalSpent, currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
