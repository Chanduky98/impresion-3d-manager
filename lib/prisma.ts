import { PrismaClient } from "@prisma/client"

// Esto previene que Prisma se instancie durante el build
// Solo se instancia cuando se usa en un request
let prismaInstance: PrismaClient | null = null

function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

export const prisma = new Proxy(new PrismaClient(), {
  get: (target, prop) => {
    // Retorna el valor del cliente real
    return Reflect.get(target, prop)
  },
}) as PrismaClient
