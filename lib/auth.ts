import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Hash de contraseña
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Verificar contraseña
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generar token seguro
export function generateToken(): string {
  return require("crypto")
    .randomBytes(32)
    .toString("hex")
}

// Crear sesión
export async function createSession(
  userId: string,
  expirationHours: number = 24
) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000)

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return session
}

// Validar sesión
export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
  })

  if (!session) return null

  // Verificar si expiró
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  // Obtener el usuario por su ID
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  })

  return user
}

// Crear usuario
export async function createUser(
  email: string,
  password: string,
  role: string = "user"
) {
  const hashedPassword = await hashPassword(password)

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
  })
}

// Obtener usuario por email
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

// Invalidar sesión
export async function invalidateSession(token: string) {
  return prisma.session.deleteMany({
    where: { token },
  })
}

// Limpiar sesiones expiradas
export async function cleanExpiredSessions() {
  return prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}
