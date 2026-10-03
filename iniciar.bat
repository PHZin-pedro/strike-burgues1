@echo off
cd /d "%~dp0"
echo ==========================================
echo   STRIKE BURGUE'S - SERVIDOR
 echo ==========================================
if not exist node_modules (
  echo Instalando dependencias pela primeira vez...
  call npm install
  if errorlevel 1 pause & exit /b 1
)
echo.
echo Servidor iniciando...
echo No celular, abra: http://IP-DO-PC:3000
 echo Para descobrir o IP, abra ipconfig em outro terminal.
echo.
call npm start
pause
