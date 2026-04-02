"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/Button"
import { Dialog } from "@/components/Dialog"
import { FormField, Input, Select, Textarea } from "@/components/FormField"
import { formatDuration } from "@/lib/utils"

interface Material {
  id: string
  name: string
}

interface Piece {
  id: string
  name: string
  weight: number
  estimatedTime: number
  quantity: number
  material: Material
  description?: string
}

export default function PiecesPage() {
  const router = useRouter()
  const [pieces, setPieces] = useState<Piece[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weight: 10,
    estimatedTime: 60,
    quantity: 1,
    materialId: "",
    status: "available",
    isPersonal: false,
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

      const [piecesRes, materialsRes] = await Promise.all([
        fetch("/api/pieces", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/materials", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (piecesRes.status === 401 || materialsRes.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        router.push("/login")
        return
      }

      setPieces(await piecesRes.json())
      setMaterials(await materialsRes.json())
    } catch (error) {
      console.error("Error fetching data:", error)
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

      const url = editingId ? `/api/pieces/${editingId}` : "/api/pieces"
      const method = editingId ? "PUT" : "POST"

      // Filtrar solo los campos válidos
      // estimatedTime en el formulario está en minutos, convertir a segundos para la BD
      const pieceData: any = {
        name: formData.name,
        weight: parseFloat(String(formData.weight)),
        estimatedTime: parseInt(String(formData.estimatedTime)) * 60, // minutos a segundos
        materialId: formData.materialId,
        status: formData.status,
        isPersonal: formData.isPersonal || false,
      }

      // Agregar description solo si tiene valor
      if (formData.description && formData.description.trim()) {
        pieceData.description = formData.description
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pieceData),
      })

      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        router.push("/login")
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Full response:", errorText)
        try {
          const error = JSON.parse(errorText)
          console.error("Parsed error:", error)
          alert("Error al guardar:\n" + (error.error || errorText))
        } catch {
          alert("Error al guardar:\n" + errorText)
        }
        return
      }

      await fetchData()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving piece:", error)
      alert("Error al guardar la pieza")
    }
  }

  async function handleDelete(id: string) {
    if (confirm("¿Eliminar esta pieza?")) {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          router.push("/login")
          return
        }

        const response = await fetch(`/api/pieces/${id}`, {
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
          alert("Error al eliminar: " + errorText)
          return
        }

        await fetchData()
        alert("Pieza eliminada correctamente")
      } catch (error) {
        console.error("Error deleting piece:", error)
        alert("Error al eliminar la pieza")
      }
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      weight: 10,
      estimatedTime: 60,
      quantity: 1,
      materialId: "",
      status: "available",
      isPersonal: false,
    })
    setEditingId(null)
  }

  function openEditDialog(piece: Piece) {
    setFormData({
      name: piece.name,
      description: piece.description || "",
      weight: piece.weight,
      estimatedTime: piece.estimatedTime / 60, // convertir segundos a minutos para el formulario
      quantity: piece.quantity,
      materialId: piece.material.id,
      status: (piece as any).status || "available",
      isPersonal: (piece as any).isPersonal || false,
    })
    setEditingId(piece.id)
    setDialogOpen(true)
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Piezas</h1>
          <p className="text-muted-foreground mt-1">Gestión de modelos 3D</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Pieza
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Material</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Peso (g)</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Tiempo Est.</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pieces.map((piece) => (
                <tr key={piece.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{piece.name} <span className="text-muted-foreground text-sm">x{piece.quantity}</span></td>
                  <td className="px-6 py-4">{piece.material.name}</td>
                  <td className="px-6 py-4">{piece.weight}</td>
                  <td className="px-6 py-4 text-sm">{Math.round(piece.estimatedTime / 60)} min</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (piece as any).status === "available" ? "bg-green-100 text-green-800" :
                      (piece as any).status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                      (piece as any).status === "completed" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {(piece as any).status === "available" ? "Disponible" :
                       (piece as any).status === "in_progress" ? "En proceso" :
                       (piece as any).status === "completed" ? "Completada" :
                       "Descontinuada"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(piece)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(piece.id)}>
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
        title={editingId ? "Editar Pieza" : "Nueva Pieza"}
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
              placeholder="Nombre de la pieza"
            />
          </FormField>

          <FormField label="Material" required>
            <Select
              value={formData.materialId}
              onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
              options={materials.map((m) => ({ value: m.id, label: m.name }))}
            />
          </FormField>

          <FormField label="Peso (gramos)" required>
            <Input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
            />
          </FormField>

          <FormField label="Tiempo Estimado (minutos)" required>
            <Input
              type="number"
              value={formData.estimatedTime}
              onChange={(e) =>
                setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })
              }
              placeholder="Ej: 80"
            />
          </FormField>

          <FormField label="Cantidad de Unidades" required>
            <Input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              placeholder="Ej: 100"
            />
          </FormField>

          <FormField label="Estado">
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "available", label: "Disponible" },
                { value: "in_progress", label: "En proceso" },
                { value: "completed", label: "Completada" },
                { value: "discontinued", label: "Descontinuada" },
              ]}
            />
          </FormField>

          <FormField label="Descripción">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción de la pieza"
              rows={3}
            />
          </FormField>

          <FormField label="Pieza Personal">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPersonal"
                checked={formData.isPersonal}
                onChange={(e) => setFormData({ ...formData, isPersonal: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isPersonal" className="text-sm">
                Esta es una pieza personal (precio venta 0€, pero calcula valor)
              </label>
            </div>
          </FormField>
        </div>
      </Dialog>
    </div>
  )
}
