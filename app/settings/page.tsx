"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/Button"
import { FormField, Input } from "@/components/FormField"
import { formatCurrency } from "@/lib/utils"

interface Settings {
  id: string
  electricityCostPerKwh: number
  currencySymbol: string
  defaultMarginPercent: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    electricityCostPerKwh: 0.25,
    currencySymbol: "€",
    defaultMarginPercent: 30,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()
      setSettings(data)
      setFormData({
        electricityCostPerKwh: data.electricityCostPerKwh,
        currencySymbol: data.currencySymbol,
        defaultMarginPercent: data.defaultMarginPercent,
      })
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        alert("Configuración guardada correctamente")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error al guardar la configuración")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-1">Ajustes generales de la aplicación</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuración de costes */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-6">Parámetros de Costes</h2>

          <FormField label="Coste de Electricidad (€/kWh)" required>
            <Input
              type="number"
              step="0.01"
              value={formData.electricityCostPerKwh}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  electricityCostPerKwh: parseFloat(e.target.value),
                })
              }
            />
          </FormField>

          <FormField label="Moneda" required>
            <Input
              maxLength={3}
              value={formData.currencySymbol}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currencySymbol: e.target.value,
                })
              }
            />
          </FormField>

          <FormField label="Margen de Beneficio por Defecto (%)" required>
            <Input
              type="number"
              step="0.1"
              value={formData.defaultMarginPercent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultMarginPercent: parseFloat(e.target.value),
                })
              }
            />
          </FormField>

          <Button onClick={handleSave} isLoading={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>

        {/* Información y ayuda */}
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Coste de Electricidad
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Este valor se utiliza para calcular el coste de energía de cada trabajo de impresión.
              Se multiplica por el consumo de potencia de la impresora y la duración del trabajo.
            </p>
            <div className="bg-white dark:bg-slate-900 p-3 rounded text-sm font-mono text-blue-700 dark:text-blue-300">
              Coste = (Potencia kW) × Tiempo h × {formData.electricityCostPerKwh}{formData.currencySymbol}/kWh
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 p-6">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Margen de Beneficio
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200 mb-3">
              Porcentaje de ganancia que se aplica automáticamente al calcular precios basados en
              costes de material y electricidad.
            </p>
            <div className="bg-white dark:bg-slate-900 p-3 rounded text-sm font-mono text-green-700 dark:text-green-300">
              Precio = Coste × (1 + {formData.defaultMarginPercent}%)
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Ejemplo de Cálculo
            </h3>
            <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
              <p>
                Pieza: 25g de PLA a {formatCurrency(15, formData.currencySymbol)}/kg
                <br />
                Coste material: {formatCurrency(0.375, formData.currencySymbol)}
              </p>
              <p>
                Impresión: 1h en impresora 350W
                <br />
                Coste electricidad: {formatCurrency(0.35 * formData.electricityCostPerKwh, formData.currencySymbol)}
              </p>
              <p className="font-semibold border-t border-amber-300 dark:border-amber-700 pt-2">
                Precio venta con {formData.defaultMarginPercent}% margen:{" "}
                {formatCurrency(
                  (0.375 + 0.35 * formData.electricityCostPerKwh) * (1 + formData.defaultMarginPercent / 100),
                  formData.currencySymbol
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información del sistema */}
      <div className="mt-8 bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Base de datos</p>
            <p className="font-medium">SQLite (Local)</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ubicación BD</p>
            <p className="font-medium text-xs font-mono">./prisma/dev.db</p>
          </div>
          <div>
            <p className="text-muted-foreground">Versión</p>
            <p className="font-medium">1.0.0</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stack</p>
            <p className="font-medium">Next.js + Prisma + SQLite</p>
          </div>
        </div>
      </div>
    </div>
  )
}
