"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Eye, X } from "lucide-react"
import { Button } from "@/components/Button"
import { Dialog } from "@/components/Dialog"
import { FormField, Input, Select, Textarea } from "@/components/FormField"
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"

interface Client {
  id: string
  name: string
}

interface Piece {
  id: string
  name: string
}

interface OrderItem {
  id: string
  pieceId: string
  piece: Piece
  quantity: number
  unitCost: number
  unitPrice: number
}

interface Order {
  id: string
  orderNumber: string
  client: Client
  status: string
  totalPrice: number
  totalCost: number
  deliveryDate?: Date
  createdAt: Date
  items: OrderItem[]
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [pieces, setPieces] = useState<Piece[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    clientId: "",
    status: "pending",
    deliveryDate: "",
    notes: "",
  })

  const [itemFormData, setItemFormData] = useState({
    pieceId: "",
    quantity: 1,
    unitPrice: 0,
  })

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchData()
  }, [router])

  async function fetchData() {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/login")
        return
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [ordersRes, clientsRes, piecesRes] = await Promise.all([
        fetch("/api/orders", { headers }),
        fetch("/api/clients", { headers }),
        fetch("/api/pieces", { headers }),
      ])

      if (ordersRes.status === 401 || clientsRes.status === 401 || piecesRes.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        router.push("/login")
        return
      }

      const ordersData = await ordersRes.json()
      const clientsData = await clientsRes.json()
      const piecesData = await piecesRes.json()

      setOrders(ordersData)
      setClients(clientsData)
      setPieces(piecesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveOrder() {
    try {
      if (!formData.clientId) {
        alert("Selecciona un cliente")
        return
      }

      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: formData.clientId,
          status: formData.status,
          deliveryDate: formData.deliveryDate || undefined,
          notes: formData.notes,
          items: [],
        }),
      })

      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        router.push("/login")
        return
      }

      if (!response.ok) {
        const error = await response.text()
        alert("Error al crear pedido: " + error)
        return
      }

      await fetchData()
      setDialogOpen(false)
      resetForm()
      alert("Pedido creado correctamente")
    } catch (error) {
      console.error("Error saving order:", error)
      alert("Error al crear el pedido")
    }
  }

  async function handleAddItem() {
    if (!selectedOrder || !itemFormData.pieceId) {
      alert("Selecciona una pieza")
      return
    }

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/orders/${selectedOrder.id}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pieceId: itemFormData.pieceId,
          quantity: parseInt(String(itemFormData.quantity)),
          unitPrice: parseFloat(String(itemFormData.unitPrice)),
        }),
      })

      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        router.push("/login")
        return
      }

      if (!response.ok) {
        const error = await response.text()
        alert("Error al agregar item: " + error)
        return
      }

      await fetchData()
      setAddItemDialogOpen(false)
      setItemFormData({ pieceId: "", quantity: 1, unitPrice: 0 })

      // Actualizar selectedOrder
      const updated = orders.find((o) => o.id === selectedOrder.id)
      if (updated) setSelectedOrder(updated)
    } catch (error) {
      console.error("Error adding item:", error)
      alert("Error al agregar item")
    }
  }

  async function handleDeleteItem(orderId: string, itemId: string) {
    if (!confirm("¿Eliminar este item del pedido?")) return

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/orders/${orderId}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        router.push("/login")
        return
      }

      if (!response.ok) {
        alert("Error al eliminar item")
        return
      }

      await fetchData()
      const updated = orders.find((o) => o.id === orderId)
      if (updated) setSelectedOrder(updated)
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm("¿Eliminar este pedido?")) {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          router.push("/login")
          return
        }

        const response = await fetch(`/api/orders/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 401) {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")
          router.push("/login")
          return
        }

        if (!response.ok) {
          const errorText = await response.text()
          try {
            const error = JSON.parse(errorText)
            alert("Error al eliminar:\n" + (error.error || errorText))
          } catch {
            alert("Error al eliminar:\n" + errorText)
          }
          return
        }

        await fetchData()
        alert("Pedido eliminado correctamente")
      } catch (error) {
        console.error("Error deleting order:", error)
        alert("Error al eliminar el pedido")
      }
    }
  }

  async function handleUpdateOrderStatus(orderId: string, newStatus: string) {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        router.push("/login")
        return
      }

      if (!response.ok) {
        alert("Error al actualizar el estado")
        return
      }

      await fetchData()
      if (selectedOrder) {
        const updated = orders.find((o) => o.id === selectedOrder.id)
        if (updated) setSelectedOrder({ ...updated, status: newStatus })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Error al actualizar el estado")
    }
  }

  function resetForm() {
    setFormData({
      clientId: "",
      status: "pending",
      deliveryDate: "",
      notes: "",
    })
  }

  function openViewDialog(order: Order) {
    setSelectedOrder(order)
    setViewDialogOpen(true)
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground mt-1">Gestión de órdenes de clientes</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-6 py-3 text-left text-sm font-semibold">Nº Orden</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Cliente</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Total (€)</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Coste (€)</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Entrega</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                  <td className="px-6 py-4">{order.client.name}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En progreso</option>
                      <option value="completed">Completado</option>
                      <option value="delivered">Entregado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(order.totalPrice, "€")}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(order.totalCost, "€")}</td>
                  <td className="px-6 py-4 text-sm">
                    {order.deliveryDate ? formatDate(order.deliveryDate) : "-"}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openViewDialog(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(order.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diálogo crear pedido */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Nuevo Pedido"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOrder}>Crear Pedido</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField label="Cliente" required>
            <Select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
            />
          </FormField>

          <FormField label="Estado">
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "pending", label: "Pendiente" },
                { value: "in_progress", label: "En progreso" },
                { value: "completed", label: "Completado" },
                { value: "delivered", label: "Entregado" },
                { value: "cancelled", label: "Cancelado" },
              ]}
            />
          </FormField>

          <FormField label="Fecha de Entrega">
            <Input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
            />
          </FormField>

          <FormField label="Notas">
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas del pedido"
              rows={3}
            />
          </FormField>
        </div>
      </Dialog>

      {/* Diálogo ver pedido */}
      {selectedOrder && (
        <Dialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          title={`Pedido ${selectedOrder.orderNumber}`}
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={() => setAddItemDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Pieza
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Cliente</p>
                <p className="font-semibold">{selectedOrder.client.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estado</p>
                <p className="font-semibold">{getStatusLabel(selectedOrder.status)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Coste</p>
                <p className="font-semibold">{formatCurrency(selectedOrder.totalCost, "€")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Precio</p>
                <p className="font-semibold">{formatCurrency(selectedOrder.totalPrice, "€")}</p>
              </div>
            </div>

            {selectedOrder.items.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-semibold">Piezas en el pedido</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-muted p-3 rounded">
                      <div>
                        <p className="font-medium">{item.piece.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity} | Coste: {formatCurrency(item.unitCost, "€")} | Precio:{" "}
                          {formatCurrency(item.unitPrice, "€")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteItem(selectedOrder.id, item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No hay piezas en este pedido</p>
            )}
          </div>
        </Dialog>
      )}

      {/* Diálogo agregar item */}
      {selectedOrder && (
        <Dialog
          open={addItemDialogOpen}
          onOpenChange={setAddItemDialogOpen}
          title="Agregar Pieza al Pedido"
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAddItemDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddItem}>Agregar</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <FormField label="Pieza" required>
              <Select
                value={itemFormData.pieceId}
                onChange={(e) => setItemFormData({ ...itemFormData, pieceId: e.target.value })}
                options={pieces.map((p) => ({ value: p.id, label: p.name }))}
              />
            </FormField>

            <FormField label="Cantidad" required>
              <Input
                type="number"
                value={itemFormData.quantity}
                onChange={(e) => setItemFormData({ ...itemFormData, quantity: parseInt(e.target.value) })}
                min="1"
              />
            </FormField>

            <FormField label="Precio Unitario (€)" required>
              <Input
                type="number"
                value={itemFormData.unitPrice}
                onChange={(e) => setItemFormData({ ...itemFormData, unitPrice: parseFloat(e.target.value) })}
                step="0.01"
              />
            </FormField>
          </div>
        </Dialog>
      )}
    </div>
  )
}
