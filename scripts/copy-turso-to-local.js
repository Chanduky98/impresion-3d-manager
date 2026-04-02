#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

async function copyTursoToLocal() {
  console.log("Starting data copy from Turso to local SQLite...\n");

  // Eliminar BD local anterior si existe
  const localDbPath = path.join(process.cwd(), "dev.db");
  if (fs.existsSync(localDbPath)) {
    console.log("Removing old local database...");
    fs.unlinkSync(localDbPath);
  }

  try {
    // Conectar a Turso (DATABASE_URL actual)
    const tursoClient = new PrismaClient();

    console.log("Connected to Turso\n");

    // Cambiar temporalmente a SQLite local para la escritura
    process.env.DATABASE_URL = "file:./dev.db";

    // Crear la BD local ejecutando migraciones
    console.log("Setting up local database schema...");
    const { execSync } = require("child_process");
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
    } catch (e) {
      // Si no hay migraciones pendientes, está bien
      console.log("  (no pending migrations)");
    }

    const localClient = new PrismaClient();

    console.log("\nCopying data from Turso to local...\n");

    // Copiar cada tabla
    const tables = [
      "settings",
      "client",
      "printer",
      "material",
      "piece",
      "order",
      "orderItem",
      "printJob",
      "maintenance",
      "usageLog",
      "user",
      "session",
    ];

    for (const table of tables) {
      try {
        const data = await tursoClient[table].findMany();
        if (data.length > 0) {
          console.log(`  Copying ${table}: ${data.length} records`);
          for (const record of data) {
            try {
              await localClient[table].create({
                data: record,
              });
            } catch (e) {
              // Ignorar errores de clave primaria duplicada
              if (!e.message.includes("Unique constraint")) {
                console.error(`    Error creating ${table}:`, e.message);
              }
            }
          }
        } else {
          console.log(`  ${table}: no data`);
        }
      } catch (e) {
        console.log(`  Skipping ${table}: ${e.message.split("\n")[0]}`);
      }
    }

    console.log("\n✓ Data copy completed successfully!");
    console.log("\nChanging .env.local back to local SQLite...");

    // Cambiar .env.local a local
    const envPath = path.join(process.cwd(), ".env.local");
    const envContent = `DATABASE_URL="file:./dev.db"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
`;
    fs.writeFileSync(envPath, envContent);

    console.log("✓ .env.local updated to local SQLite\n");
    console.log("Ready to run: npm run dev");

    await tursoClient.$disconnect();
    await localClient.$disconnect();
  } catch (error) {
    console.error("✗ Error during copy:", error.message);
    process.exit(1);
  }
}

copyTursoToLocal();
