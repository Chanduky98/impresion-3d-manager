@echo off
echo ========================================
echo  Gestor de Impresion 3D
echo ========================================
echo.

REM Matar procesos que usen puerto 3000 y 3001
echo Liberando puertos 3000 y 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F 2>/dev/null
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /PID %%a /F 2>/dev/null

REM Si no existe la BD, crearla la primera vez
if not exist "dev.db" (
    echo Creando base de datos la primera vez...
    call npx prisma migrate deploy
    echo.
)

echo Iniciando servidor en http://localhost:3000
echo.
timeout /t 2 /nobreak

REM Abrir navegador
start http://localhost:3000

REM Iniciar servidor
call npm run dev

pause
