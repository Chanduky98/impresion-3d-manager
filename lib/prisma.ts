import { PrismaClient } from "@prisma/client"
import { libsql } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  const isProduction = process.env.NODE_ENV === "production"

  if (isProduction && process.env.DATABASE_URL?.startsWith("libsql://")) {
    // Usar adaptador de libSQL para Turso en producción
    const client = createClient({
      url: process.env.DATABASE_URL,
    })

    return new PrismaClient({
      adapter: libsql(client),
    })
  }

  // Usar SQLite normal en desarrollo
  return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
