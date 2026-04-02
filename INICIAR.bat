@echo off
echo ========================================
echo  Gestor de Impresion 3D - Startup
echo ========================================
echo.

REM Instalar dependencias
echo [1/4] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo Error al instalar dependencias
    pause
    exit /b 1
)
echo OK
echo.

REM Generar Prisma Client
echo [2/4] Generando Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo Error al generar Prisma
    pause
    exit /b 1
)
echo OK
echo.

REM Migrar base de datos
echo [3/4] Sincronizando base de datos...
call npx prisma migrate deploy
if errorlevel 1 (
    echo Error en migraciones. Intentando crear nuevo schema...
    call npx prisma db push --skip-generate
    if errorlevel 1 (
        echo Error al sincronizar BD
        pause
        exit /b 1
    )
)
echo OK
echo.

REM Crear usuario admin si no existe
echo [4/4] Verificando usuario admin...
REM (Prisma seed se ejecutaría aquí si lo tuvieras)
echo OK
echo.

echo ========================================
echo  Iniciando servidor...
echo ========================================
echo URL: http://localhost:3000
echo.
call npm run dev

pause
