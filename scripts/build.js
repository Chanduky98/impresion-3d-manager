#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Determinar si estamos en Vercel
const isVercel = process.env.VERCEL === '1';
const databaseUrl = process.env.DATABASE_URL || '';
const isLibSQL = databaseUrl.startsWith('libsql://');

console.log('Build environment:');
console.log(`  - Vercel: ${isVercel}`);
console.log(`  - Database: ${isLibSQL ? 'libSQL (Turso)' : 'SQLite (local)'}`);
console.log('');

try {
  // Si NO estamos en Vercel con libSQL, regenerar Prisma
  if (!isVercel || !isLibSQL) {
    console.log('Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
  } else {
    console.log('Skipping Prisma generation (using cached version for Vercel+libSQL)');
  }

  // Ejecutar Next.js build
  console.log('\nBuilding Next.js...');
  execSync('next build', { stdio: 'inherit' });

  console.log('\n✓ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n✗ Build failed!');
  process.exit(1);
}
