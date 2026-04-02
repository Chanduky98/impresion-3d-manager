#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable not set");
    process.exit(1);
  }

  const client = createClient({ url: databaseUrl });

  try {
    console.log("Connecting to Turso database...");

    // Create migration tracking table if it doesn't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS _prisma_migrations (
        id TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        finished_at DATETIME,
        migration_name TEXT NOT NULL,
        logs TEXT,
        rolled_back_at DATETIME,
        started_at DATETIME NOT NULL,
        applied_steps_count INTEGER NOT NULL DEFAULT 0
      )
    `);

    console.log("Migration tracking table ready");

    // Get list of migration directories
    const migrationsDir = path.join(__dirname, "..", "prisma", "migrations");
    const migrationDirs = fs.readdirSync(migrationsDir).filter((f) => {
      const fullPath = path.join(migrationsDir, f);
      return fs.statSync(fullPath).isDirectory();
    });

    console.log(`Found ${migrationDirs.length} migrations`);

    for (const migrationDir of migrationDirs) {
      const migrationPath = path.join(migrationsDir, migrationDir);
      const sqlFile = path.join(migrationPath, "migration.sql");

      if (!fs.existsSync(sqlFile)) {
        console.log(`⏭  Skipping ${migrationDir} (no migration.sql)`);
        continue;
      }

      // Check if migration already applied
      const result = await client.execute(
        "SELECT id FROM _prisma_migrations WHERE migration_name = ?",
        [migrationDir]
      );

      if (result.rows.length > 0) {
        console.log(`✓ Already applied: ${migrationDir}`);
        continue;
      }

      // Read and execute migration
      const migrationSQL = fs.readFileSync(sqlFile, "utf-8");
      console.log(`Applying ${migrationDir}...`);

      try {
        // Split multiple statements and execute each one
        const statements = migrationSQL
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const statement of statements) {
          await client.execute(statement + ";");
        }

        // Record in migration table
        await client.execute(
          `INSERT INTO _prisma_migrations (id, migration_name, checksum, started_at, finished_at, applied_steps_count)
           VALUES (?, ?, ?, datetime('now'), datetime('now'), 1)`,
          [migrationDir, migrationDir, ""]
        );

        console.log(`✓ Applied: ${migrationDir}`);
      } catch (error) {
        console.error(`✗ Failed to apply ${migrationDir}:`);
        console.error(error.message);
        process.exit(1);
      }
    }

    console.log("\n✓ All migrations applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

runMigrations();
