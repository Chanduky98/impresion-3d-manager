#!/usr/bin/env node

const { execSync } = require('child_process');

const isVercel = process.env.VERCEL === '1';
const databaseUrl = process.env.DATABASE_URL || '';
const isLibSQL = databaseUrl.startsWith('libsql://');

console.log('Build environment:');
console.log(`  - Vercel: ${isVercel}`);
console.log(`  - Database: ${isLibSQL ? 'libSQL (Turso)' : 'SQLite (local)'}`);
console.log('');

try {
  // Crear env para el build
  const buildEnv = { ...process.env };

  // Si es libSQL en Vercel, usar dummy URL durante el build
  // Prisma validará que la URL sea "file://" en schema.prisma
  // La URL real de libSQL se usará en runtime después del deployment
  if (isLibSQL) {
    console.log('Using dummy DATABASE_URL for build (will use real Turso URL at runtime)...');
    buildEnv.DATABASE_URL = 'file:./build.db';
  }

  // Generar Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: buildEnv
  });

  // Ejecutar Next.js build con dummy URL también
  // En Vercel, después del deployment, el environment variable DATABASE_URL será reemplazado por la real
  console.log('\nBuilding Next.js...');
  execSync('next build', {
    stdio: 'inherit',
    env: buildEnv
  });

  console.log('\n✓ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n✗ Build failed!');
  console.error(error.message);
  process.exit(1);
}
