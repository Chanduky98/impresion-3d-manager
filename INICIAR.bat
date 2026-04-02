@echo off
echo ========================================
echo  Gestor de Impresion 3D
echo ========================================
echo.

REM Verificar si es la primera vez (no existe dev.db)
if not exist "dev.db" (
    echo [1/4] Primera ejecucion - instalando y configurando...
    echo.
    
    REM Instalar dependencias
    echo  Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo Error al instalar dependencias
        pause
        exit /b 1
    )
    
    REM Generar Prisma Client
    echo  Generando Prisma Client...
    call npx prisma generate
    if errorlevel 1 (
        echo Error al generar Prisma
        pause
        exit /b 1
    )
    
    REM Crear BD y ejecutar migraciones
    echo  Creando base de datos...
    call npx prisma migrate deploy
    if errorlevel 1 (
        echo Error en migraciones
        pause
        exit /b 1
    )
    
    echo OK
    echo.
) else (
    echo [1/4] Base de datos ya existe
    echo.
    
    REM Solo actualizar dependencias si package.json cambio
    echo  Verificando dependencias...
    call npm install --prefer-offline
    echo OK
    echo.
)

echo ========================================
echo [2/4] Iniciando servidor...
echo ========================================
echo.
echo URL: http://localhost:3000
echo.

REM Esperar 3 segundos para que Next.js inicie
timeout /t 3 /nobreak

REM Abrir navegador
echo [3/4] Abriendo navegador...
start http://localhost:3000

echo [4/4] Listo!
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

call npm run dev

pause
