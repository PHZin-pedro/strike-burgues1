@echo off
cd /d "%~dp0"
echo Instalando dependencias...
call npm install
if errorlevel 1 (
  echo.
  echo ERRO ao instalar. Confira se o Node.js esta instalado.
  pause
  exit /b 1
)
echo.
echo Instalacao concluida.
pause
