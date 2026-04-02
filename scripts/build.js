#!/usr/bin/env node

const { execSync } = require('child_process');

const isVercel = process.env.VERCEL === '1';

console.log('Build environment:');
console.log(`  - Vercel: ${isVercel}`);
console.log('');

try {
  // Generar Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', {
    stdio: 'inherit'
  });

  // Ejecutar Next.js build
  console.log('\nBuilding Next.js...');
  execSync('next build', {
    stdio: 'inherit'
  });

  console.log('\n✓ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n✗ Build failed!');
  console.error(error);
  process.exit(1);
}
