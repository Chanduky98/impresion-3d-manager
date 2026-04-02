#!/usr/bin/env node

const { execSync } = require('child_process');

const isVercel = process.env.VERCEL === '1';
const tursoUrl = process.env.TURSO_URL || '';
const databaseUrl = process.env.DATABASE_URL || '';

console.log('Build environment:');
console.log(`  - Vercel: ${isVercel}`);
console.log(`  - Has TURSO_URL: ${!!tursoUrl}`);
console.log('');

try {
  const buildEnv = { ...process.env };

  // En Vercel, DATABASE_URL debe ser dummy (file:./build.db) para que Prisma valide
  // TURSO_URL contiene la URL real y será usado por lib/prisma.ts en runtime
  if (isVercel && tursoUrl) {
    console.log('Using dummy DATABASE_URL for build...');
    buildEnv.DATABASE_URL = 'file:./build.db';
    // Mantener TURSO_URL para que lib/prisma.ts lo use en runtime
    console.log('TURSO_URL will be used in runtime...');
  }

  // Generar Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: buildEnv
  });

  // Ejecutar Next.js build
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
