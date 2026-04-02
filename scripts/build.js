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
  // Para prisma generate, usar dummy URL si es libSQL (Prisma valida la URL del schema)
  const prismaEnv = { ...process.env };

  if (isLibSQL) {
    console.log('Using dummy DATABASE_URL for prisma generate (Prisma validation workaround)...');
    prismaEnv.DATABASE_URL = 'file:./build.db';
  }

  // Generar Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: prismaEnv
  });

  // Ejecutar Next.js build con DATABASE_URL original (para el adaptador LibSQL)
  console.log('\nBuilding Next.js...');
  execSync('next build', {
    stdio: 'inherit',
    env: process.env  // Usar la URL real aquí
  });

  console.log('\n✓ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n✗ Build failed!');
  console.error(error.message);
  process.exit(1);
}
