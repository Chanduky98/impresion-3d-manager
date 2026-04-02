"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/Button"
import { Dialog } from "@/components/Dialog"
import { FormField, Input, Textarea } from "@/components/FormField"

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  city?: string
  _count?: { orders: number }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    notes: "",
  })

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    try {
      const response = await fetch("/api/clients")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      const url = editingId ? `/api/clients/${editingId}` : "/api/clients"
      const method = editingId ? "PUT" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        await fetchClients()
        setDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving client:", error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm("¿Eliminar este cliente?")) {
      try {
        const response = await fetch(`/api/clients/${id}`, { method: "DELETE" })
        console.log("Delete response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Delete error response:", errorText)
          try {
            const error = JSON.parse(errorText)
            alert("Error al eliminar:\n" + (error.error || errorText))
          } catch {
            alert("Error al eliminar:\n" + errorText)
          }
          return
        }

        await fetchClients()
        alert("Cliente eliminado correctamente")
      } catch (error) {
        console.error("Error deleting client:", error)
        alert("Error al eliminar el cliente")
      }
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
      notes: "",
    })
    setEditingId(null)
  }

  function openEditDialog(client: Client) {
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: "",
      city: client.city || "",
      zipCode: "",
      country: "",
      notes: "",
    })
    setEditingId(client.id)
    setDialogOpen(true)
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-1">Base de datos de clientes</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Teléfono</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Ciudad</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{client.name}</td>
                  <td className="px-6 py-4 text-sm">{client.email || "-"}</td>
                  <td className="px-6 py-4 text-sm">{client.phone || "-"}</td>
                  <td className="px-6 py-4 text-sm">{client.city || "-"}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(client)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(client.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingId ? "Editar Cliente" : "Nuevo Cliente"}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField label="Nombre" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre completo o empresa"
            />
          </FormField>

          <FormField label="Email">
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>

          <FormField label="Teléfono">
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </FormField>

          <FormField label="Dirección">
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </FormField>

          <FormField label="Ciudad">
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </FormField>

          <FormField label="Código Postal">
            <Input
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            />
          </FormField>

          <FormField label="País">
            <Input
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </FormField>

          <FormField label="Notas">
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional del cliente"
              rows={3}
            />
          </FormField>
        </div>
      </Dialog>
    </div>
  )
}
