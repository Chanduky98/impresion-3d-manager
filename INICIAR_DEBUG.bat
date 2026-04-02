@echo off
setlocal enabledelayedexpansion
color 0A
cls

echo ====================================================================
echo   GESTOR DE IMPRESION 3D - MODO DEBUG
echo ====================================================================
echo.
echo Este script te mostrara EXACTAMENTE que esta pasando
echo.

REM Cambiar al directorio del proyecto
cd /d "%~dp0"
echo Directorio actual: %CD%
echo.

REM Verificar Node.js
echo [PASO 1/5] Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js no funciona
    pause
    exit /b 1
)
echo ✓ OK
echo.

REM Verificar NPM
echo [PASO 2/5] Verificando NPM...
npm --version
if errorlevel 1 (
    echo ERROR: NPM no funciona
    pause
    exit /b 1
)
echo ✓ OK
echo.

REM Instalar dependencias
echo [PASO 3/5] Instalando dependencias...
echo Ejecutando: npm install
echo.
npm install
echo.
if errorlevel 1 (
    echo ERROR en npm install
    echo.
    pause
    exit /b 1
)
echo ✓ OK
echo.

REM Migraciones BD
echo [PASO 4/5] Configurando base de datos...
echo Ejecutando: npx prisma migrate dev --name init
echo.
call npx prisma migrate dev --name init
echo.
if errorlevel 1 (
    echo ERROR en prisma migrate
    echo.
    pause
    exit /b 1
)
echo ✓ OK
echo.

REM Seed datos
echo [PASO 5/5] Cargando datos de ejemplo...
echo Ejecutando: npx prisma db seed
echo.
call npx prisma db seed
echo.
if errorlevel 1 (
    echo ADVERTENCIA: Seed puede no ser necesario
)
echo ✓ OK
echo.

echo ====================================================================
echo LISTO PARA INICIAR SERVIDOR
echo ====================================================================
echo.
echo Presiona una tecla para iniciar servidor en: http://localhost:3000
echo.
pause

REM Limpiar pantalla
cls

echo ====================================================================
echo   SERVIDOR INICIANDO...
echo ====================================================================
echo.
echo URL: http://localhost:3000/dashboard
echo.
echo El navegador debe abrirse automaticamente.
echo Si no se abre, copia la URL en tu navegador.
echo.
echo Para DETENER el servidor: Presiona CTRL+C
echo.
echo ====================================================================
echo.

timeout /t 2 /nobreak

REM Intentar abrir navegador
start http://localhost:3000/dashboard

REM Iniciar servidor
npm run dev

echo.
echo Servidor detenido.
pause
