@echo off
echo ===================================================
echo     Iniciando Salesdrive MVP - Hackathon
echo ===================================================

echo [1/2] Iniciando Backend FastAPI na porta 8000...
start cmd /k "python backend/main.py"

echo [2/2] Iniciando Frontend Vite na porta 3000...
start cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ===================================================
echo   Salesdrive MVP esta em execucao!
echo   Loja & Portal: http://localhost:3000
echo   API & Swagger Docs: http://localhost:8000/docs
echo ===================================================
pause
