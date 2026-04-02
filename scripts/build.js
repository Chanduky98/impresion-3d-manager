#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

  // Si estamos en Vercel con libSQL, usar dummy URL para que prisma generate no falle
  if (isVercel && isLibSQL) {
    console.log('Using dummy DATABASE_URL for prisma generate...');
    buildEnv.DATABASE_URL = 'file:./build.db';
  }

  // Generar Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: buildEnv,
    cwd: process.cwd()
  });

  // Ejecutar Next.js build sin cambiar DATABASE_URL
  // El Proxy lazy loading en lib/prisma.ts evitará errores durante el build
  console.log('\nBuilding Next.js...');
  execSync('next build', {
    stdio: 'inherit',
    env: buildEnv  // Mantener la dummy URL durante el build de Next.js
  });

  console.log('\n✓ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n✗ Build failed!');
  console.error(error);
  process.exit(1);
}
