import { PrismaClient } from "@prisma/client"

declare global {
  var prismaInstance: PrismaClient | undefined
}

function getPrismaInstance(): PrismaClient {
  if (!global.prismaInstance) {
    try {
      // Intentar crear el cliente normalmente
      global.prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? [] : ["error"],
      })
    } catch (error: any) {
      // En Vercel con libSQL, Prisma puede fallar en la validación pero aún funciona
      if (process.env.VERCEL === '1' && process.env.DATABASE_URL?.includes('turso')) {
        console.warn('Prisma validation error (expected in Vercel+Turso), creating client anyway...')
        console.warn('Error:', error.message)

        // Crear cliente ignorando el error - libSQL debería funcionar de todas formas
        global.prismaInstance = new PrismaClient({
          log: process.env.NODE_ENV === "development" ? [] : ["error"],
          // @ts-ignore
          __internal: {
            skipValidation: true,
          },
        })
      } else {
        throw error
      }
    }
  }
  return global.prismaInstance
}

export const prisma = new Proxy({} as any, {
  get: (target, prop: string | symbol) => {
    const instance = getPrismaInstance()
    return Reflect.get(instance, prop)
  },
}) as PrismaClient
