@echo off
color 0A
cls

echo ====================================================================
echo   VERIFICACION DE REQUISITOS
echo ====================================================================
echo.

echo [1/2] Verificando Node.js...
node --version
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Node.js NO ESTA INSTALADO
    echo.
    echo SOLUCION:
    echo 1. Descarga desde: https://nodejs.org/
    echo 2. Elige version LTS
    echo 3. Instala normalmente
    echo 4. Reinicia tu ordenador
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js encontrado
echo.

echo [2/2] Verificando NPM...
npm --version
if errorlevel 1 (
    echo.
    echo ❌ ERROR: NPM NO ESTA INSTALADO
    echo.
    pause
    exit /b 1
)

echo ✓ NPM encontrado
echo.
echo ====================================================================
echo ✅ TODO ESTA LISTO
echo ====================================================================
echo.
echo Ya puedes ejecutar: INICIAR.bat
echo.
pause
