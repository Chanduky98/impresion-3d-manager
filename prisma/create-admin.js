const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("Chanduk11", salt)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@impresion3d.local",
        password: hashedPassword,
        role: "admin",
        active: true,
      },
    })

    console.log("✅ Usuario admin creado correctamente:")
    console.log(`   Email: ${admin.email}`)
    console.log(`   Rol: ${admin.role}`)
    console.log(`   ID: ${admin.id}`)
    console.log(`   `)
    console.log(`🔐 Credenciales:`)
    console.log(`   Email: admin@impresion3d.local`)
    console.log(`   Password: Chanduk11`)
  } catch (error) {
    if (error.code === "P2002") {
      console.log("ℹ️  Usuario admin ya existe")
    } else {
      console.error("❌ Error:", error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
