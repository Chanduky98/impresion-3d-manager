@echo off
setlocal enabledelayedexpansion
color 0A
cls

REM ====================================================================
REM GESTOR DE IMPRESIÓN 3D - Script de Inicio Automático
REM ====================================================================

echo.
echo ====================================================================
echo   GESTOR DE IMPRESION 3D - Iniciando Aplicacion
echo ====================================================================
echo.

REM Verificar si Node.js está instalado
echo [VERIFICACION] Comprobando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ============================================================
    echo ERROR CRITICO: Node.js NO ESTA INSTALADO
    echo ============================================================
    echo.
    echo Node.js es OBLIGATORIO para ejecutar esta aplicacion.
    echo.
    echo SOLUCION:
    echo 1. Descarga Node.js desde: https://nodejs.org/
    echo 2. Elige la version LTS (recomendado)
    echo 3. Instala normalmente (siguiente, siguiente, terminar)
    echo 4. REINICIA tu ordenador
    echo 5. Ejecuta este script de nuevo
    echo.
    echo Para verificar que se instalo correctamente:
    echo Abre CMD y escribe: node --version
    echo.
    pause
    exit /b 1
)

echo OK: Node.js instalado
node --version
echo.

REM Verificar NPM
echo [VERIFICACION] Comprobando NPM...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: NPM no encontrado
    pause
    exit /b 1
)

echo OK: NPM instalado
npm --version
echo.

REM Cambiar al directorio del proyecto
cd /d "%~dp0"
echo [INFO] Directorio: %CD%
echo.

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo.
    echo ============================================================
    echo [1/4] Instalando dependencias de NPM...
    echo ============================================================
    echo.
    echo Esto puede tardar 1-2 minutos. Por favor espera...
    echo.

    call npm install

    if errorlevel 1 (
        echo.
        echo ============================================================
        echo ERROR: Fallo al instalar dependencias
        echo ============================================================
        echo.
        echo Intenta estas soluciones:
        echo 1. Elimina la carpeta "node_modules" manualmente
        echo 2. Elimina el archivo "package-lock.json"
        echo 3. Ejecuta este script de nuevo
        echo.
        echo Si persiste el error, ejecuta en CMD:
        echo npm install
        echo.
        pause
        exit /b 1
    )
    echo.
    echo OK: Dependencias instaladas correctamente
    echo.
) else (
    echo [INFO] Las dependencias ya estaban instaladas. Continuando...
    echo.
)

REM Ejecutar migraciones de Prisma
echo ============================================================
echo [2/4] Configurando base de datos...
echo ============================================================
echo.

call npx prisma migrate deploy --skip-generate 2>nul
if errorlevel 1 (
    echo [INFO] Ejecutando migracion inicial...
    call npx prisma migrate dev --name init --skip-generate
    if errorlevel 1 (
        echo.
        echo ERROR: Fallo al crear la base de datos
        pause
        exit /b 1
    )
)

echo OK: Base de datos lista
echo.

REM Ejecutar seed
echo ============================================================
echo [3/4] Cargando datos de ejemplo...
echo ============================================================
echo.

call npx prisma db seed

echo OK: Datos cargados
echo.

REM Iniciar servidor
echo ============================================================
echo [4/4] Iniciando servidor de desarrollo...
echo ============================================================
echo.
echo SERVIDOR INICIADO EXITOSAMENTE
echo.
echo URL LOCAL:    http://localhost:3000/dashboard
echo.
echo Abriendo navegador en 3 segundos...
echo.
echo NOTA: Deja esta ventana abierta mientras usas la app.
echo       Para detener: presiona CTRL+C
echo.
echo ============================================================
echo.

REM Esperar 3 segundos antes de abrir navegador
timeout /t 3 /nobreak

REM Abrir navegador
start http://localhost:3000/dashboard

REM Iniciar servidor
call npm run dev

echo.
echo El servidor se detuvo.
pause
