@echo off
echo ========================================
echo  Gestor de Impresion 3D
echo ========================================
echo.

REM Matar procesos en puertos 3000 y 3001 (opcional, puede fallar)
echo Liberando puertos...
taskkill /F /IM node.exe 2>/dev/null

REM Si no existe BD, crearla
if not exist "dev.db" (
    echo Creando base de datos...
    call npx prisma migrate deploy
)

echo.
echo Abriendo navegador...
timeout /t 2 /nobreak
start http://localhost:3000

echo.
echo Iniciando servidor...
call npm run dev

pause
