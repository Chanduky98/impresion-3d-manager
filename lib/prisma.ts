import { PrismaClient } from "@prisma/client"
import { LibSQL } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable not set")
  }

  // Si es una URL libSQL (Turso), usar el adaptador
  if (databaseUrl.startsWith("libsql://")) {
    const client = createClient({
      url: databaseUrl,
    })

    return new PrismaClient({
      adapter: new LibSQL(client),
      log: process.env.NODE_ENV === "development" ? [] : ["error"],
    })
  }

  // Si es SQLite local, usar normalemente
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
