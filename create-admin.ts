import { createUser } from "./lib/auth"

async function createAdminUser() {
  try {
    const admin = await createUser("admin@impresion3d.local", "Chanduk11", "admin")
    console.log("✅ Usuario admin creado:")
    console.log(`   Email: ${admin.email}`)
    console.log(`   Rol: ${admin.role}`)
    console.log(`   ID: ${admin.id}`)
  } catch (error: any) {
    console.error("❌ Error al crear admin:", error.message)
  }
}

createAdminUser()
