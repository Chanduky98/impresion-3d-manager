#!/bin/bash

# Si estamos en Vercel (producción) y DATABASE_URL es libSQL
if [ "$VERCEL" = "1" ] && [[ "$DATABASE_URL" == libsql://* ]]; then
  echo "Running in Vercel with libSQL database"
  # No ejecutar prisma generate porque genera conflictos con libSQL
  # Prisma Client ya fue generado durante npm install
  npm run build:next
else
  # En desarrollo o testing, ejecutar prisma generate normalmente
  echo "Running in development environment"
  prisma generate && npm run build:next
fi
