import { z } from "zod"

// Printer schemas
export const PrinterSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  model: z.string().min(1, "El modelo es requerido"),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  printAreaX: z.number().positive("Debe ser un número positivo"),
  printAreaY: z.number().positive("Debe ser un número positivo"),
  printAreaZ: z.number().positive("Debe ser un número positivo"),
  nozzleTemperature: z.number().int().min(0),
  bedTemperature: z.number().int().min(0),
  powerConsumption: z.number().positive("Debe ser un número positivo"),
  purchaseDate: z.string().optional(),
  purchaseCost: z.number().positive().optional(),
  status: z.enum(["active", "inactive", "maintenance"]).default("active"),
  description: z.string().optional(),
  notes: z.string().optional(),
})

export type Printer = z.infer<typeof PrinterSchema>

// Material schemas
export const MaterialSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.string().min(1, "El tipo es requerido"),
  color: z.string().optional(),
  diameter: z.number().positive("El diámetro debe ser positivo").optional(),
  supplier: z.string().optional(),
  costPerKg: z.number().positive("Debe ser un número positivo"),
  stockKg: z.number().positive("El stock debe ser positivo").optional(),
  density: z.number().positive().optional(),
  temperatureMin: z.number().int().optional(),
  temperatureMax: z.number().int().optional(),
  printSpeed: z.number().int().positive().optional(),
  bedTemperature: z.number().int().optional(),
  notes: z.string().optional(),
})

export type Material = z.infer<typeof MaterialSchema>

// Piece schemas
export const PieceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().positive().optional(),
  weight: z.number().positive("El peso debe ser positivo"),
  estimatedTime: z.number().positive("El tiempo estimado debe ser positivo"),
  materialId: z.string().min(1, "Debe seleccionar un material"),
  status: z.enum(["available", "in_progress", "completed", "discontinued"]).default("available").optional(),
  customSellingPrice: z.number().positive().optional(),
  isPersonal: z.boolean().default(false).optional(),
})

export type Piece = z.infer<typeof PieceSchema>

// Client schemas
export const ClientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
})

export type Client = z.infer<typeof ClientSchema>

// PrintJob schemas
export const PrintJobSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  printerId: z.string().min(1, "Debe seleccionar una impresora"),
  pieceId: z.string().min(1, "Debe seleccionar una pieza"),
  quantity: z.number().int().positive("La cantidad debe ser positiva"),
  status: z.enum(["pending", "printing", "paused", "completed", "failed"]).default("pending"),
  notes: z.string().optional(),
})

export type PrintJob = z.infer<typeof PrintJobSchema>

// Order schemas
export const OrderItemSchema = z.object({
  pieceId: z.string().min(1, "Debe seleccionar una pieza"),
  quantity: z.number().int().positive("La cantidad debe ser positiva"),
  unitCost: z.number().nonnegative().optional(),
  unitPrice: z.number().positive("El precio debe ser positivo"),
})

export type OrderItem = z.infer<typeof OrderItemSchema>

export const OrderSchema = z.object({
  clientId: z.string().min(1, "Debe seleccionar un cliente"),
  status: z.enum(["pending", "in_progress", "completed", "delivered", "cancelled"]).default("pending"),
  deliveryDate: z.string().optional(),
  marginPercent: z.number().nonnegative().default(30),
  notes: z.string().optional(),
  items: z.array(OrderItemSchema).optional(),
})

export type Order = z.infer<typeof OrderSchema>

// Maintenance schemas
export const MaintenanceSchema = z.object({
  printerId: z.string().min(1, "Debe seleccionar una impresora"),
  type: z.enum([
    "cleaning",
    "calibration",
    "repair",
    "nozzle_replacement",
    "bed_replacement",
    "other",
  ]),
  description: z.string().min(1, "La descripción es requerida"),
  cost: z.number().nonnegative().default(0),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  scheduledAt: z.string().optional(),
  notes: z.string().optional(),
})

export type Maintenance = z.infer<typeof MaintenanceSchema>

// Settings schemas
export const SettingsSchema = z.object({
  electricityCostPerKwh: z.number().positive("Debe ser un número positivo"),
  currencySymbol: z.string().max(3),
  defaultMarginPercent: z.number().nonnegative(),
})

export type Settings = z.infer<typeof SettingsSchema>

// Usage Log schemas
export const UsageLogSchema = z.object({
  printerId: z.string().min(1, "Debe seleccionar una impresora"),
  startTime: z.string(),
  endTime: z.string().optional(),
  notes: z.string().optional(),
})

export type UsageLog = z.infer<typeof UsageLogSchema>
