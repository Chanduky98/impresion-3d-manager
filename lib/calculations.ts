// Cálculos de costes y rentabilidad

export interface CostBreakdown {
  materialCost: number
  electricityCost: number
  totalCost: number
  sellingPrice: number
  profit: number
  marginPercent: number
}

/**
 * Calcula el coste de material basado en el peso de la pieza y el coste por kg del material
 * @param weightGrams Peso de la pieza en gramos
 * @param costPerKg Coste del material por kilogramo
 * @returns Coste de material en euros
 */
export function calculateMaterialCost(
  weightGrams: number,
  costPerKg: number
): number {
  return (weightGrams / 1000) * costPerKg
}

/**
 * Calcula el coste de electricidad basado en tiempo y potencia de la impresora
 * @param durationSeconds Duración en segundos
 * @param powerWatts Potencia de la impresora en watts
 * @param costPerKwh Coste por kWh
 * @returns Coste de electricidad en euros
 */
export function calculateElectricityCost(
  durationSeconds: number,
  powerWatts: number,
  costPerKwh: number
): number {
  const durationHours = durationSeconds / 3600
  const energyKwh = (powerWatts / 1000) * durationHours
  return energyKwh * costPerKwh
}

/**
 * Calcula el coste total de una pieza/trabajo
 * @param materialCost Coste de material
 * @param electricityCost Coste de electricidad
 * @param marginPercent Margen deseado en porcentaje
 * @returns Objeto con desglose de costes
 */
export function calculatePieceCost(
  materialCost: number,
  electricityCost: number,
  marginPercent: number = 30
): CostBreakdown {
  const totalCost = materialCost + electricityCost
  const markup = 1 + marginPercent / 100
  const sellingPrice = totalCost * markup
  const profit = sellingPrice - totalCost

  return {
    materialCost,
    electricityCost,
    totalCost,
    sellingPrice,
    profit,
    marginPercent,
  }
}

/**
 * Calcula el coste por unidad considerando cantidad
 * @param totalCost Coste total
 * @param quantity Cantidad de piezas
 * @returns Coste unitario
 */
export function calculateUnitCost(totalCost: number, quantity: number): number {
  if (quantity <= 0) return 0
  return totalCost / quantity
}

/**
 * Calcula estadísticas de una orden
 */
export function calculateOrderStats(
  items: Array<{
    unitCost: number
    unitPrice: number
    quantity: number
  }>
) {
  const totalCost = items.reduce((sum, item) => sum + item.unitCost * item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const totalProfit = totalPrice - totalCost
  const marginPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  return {
    totalCost,
    totalPrice,
    totalProfit,
    marginPercent,
  }
}

/**
 * Calcula la amortización de una máquina
 * @param purchaseCost Coste de compra
 * @param yearsLife Años de vida útil esperada
 * @param monthsUsed Meses de uso
 * @returns Coste amortizado mensual
 */
export function calculateMachineDepreciation(
  purchaseCost: number,
  yearsLife: number = 5,
  monthsUsed: number = 1
): number {
  const monthlyDepreciation = purchaseCost / (yearsLife * 12)
  return monthlyDepreciation * monthsUsed
}

/**
 * Calcula el coste por hora de uso de una impresora
 * @param purchaseCost Coste de compra
 * @param powerWatts Potencia en watts
 * @param costPerKwh Coste por kWh
 * @param yearsLife Años de vida útil
 * @param estimatedHoursPerYear Horas anuales estimadas de uso
 * @returns Coste por hora en euros
 */
export function calculatePrinterCostPerHour(
  purchaseCost: number,
  powerWatts: number,
  costPerKwh: number,
  yearsLife: number = 5,
  estimatedHoursPerYear: number = 500
): number {
  // Depreciation per hour
  const totalHours = yearsLife * estimatedHoursPerYear
  const depreciationPerHour = purchaseCost / totalHours

  // Electricity cost per hour
  const energyKwhPerHour = powerWatts / 1000
  const electricityPerHour = energyKwhPerHour * costPerKwh

  return depreciationPerHour + electricityPerHour
}

/**
 * Calcula estadísticas de rentabilidad
 */
export interface ProfitabilityStats {
  totalOrders: number
  completedOrders: number
  totalRevenue: number
  totalCosts: number
  totalProfit: number
  averageMargin: number
  averageOrderValue: number
  profitMargin: number // Porcentaje de beneficio sobre ingresos
}

export function calculateProfitabilityStats(
  orders: Array<{
    totalPrice: number
    totalCost: number
    status: string
  }>
): ProfitabilityStats {
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "delivered")

  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0)
  const totalCosts = completedOrders.reduce((sum, order) => sum + order.totalCost, 0)
  const totalProfit = totalRevenue - totalCosts

  const averageMargin =
    completedOrders.length > 0
      ? completedOrders.reduce((sum, order) => {
          const margin = order.totalCost > 0 ? (order.totalPrice / order.totalCost - 1) * 100 : 0
          return sum + margin
        }, 0) / completedOrders.length
      : 0

  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  return {
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    totalRevenue,
    totalCosts,
    totalProfit,
    averageMargin,
    averageOrderValue,
    profitMargin,
  }
}

/**
 * Identifica las piezas más rentables
 */
export interface ProfitableItem {
  name: string
  unitProfit: number
  profitMargin: number
  totalProfit: number
  totalQuantity: number
}

export function identifyMostProfitablePieces(
  items: Array<{
    piece: { name: string }
    unitCost: number
    unitPrice: number
    quantity: number
  }>
): ProfitableItem[] {
  const pieceStats = new Map<string, { totalCost: number; totalPrice: number; totalQty: number }>()

  items.forEach((item) => {
    const pieceName = item.piece.name
    const existing = pieceStats.get(pieceName) || { totalCost: 0, totalPrice: 0, totalQty: 0 }
    existing.totalCost += item.unitCost * item.quantity
    existing.totalPrice += item.unitPrice * item.quantity
    existing.totalQty += item.quantity
    pieceStats.set(pieceName, existing)
  })

  const profitable: ProfitableItem[] = Array.from(pieceStats.entries()).map(([name, stats]) => ({
    name,
    unitProfit: stats.totalQty > 0 ? (stats.totalPrice - stats.totalCost) / stats.totalQty : 0,
    profitMargin: stats.totalCost > 0 ? ((stats.totalPrice - stats.totalCost) / stats.totalCost) * 100 : 0,
    totalProfit: stats.totalPrice - stats.totalCost,
    totalQuantity: stats.totalQty,
  }))

  return profitable.sort((a, b) => b.totalProfit - a.totalProfit)
}

/**
 * Estadísticas por cliente
 */
export interface ClientStats {
  id: string
  name: string
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  lastOrderDate: Date | null
  status: string
}

export function calculateClientStats(
  clients: Array<{
    id: string
    name: string
    orders: Array<{
      totalPrice: number
      createdAt: Date
      status: string
    }>
  }>
): ClientStats[] {
  return clients.map((client) => {
    const completedOrders = client.orders.filter(
      (o) => o.status === "completed" || o.status === "delivered"
    )
    const totalSpent = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0)
    const lastOrderDate =
      client.orders.length > 0
        ? new Date(Math.max(...client.orders.map((o) => new Date(o.createdAt).getTime())))
        : null

    return {
      id: client.id,
      name: client.name,
      totalOrders: client.orders.length,
      totalSpent,
      averageOrderValue: client.orders.length > 0 ? totalSpent / client.orders.length : 0,
      lastOrderDate,
      status: client.orders.length === 0 ? "inactive" : "active",
    }
  })
}
