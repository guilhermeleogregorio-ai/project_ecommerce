# Script de Inicialização Rápida para o MVP Salesdrive
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "       Salesdrive MVP - Inicializando Servicos     " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Atualiza PATH com os executáveis do usuário caso necessário
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")

# Inicia Backend em segundo plano
Write-Host "[1/2] Iniciando Backend FastAPI (http://localhost:8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python backend/main.py"

# Inicia Frontend
Write-Host "[2/2] Iniciando Frontend React/Vite (http://localhost:3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm.cmd run dev"

Write-Host "Ambiente pronto!" -ForegroundColor Yellow
Write-Host "Acesse a Loja do Comprador em: http://localhost:3000" -ForegroundColor White
Write-Host "Acesse o Painel Administrativo em: http://localhost:3000/admin/dashboard" -ForegroundColor White
Write-Host "Documentacao interativa da API: http://localhost:8000/docs" -ForegroundColor White
