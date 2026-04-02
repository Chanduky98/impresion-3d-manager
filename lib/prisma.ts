import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  // En Vercel con Turso, la URL real está en TURSO_URL
  // DATABASE_URL es dummy (file:./build.db) solo para que Prisma valide el schema
  const tursoUrl = process.env.TURSO_URL
  const isProduction = process.env.NODE_ENV === "production"

  if (tursoUrl && isProduction) {
    // Usar Turso en producción
    // Establecer DATABASE_URL dinamicamente para que Prisma lo use
    process.env.DATABASE_URL = tursoUrl
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? [] : ["error"],
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
