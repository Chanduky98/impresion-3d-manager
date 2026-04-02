"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, CheckCircle, AlertCircle, Edit2 } from "lucide-react"
import { Button } from "@/components/Button"
import { Dialog } from "@/components/Dialog"
import { FormField, Input, Select, Textarea } from "@/components/FormField"
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from "@/lib/utils"

interface Maintenance {
  id: string
  printer: { id: string; name: string }
  type: string
  description: string
  cost: number
  status: string
  scheduledAt?: Date
  completedAt?: Date
}

interface Printer {
  id: string
  name: string
}

export default function MaintenancePage() {
  const router = useRouter()
  const [maintenance, setMaintenance] = useState<Maintenance[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    printerId: "",
    type: "cleaning",
    description: "",
    cost: 0,
    status: "pending",
    scheduledAt: "",
    notes: "",
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

      const [maintenanceRes, printersRes] = await Promise.all([
        fetch("/api/maintenance", { headers }),
        fetch("/api/printers", { headers }),
      ])

      if (maintenanceRes.status === 401 || printersRes.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        router.push("/login")
        return
      }

      const maintenanceData = await maintenanceRes.json()
      const printersData = await printersRes.json()

      setMaintenance(Array.isArray(maintenanceData) ? maintenanceData : [])
      setPrinters(Array.isArray(printersData) ? printersData : [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setMaintenance([])
      setPrinters([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/login")
        return
      }

      const url = editingId ? `/api/maintenance/${editingId}` : "/api/maintenance"
      const method = editingId ? "PUT" : "POST"
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        router.push("/login")
        return
      }

      if (response.ok) {
        await fetchData()
        setDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving maintenance:", error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm("¿Eliminar este registro de mantenimiento?")) {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          router.push("/login")
          return
        }

        const response = await fetch(`/api/maintenance/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 401) {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")
          router.push("/login")
          return
        }

        await fetchData()
      } catch (error) {
        console.error("Error deleting maintenance:", error)
      }
    }
  }

  function resetForm() {
    setFormData({
      printerId: "",
      type: "cleaning",
      description: "",
      cost: 0,
      status: "pending",
      scheduledAt: "",
      notes: "",
    })
    setEditingId(null)
  }

  function openEditDialog(item: Maintenance) {
    setFormData({
      printerId: item.printer.id,
      type: item.type,
      description: item.description,
      cost: item.cost,
      status: item.status,
      scheduledAt: item.scheduledAt ? item.scheduledAt.toString().split("T")[0] : "",
      notes: "",
    })
    setEditingId(item.id)
    setDialogOpen(true)
  }

  if (loading) return <div>Cargando...</div>

  const pending = maintenance.filter((m) => m.status === "pending")
  const completed = maintenance.filter((m) => m.status === "completed")

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Registros</p>
              <p className="text-2xl font-bold">{maintenance.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">{pending.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completados</p>
              <p className="text-2xl font-bold text-green-600">{completed.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mantenimiento</h1>
        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Registro
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-6 py-3 text-left text-sm font-semibold">Impresora</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Tipo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Descripción</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Coste (€)</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Programado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {maintenance.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{item.printer.name}</td>
                  <td className="px-6 py-4 text-sm">{item.type}</td>
                  <td className="px-6 py-4 text-sm">{item.description}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(item.cost, "€")}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.scheduledAt ? formatDate(item.scheduledAt) : "-"}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
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
        title={editingId ? "Editar Mantenimiento" : "Nuevo Registro de Mantenimiento"}
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
          <FormField label="Impresora" required>
            <Select
              value={formData.printerId}
              onChange={(e) => setFormData({ ...formData, printerId: e.target.value })}
              options={printers.map((p) => ({ value: p.id, label: p.name }))}
            />
          </FormField>

          <FormField label="Tipo de Mantenimiento" required>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: "cleaning", label: "Limpieza" },
                { value: "calibration", label: "Calibración" },
                { value: "repair", label: "Reparación" },
                { value: "nozzle_replacement", label: "Cambio de Boquilla" },
                { value: "bed_replacement", label: "Cambio de Cama" },
                { value: "other", label: "Otro" },
              ]}
            />
          </FormField>

          <FormField label="Descripción" required>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del mantenimiento"
              rows={3}
            />
          </FormField>

          <FormField label="Coste (€)">
            <Input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
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
              ]}
            />
          </FormField>

          <FormField label="Programado para">
            <Input
              type="date"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            />
          </FormField>
        </div>
      </Dialog>
    </div>
  )
}
