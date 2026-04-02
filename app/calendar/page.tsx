"use client"

import { useEffect, useState } from "react"
import { Calendar, Package, Wrench } from "lucide-react"
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"

interface Event {
  id: string
  title: string
  date: Date
  type: "order" | "maintenance"
  status: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      const [ordersRes, maintenanceRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/maintenance"),
      ])

      const orders = await ordersRes.json()
      const maintenance = await maintenanceRes.json()

      const allEvents: Event[] = []

      // Agregar órdenes con fecha de entrega
      orders.forEach((order: any) => {
        if (order.deliveryDate) {
          allEvents.push({
            id: `order-${order.id}`,
            title: `Orden: ${order.orderNumber}`,
            date: new Date(order.deliveryDate),
            type: "order",
            status: order.status,
          })
        }
      })

      // Agregar mantenimientos programados
      maintenance.forEach((item: any) => {
        if (item.scheduledAt) {
          allEvents.push({
            id: `maint-${item.id}`,
            title: `Mantenimiento: ${item.printer.name}`,
            date: new Date(item.scheduledAt),
            type: "maintenance",
            status: item.status,
          })
        }
      })

      setEvents(allEvents)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Cargando...</div>

  const monthEvents = events.filter((e) => {
    const eventDate = new Date(e.date)
    return (
      eventDate.getMonth() === selectedMonth.getMonth() &&
      eventDate.getFullYear() === selectedMonth.getFullYear()
    )
  })

  // Agrupar eventos por fecha
  const eventsByDate = monthEvents.reduce(
    (acc, event) => {
      const dateStr = formatDate(event.date)
      if (!acc[dateStr]) acc[dateStr] = []
      acc[dateStr].push(event)
      return acc
    },
    {} as Record<string, Event[]>
  )

  const nextEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendario</h1>
        <p className="text-muted-foreground mt-1">Visualiza órdenes y mantenimientos programados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de eventos próximos */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Próximos Eventos</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {nextEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin eventos próximos</p>
              ) : (
                nextEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {event.type === "order" ? (
                        <Package className="w-4 h-4 mt-1 text-blue-500" />
                      ) : (
                        <Wrench className="w-4 h-4 mt-1 text-orange-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(event.date)}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(event.status)}`}
                        >
                          {getStatusLabel(event.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Vista de eventos por fecha */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {selectedMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setSelectedMonth(
                      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1)
                    )
                  }
                  className="px-3 py-1 text-sm border border-border rounded hover:bg-muted"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() =>
                    setSelectedMonth(
                      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1)
                    )
                  }
                  className="px-3 py-1 text-sm border border-border rounded hover:bg-muted"
                >
                  Siguiente →
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {Object.entries(eventsByDate).map(([date, dayEvents]) => (
                <div key={date} className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="font-semibold text-sm mb-2">{date}</h3>
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-2 p-2 rounded bg-muted/50"
                      >
                        {event.type === "order" ? (
                          <Package className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                        ) : (
                          <Wrench className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(event.status)}`}
                          >
                            {getStatusLabel(event.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {monthEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin eventos este mes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
