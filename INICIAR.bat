@echo off
echo ========================================
echo  Gestor de Impresion 3D
echo ========================================
echo.

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
