import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, symbol: string = "€"): string {
  return `${value.toFixed(2)}${symbol}`
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + "..."
}

export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const random = Math.floor(Math.random() * 10000)
  return `ORD-${year}${month}-${String(random).padStart(4, "0")}`
}

export const StatusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  pending: "bg-blue-100 text-blue-800",
  printing: "bg-purple-100 text-purple-800",
  paused: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  in_progress: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export function getStatusColor(status: string): string {
  return StatusColors[status] || "bg-gray-100 text-gray-800"
}

export const StatusLabels: Record<string, string> = {
  active: "Activa",
  inactive: "Inactiva",
  maintenance: "Mantenimiento",
  pending: "Pendiente",
  printing: "Imprimiendo",
  paused: "Pausado",
  completed: "Completado",
  failed: "Fallido",
  in_progress: "En progreso",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

export function getStatusLabel(status: string): string {
  return StatusLabels[status] || status
}
