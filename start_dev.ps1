# Script de Inicializacao do MVP Salesdrive
# Execute com: powershell -ExecutionPolicy Bypass -File start_dev.ps1

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       SALESDRIVE MVP - Iniciando Servicos              " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Garante que o Node.js esta no PATH
$nodePath = "C:\Program Files\nodejs"
if (Test-Path $nodePath) {
    $env:PATH = "$nodePath;$env:PATH"
    Write-Host "[OK] Node.js encontrado em $nodePath" -ForegroundColor Green
} else {
    Write-Host "[ERRO] Node.js nao encontrado! Instale em https://nodejs.org" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verifica Python
try {
    $pyVersion = python --version 2>&1
    Write-Host "[OK] $pyVersion detectado" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Python nao encontrado! Instale em https://python.org" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

$rootDir = $PSScriptRoot

# Inicia Backend
Write-Host ""
Write-Host "[1/2] Iniciando Backend FastAPI (porta 8000)..." -ForegroundColor Yellow
$backendCmd = "cd '$rootDir'; python backend/main.py; Read-Host 'Backend encerrado. Pressione Enter para fechar'"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $backendCmd

# Aguarda backend inicializar
Write-Host "      Aguardando 3 segundos para o backend subir..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Inicia Frontend usando node diretamente (evita problema com .ps1 bloqueado)
Write-Host "[2/2] Iniciando Frontend React/Vite (porta 3000)..." -ForegroundColor Yellow
$npmCli = "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js"
$frontendCmd = "cd '$rootDir\frontend'; node '$npmCli' run dev; Read-Host 'Frontend encerrado. Pressione Enter para fechar'"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $frontendCmd

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Ambiente iniciado! Aguarde as janelas carregarem..." -ForegroundColor Green
Write-Host ""
Write-Host "   Loja Virtual:    http://localhost:3000" -ForegroundColor White
Write-Host "   Trafego Google:  http://localhost:3000/marketing/google-traffic" -ForegroundColor White
Write-Host "   Painel Admin:    http://localhost:3000/admin/dashboard" -ForegroundColor White
Write-Host "   API (Swagger):   http://localhost:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Pressione Enter para fechar esta janela"
