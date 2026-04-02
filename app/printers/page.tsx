"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/Button"
import { Dialog } from "@/components/Dialog"
import { FormField, Input, Select, Textarea } from "@/components/FormField"
import { getStatusColor, getStatusLabel } from "@/lib/utils"

interface Printer {
  id: string
  name: string
  model: string
  manufacturer?: string
  status: string
  powerConsumption: number
  printAreaX: number
  printAreaY: number
  printAreaZ: number
  purchaseCost?: number
}

export default function PrintersPage() {
  const router = useRouter()
  const [printers, setPrinters] = useState<Printer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    manufacturer: "",
    status: "active",
    powerConsumption: 300,
    printAreaX: 200,
    printAreaY: 200,
    printAreaZ: 200,
    nozzleTemperature: 200,
    bedTemperature: 60,
    purchaseCost: "",
    description: "",
    notes: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchPrinters()
  }, [router])

  async function fetchPrinters() {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch("/api/printers", {
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

      if (!response.ok) {
        const error = await response.json()
        console.error("Error fetching printers:", error)
        setPrinters([])
        return
      }

      const data = await response.json()
      setPrinters(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching printers:", error)
      setPrinters([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      const url = editingId ? `/api/printers/${editingId}` : "/api/printers"
      const method = editingId ? "PUT" : "POST"

      const printerData: any = {
        name: formData.name,
        model: formData.model,
        manufacturer: formData.manufacturer || undefined,
        status: formData.status,
        powerConsumption: parseFloat(String(formData.powerConsumption)),
        printAreaX: parseFloat(String(formData.printAreaX)),
        printAreaY: parseFloat(String(formData.printAreaY)),
        printAreaZ: parseFloat(String(formData.printAreaZ)),
        nozzleTemperature: parseInt(String(formData.nozzleTemperature)),
        bedTemperature: parseInt(String(formData.bedTemperature)),
        description: formData.description || undefined,
        notes: formData.notes || undefined,
      }

      // Agregar purchaseCost si tiene valor
      if (formData.purchaseCost && formData.purchaseCost.trim()) {
        printerData.purchaseCost = parseFloat(formData.purchaseCost)
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(printerData),
      })

      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        window.location.href = "/login"
        return
      }

      if (response.ok) {
        await fetchPrinters()
        setDialogOpen(false)
        resetForm()
      } else {
        const error = await response.text()
        alert("Error al guardar: " + error)
      }
    } catch (error) {
      console.error("Error saving printer:", error)
      alert("Error al guardar la impresora")
    }
  }

  async function handleDelete(id: string) {
    if (confirm("¿Eliminar esta impresora?")) {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          window.location.href = "/login"
          return
        }

        const response = await fetch(`/api/printers/${id}`, {
          method: "DELETE",
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

        await fetchPrinters()
      } catch (error) {
        console.error("Error deleting printer:", error)
      }
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      model: "",
      manufacturer: "",
      status: "active",
      powerConsumption: 300,
      printAreaX: 200,
      printAreaY: 200,
      printAreaZ: 200,
      nozzleTemperature: 200,
      bedTemperature: 60,
      purchaseCost: "",
      description: "",
      notes: "",
    })
    setEditingId(null)
  }

  function openEditDialog(printer: any) {
    setFormData({
      name: printer.name,
      model: printer.model,
      manufacturer: printer.manufacturer || "",
      status: printer.status || "active",
      powerConsumption: printer.powerConsumption || 300,
      printAreaX: printer.printAreaX || 200,
      printAreaY: printer.printAreaY || 200,
      printAreaZ: printer.printAreaZ || 200,
      nozzleTemperature: printer.nozzleTemperature || 200,
      bedTemperature: printer.bedTemperature || 60,
      purchaseCost: printer.purchaseCost ? printer.purchaseCost.toString() : "",
      description: printer.description || "",
      notes: printer.notes || "",
    })
    setEditingId(printer.id)
    setDialogOpen(true)
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando impresoras...</p>
        </div>
      </div>
    )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Impresoras</h1>
          <p className="text-muted-foreground mt-1">Gestión de impresoras 3D</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Impresora
        </Button>
      </div>

      {printers.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">No hay impresoras registradas</p>
          <p className="text-sm text-muted-foreground">Crea una nueva impresora usando el botón "Nueva Impresora"</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Modelo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Fabricante</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Área de Impresión</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {printers.map((printer) => (
                  <tr key={printer.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{printer.name}</td>
                    <td className="px-6 py-4">{printer.model}</td>
                    <td className="px-6 py-4">{printer.manufacturer || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      {printer.printAreaX} × {printer.printAreaY} × {printer.printAreaZ} mm
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(printer.status)}`}>
                        {getStatusLabel(printer.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(printer)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(printer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingId ? "Editar Impresora" : "Nueva Impresora"}
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
              placeholder="Ej: Creality Ender 3 Pro"
            />
          </FormField>

          <FormField label="Modelo" required>
            <Input
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="Ej: Ender 3 Pro"
            />
          </FormField>

          <FormField label="Fabricante">
            <Input
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              placeholder="Ej: Creality"
            />
          </FormField>

          <FormField label="Estado">
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "active", label: "Activa" },
                { value: "inactive", label: "Inactiva" },
                { value: "maintenance", label: "Mantenimiento" },
              ]}
            />
          </FormField>

          <FormField label="Coste de Compra (€)">
            <Input
              type="number"
              value={formData.purchaseCost}
              onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
              placeholder="Ej: 299.99"
              step="0.01"
            />
          </FormField>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Área X (mm)">
              <Input
                type="number"
                value={formData.printAreaX}
                onChange={(e) =>
                  setFormData({ ...formData, printAreaX: parseFloat(e.target.value) })
                }
              />
            </FormField>
            <FormField label="Área Y (mm)">
              <Input
                type="number"
                value={formData.printAreaY}
                onChange={(e) =>
                  setFormData({ ...formData, printAreaY: parseFloat(e.target.value) })
                }
              />
            </FormField>
            <FormField label="Área Z (mm)">
              <Input
                type="number"
                value={formData.printAreaZ}
                onChange={(e) =>
                  setFormData({ ...formData, printAreaZ: parseFloat(e.target.value) })
                }
              />
            </FormField>
          </div>

          <FormField label="Consumo Eléctrico (W)">
            <Input
              type="number"
              value={formData.powerConsumption}
              onChange={(e) =>
                setFormData({ ...formData, powerConsumption: parseFloat(e.target.value) })
              }
            />
          </FormField>

          <FormField label="Notas">
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre la impresora..."
              rows={3}
            />
          </FormField>
        </div>
      </Dialog>
    </div>
  )
}
