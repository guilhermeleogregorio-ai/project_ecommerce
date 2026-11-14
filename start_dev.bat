@echo off
title Salesdrive - Sistema Completo (Backend + Frontend)
cls
echo ========================================================
echo        INICIANDO SALESDRIVE (BACKEND + FRONTEND)
echo ========================================================
echo.

REM Adiciona o Node.js ao PATH desta sessao
SET PATH=C:\Program Files\nodejs;%PATH%

echo [1/2] Iniciando Backend FastAPI na porta 8000...
start "Salesdrive - Backend API" cmd /k "cd /d %~dp0 && python backend/main.py"

echo [2/2] Aguardando 3 segundos para o backend subir...
timeout /t 3 /nobreak > nul

echo [3/3] Iniciando Frontend React/Vite na porta 3000...
start "Salesdrive - Frontend Web" cmd /k "SET PATH=C:\Program Files\nodejs;%PATH% && cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo ========================================================
echo Servicos iniciados em janelas separadas!
echo.
echo   - Loja Virtual:    http://localhost:3000
echo   - Trafego Google:  http://localhost:3000/marketing/google-traffic
echo   - Painel Admin:    http://localhost:3000/admin/dashboard
echo   - API (docs):      http://localhost:8000/docs
echo ========================================================
echo.
pause
