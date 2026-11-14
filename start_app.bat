@echo off
title Salesdrive - Sistema Completo (Backend + Frontend)
cls
echo ========================================================
echo        INICIANDO SALESDRIVE (BACKEND + FRONTEND)
echo ========================================================
echo.

echo [1/2] Iniciando Backend FastAPI na porta 8000...
start "Salesdrive - Backend API" cmd /k "cd /d %~dp0 && python backend/main.py"

echo [2/2] Iniciando Frontend React/Vite na porta 3000...
start "Salesdrive - Frontend Web" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Servicos iniciados em janelas separadas!
echo - Loja Virtual:   http://localhost:3000
echo - Painel Admin:   http://localhost:3000/admin/dashboard
echo - Documentacao:   http://localhost:8000/docs
echo ========================================================
echo.
echo Pode minimizar esta janela.
pause
