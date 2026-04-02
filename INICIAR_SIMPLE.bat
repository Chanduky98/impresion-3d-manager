@echo off
cd /d "%~dp0"
cls
color 0A

echo.
echo ====================================================================
echo   GESTOR DE IMPRESION 3D - Iniciando...
echo ====================================================================
echo.

npm install && npx prisma migrate dev --name init && npx prisma db seed && echo. && echo LISTO PARA INICIAR SERVIDOR && echo. && pause && cls && start http://localhost:3000/dashboard && npm run dev

echo.
pause
