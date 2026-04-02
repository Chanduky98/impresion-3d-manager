"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/Button"
import { Dialog } from "@/components/Dialog"
import { FormField, Input, Select, Textarea } from "@/components/FormField"
import { formatCurrency } from "@/lib/utils"

interface Material {
  id: string
  name: string
  costPerKg: number
}

interface Printer {
  id: string
  powerConsumption: number
}

interface PieceWithCosting {
  id: string
  name: string
  weight: number
  estimatedTime: number
  status: string
  material: Material
  description?: string
  customSellingPrice?: number
  materialCost?: number
  electricityCost?: number
  totalCost?: number
  sellingPrice?: number
  finalSellingPrice?: number
  margin?: number
}

export default function PiecesCostingPage() {
  const router = useRouter()
  const [pieces, setPieces] = useState<PieceWithCosting[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [settings, setSettings] = useState({ electricityCostPerKwh: 0.25, defaultMarginPercent: 30 })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weight: 10,
    estimatedTime: 60,
    materialId: "",
    status: "available",
    marginPercent: 30,
    customSellingPrice: "",
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

      const [piecesRes, materialsRes, printersRes, settingsRes] = await Promise.all([
        fetch("/api/pieces", { headers }),
        fetch("/api/materials", { headers }),
        fetch("/api/printers", { headers }),
        fetch("/api/settings", { headers }),
      ])

      if (piecesRes.status === 401 || materialsRes.status === 401 || printersRes.status === 401 || settingsRes.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        router.push("/login")
        return
      }

      const piecesData = await piecesRes.json()
      const materialsData = await materialsRes.json()
      const printersData = await printersRes.json()
      const settingsData = await settingsRes.json()

      setMaterials(materialsData)
      setPrinters(printersData)
      if (settingsData) {
        setSettings(settingsData)
      }

      // Calcular costes para cada pieza
      const piecesWithCosts = piecesData.map((piece: any) => {
        const material = materialsData.find((m: Material) => m.id === piece.materialId)
        const avgPrinterPower = printersData.length > 0
          ? printersData.reduce((sum: number, p: Printer) => sum + p.powerConsumption, 0) / printersData.length
          : 300

        const materialCost = material ? (piece.weight / 1000) * material.costPerKg : 0
        const printingHours = piece.estimatedTime / 3600 // estimatedTime está en segundos, convertir a horas
        const electricityCost = (avgPrinterPower / 1000) * printingHours * settings.electricityCostPerKwh
        const totalCost = materialCost + electricityCost

        const marginPercent = settings.defaultMarginPercent
        const sellingPrice = totalCost * (1 + marginPercent / 100)

        // Usar customSellingPrice si existe, si no usar el calculado
        const finalSellingPrice = piece.customSellingPrice || sellingPrice
        const margin = finalSellingPrice - totalCost

        return {
          ...piece,
          materialCost: Math.round(materialCost * 100) / 100,
          electricityCost: Math.round(electricityCost * 100) / 100,
          totalCost: Math.round(totalCost * 100) / 100,
          sellingPrice: Math.round(sellingPrice * 100) / 100,
          finalSellingPrice: Math.round(finalSellingPrice * 100) / 100,
          margin: Math.round(margin * 100) / 100,
        }
      })

      setPieces(piecesWithCosts)
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

      // Filtrar solo los campos válidos para la BD
      // estimatedTime en el formulario está en minutos, convertir a segundos para la BD
      const pieceData: any = {
        name: formData.name,
        weight: parseFloat(String(formData.weight)),
        estimatedTime: parseInt(String(formData.estimatedTime)) * 60, // minutos a segundos
        materialId: formData.materialId,
        status: formData.status,
      }

      // Agregar description solo si tiene valor
      if (formData.description && formData.description.trim()) {
        pieceData.description = formData.description
      }

      // Agregar customSellingPrice solo si tiene valor
      if (formData.customSellingPrice && formData.customSellingPrice.trim()) {
        pieceData.customSellingPrice = parseFloat(formData.customSellingPrice)
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
      materialId: "",
      status: "available",
      marginPercent: 30,
      customSellingPrice: "",
    })
    setEditingId(null)
  }

  function openEditDialog(piece: PieceWithCosting) {
    setFormData({
      name: piece.name,
      description: piece.description || "",
      weight: piece.weight,
      estimatedTime: piece.estimatedTime / 60, // convertir segundos a minutos para el formulario
      materialId: piece.material.id,
      status: piece.status,
      marginPercent: 30,
      customSellingPrice: piece.customSellingPrice ? piece.customSellingPrice.toString() : "",
    })
    setEditingId(piece.id)
    setDialogOpen(true)
  }

  // Calcular vista previa de costes en tiempo real
  const calculatePreview = () => {
    const material = materials.find((m) => m.id === formData.materialId)
    const avgPrinterPower = printers.length > 0
      ? printers.reduce((sum, p) => sum + p.powerConsumption, 0) / printers.length
      : 300

    const materialCost = material ? (formData.weight / 1000) * material.costPerKg : 0
    const printingHours = formData.estimatedTime / 60 // estimatedTime en formulario está en minutos, convertir a horas
    const electricityCost = (avgPrinterPower / 1000) * printingHours * settings.electricityCostPerKwh
    const totalCost = materialCost + electricityCost
    const marginPercent = formData.marginPercent || settings.defaultMarginPercent
    const sellingPrice = totalCost * (1 + marginPercent / 100)

    // Usar customSellingPrice si existe
    const finalSellingPrice = formData.customSellingPrice && formData.customSellingPrice.trim()
      ? parseFloat(formData.customSellingPrice)
      : sellingPrice

    return {
      materialCost: Math.round(materialCost * 100) / 100,
      electricityCost: Math.round(electricityCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      finalSellingPrice: Math.round(finalSellingPrice * 100) / 100,
    }
  }

  const preview = calculatePreview()

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Piezas con Costes</h1>
          <p className="text-muted-foreground mt-1">Gestión de piezas con cálculo automático de costes y márgenes</p>
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
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold">Material</th>
                <th className="px-4 py-3 text-right font-semibold">Peso (g)</th>
                <th className="px-4 py-3 text-right font-semibold">Tiempo (min)</th>
                <th className="px-4 py-3 text-right font-semibold">Coste Material</th>
                <th className="px-4 py-3 text-right font-semibold">Coste Electricidad</th>
                <th className="px-4 py-3 text-right font-semibold">Coste Total</th>
                <th className="px-4 py-3 text-right font-semibold">Precio Sugerido</th>
                <th className="px-4 py-3 text-right font-semibold">Precio Final Venta</th>
                <th className="px-4 py-3 text-right font-semibold">Margen</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pieces.map((piece) => (
                <tr key={piece.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{piece.name}</td>
                  <td className="px-4 py-3 text-sm">{piece.material.name}</td>
                  <td className="px-4 py-3 text-right">{piece.weight}</td>
                  <td className="px-4 py-3 text-right">{Math.round(piece.estimatedTime / 60)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(piece.materialCost || 0, "€")}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(piece.electricityCost || 0, "€")}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(piece.totalCost || 0, "€")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {formatCurrency(piece.sellingPrice || 0, "€")}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    {formatCurrency(piece.finalSellingPrice || 0, "€")}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">
                    {formatCurrency(piece.margin || 0, "€")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      piece.status === "available" ? "bg-green-100 text-green-800" :
                      piece.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                      piece.status === "completed" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {piece.status === "available" ? "Disponible" :
                       piece.status === "in_progress" ? "En proceso" :
                       piece.status === "completed" ? "Completada" :
                       "Descontinuada"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
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

          <FormField label="Margen de Beneficio (%)">
            <Input
              type="number"
              value={formData.marginPercent}
              onChange={(e) => setFormData({ ...formData, marginPercent: parseFloat(e.target.value) })}
              placeholder={`Ej: ${settings.defaultMarginPercent}`}
            />
          </FormField>

          <FormField label="Precio Final de Venta (€) (Opcional)">
            <Input
              type="number"
              value={formData.customSellingPrice}
              onChange={(e) => setFormData({ ...formData, customSellingPrice: e.target.value })}
              placeholder="Dejar en blanco para usar precio calculado"
              step="0.01"
            />
          </FormField>

          {/* Vista previa de costes */}
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <h3 className="font-semibold mb-3">Vista Previa de Costes</h3>
            <div className="flex justify-between">
              <span>Coste Material:</span>
              <span className="font-medium">{formatCurrency(preview.materialCost, "€")}</span>
            </div>
            <div className="flex justify-between">
              <span>Coste Electricidad:</span>
              <span className="font-medium">{formatCurrency(preview.electricityCost, "€")}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="font-semibold">Coste Total:</span>
              <span className="font-bold">{formatCurrency(preview.totalCost, "€")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="font-semibold">Precio Sugerido:</span>
              <span className="font-bold">{formatCurrency(preview.sellingPrice, "€")}</span>
            </div>
            <div className="flex justify-between text-green-600 border-t border-border pt-2 mt-2">
              <span className="font-semibold">Precio Final Venta:</span>
              <span className="font-bold">{formatCurrency(preview.finalSellingPrice, "€")}</span>
            </div>
          </div>

          <FormField label="Descripción">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción de la pieza"
              rows={3}
            />
          </FormField>
        </div>
      </Dialog>
    </div>
  )
}
