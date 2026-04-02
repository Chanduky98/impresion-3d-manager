"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/Button"
import { Dialog } from "@/components/Dialog"
import { FormField, Input, Textarea } from "@/components/FormField"
import { formatCurrency } from "@/lib/utils"

interface Material {
  id: string
  name: string
  type: string
  color?: string
  diameter?: number
  costPerKg: number
  stockKg?: number
  supplier?: string
  pieces?: Array<{ weight: number }>
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    color: "",
    diameter: "",
    supplier: "",
    costPerKg: 15,
    stockKg: "",
    density: 1.24,
    temperatureMin: 190,
    temperatureMax: 220,
    printSpeed: 50,
    notes: "",
  })

  useEffect(() => {
    fetchMaterials()
  }, [])

  async function fetchMaterials() {
    try {
      const response = await fetch("/api/materials")
      const data = await response.json()
      setMaterials(data)
    } catch (error) {
      console.error("Error fetching materials:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      const url = editingId ? `/api/materials/${editingId}` : "/api/materials"
      const method = editingId ? "PUT" : "POST"

      const materialData: any = {
        name: formData.name,
        type: formData.type,
        color: formData.color || undefined,
        costPerKg: parseFloat(String(formData.costPerKg)),
        supplier: formData.supplier || undefined,
        density: formData.density ? parseFloat(String(formData.density)) : undefined,
        temperatureMin: formData.temperatureMin ? parseInt(String(formData.temperatureMin)) : undefined,
        temperatureMax: formData.temperatureMax ? parseInt(String(formData.temperatureMax)) : undefined,
        printSpeed: formData.printSpeed ? parseInt(String(formData.printSpeed)) : undefined,
        notes: formData.notes || undefined,
      }

      // Agregar diameter solo si tiene valor
      if (formData.diameter && formData.diameter.trim()) {
        materialData.diameter = parseFloat(formData.diameter)
      }

      // Agregar stockKg solo si tiene valor
      if (formData.stockKg && formData.stockKg.trim()) {
        materialData.stockKg = parseFloat(formData.stockKg)
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(materialData),
      })

      if (!response.ok) {
        const error = await response.text()
        alert("Error al guardar: " + error)
        return
      }

      await fetchMaterials()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving material:", error)
      alert("Error al guardar el material")
    }
  }

  async function handleDelete(id: string) {
    if (confirm("¿Eliminar este material?")) {
      try {
        const response = await fetch(`/api/materials/${id}`, { method: "DELETE" })

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

        await fetchMaterials()
        alert("Material eliminado correctamente")
      } catch (error) {
        console.error("Error deleting material:", error)
        alert("Error al eliminar el material")
      }
    }
  }

  async function handleDuplicate(material: Material) {
    try {
      const duplicateData = {
        name: `${material.name} (Copia)`,
        type: material.type,
        color: material.color || undefined,
        diameter: material.diameter || undefined,
        costPerKg: material.costPerKg,
        supplier: material.supplier || undefined,
        density: 1.24,
        temperatureMin: 190,
        temperatureMax: 220,
        printSpeed: 50,
        notes: "",
      }

      const response = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicateData),
      })

      if (!response.ok) {
        alert("Error al duplicar el material")
        return
      }

      await fetchMaterials()
      alert("Material duplicado correctamente")
    } catch (error) {
      console.error("Error duplicating material:", error)
      alert("Error al duplicar el material")
    }
  }

  function toggleSelection(id: string) {
    const newSelected = new Set(selectedMaterials)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedMaterials(newSelected)
  }

  function toggleSelectAll() {
    if (selectedMaterials.size === materials.length) {
      setSelectedMaterials(new Set())
    } else {
      setSelectedMaterials(new Set(materials.map((m) => m.id)))
    }
  }

  const selectedTotal = materials
    .filter((m) => selectedMaterials.has(m.id))
    .reduce((sum, m) => sum + m.costPerKg, 0)

  function resetForm() {
    setFormData({
      name: "",
      type: "",
      color: "",
      diameter: "",
      supplier: "",
      costPerKg: 15,
      stockKg: "",
      density: 1.24,
      temperatureMin: 190,
      temperatureMax: 220,
      printSpeed: 50,
      notes: "",
    })
    setEditingId(null)
  }

  function openEditDialog(material: Material) {
    setFormData({
      name: material.name,
      type: material.type,
      color: material.color || "",
      diameter: material.diameter ? material.diameter.toString() : "",
      supplier: material.supplier || "",
      costPerKg: material.costPerKg,
      stockKg: material.stockKg ? material.stockKg.toString() : "",
      density: 1.24,
      temperatureMin: 190,
      temperatureMax: 220,
      printSpeed: 50,
      notes: "",
    })
    setEditingId(material.id)
    setDialogOpen(true)
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Materiales</h1>
          <p className="text-muted-foreground mt-1">Gestión de filamentos y resinas</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Material
        </Button>
      </div>

      {selectedMaterials.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-600">
                {selectedMaterials.size} material(es) seleccionado(s)
              </p>
              <p className="text-xl font-bold text-blue-900">
                Coste total: {formatCurrency(selectedTotal, "€")}/kg
              </p>
            </div>
            <Button variant="outline" onClick={() => setSelectedMaterials(new Set())}>
              Limpiar selección
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={selectedMaterials.size === materials.length && materials.length > 0}
                    onChange={toggleSelectAll}
                    title="Seleccionar todos"
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Tipo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Color</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Diámetro (mm)</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Stock (kg)</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Usado (kg)</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">% Utilizado</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Coste/kg</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Proveedor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {materials.map((material) => {
                const usedKg = (material.pieces?.reduce((sum, p) => sum + p.weight, 0) || 0) / 1000
                const percentageUsed = material.stockKg && material.stockKg > 0 ? (usedKg / material.stockKg) * 100 : 0

                return (
                  <tr
                    key={material.id}
                    className={`hover:bg-muted/50 transition-colors ${
                      selectedMaterials.has(material.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedMaterials.has(material.id)}
                        onChange={() => toggleSelection(material.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium">{material.name}</td>
                    <td className="px-6 py-4 text-sm">{material.type}</td>
                    <td className="px-6 py-4 text-sm">{material.color || "-"}</td>
                    <td className="px-6 py-4 text-sm">{material.diameter ? `${material.diameter}mm` : "-"}</td>
                    <td className="px-6 py-4 text-right font-medium">
                      {material.stockKg ? `${material.stockKg.toFixed(2)} kg` : "-"}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {usedKg > 0 ? `${usedKg.toFixed(2)} kg` : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {material.stockKg && material.stockKg > 0 ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-colors ${
                                percentageUsed > 80
                                  ? "bg-red-500"
                                  : percentageUsed > 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {percentageUsed.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatCurrency(material.costPerKg, "€")}/kg
                    </td>
                    <td className="px-6 py-4 text-sm">{material.supplier || "-"}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(material)} title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicate(material)}
                        title="Duplicar"
                      >
                        +
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(material.id)} title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingId ? "Editar Material" : "Nuevo Material"}
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
              placeholder="Ej: PLA Blanco"
            />
          </FormField>

          <FormField label="Tipo" required>
            <Input
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="Ej: PLA, ABS, PETG, Resina"
            />
          </FormField>

          <FormField label="Color">
            <Input
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Ej: Blanco"
            />
          </FormField>

          <FormField label="Diámetro (mm)">
            <Input
              type="number"
              value={formData.diameter}
              onChange={(e) => setFormData({ ...formData, diameter: e.target.value })}
              placeholder="Ej: 1.75, 2.85"
              step="0.01"
            />
          </FormField>

          <FormField label="Coste por kg (€)" required>
            <Input
              type="number"
              value={formData.costPerKg}
              onChange={(e) =>
                setFormData({ ...formData, costPerKg: parseFloat(e.target.value) })
              }
            />
          </FormField>

          <FormField label="Stock (kg)">
            <Input
              type="number"
              value={formData.stockKg}
              onChange={(e) => setFormData({ ...formData, stockKg: e.target.value })}
              placeholder="Ej: 5.5"
              step="0.01"
            />
          </FormField>

          <FormField label="Proveedor">
            <Input
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Ej: Amazon, Prusament"
            />
          </FormField>

          <FormField label="Notas">
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional"
              rows={3}
            />
          </FormField>
        </div>
      </Dialog>
    </div>
  )
}
