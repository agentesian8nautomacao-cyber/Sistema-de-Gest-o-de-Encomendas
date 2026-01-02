# Script de desenvolvimento para Windows
$env:NODE_ENV = "development"

# Define o diretório do script como diretório de trabalho
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Tenta encontrar o tsx
$tsxPath = Join-Path $scriptDir "node_modules\.bin\tsx.cmd"

if (Test-Path $tsxPath) {
    Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Green
    & $tsxPath watch server/_core/index.ts
} else {
    Write-Host "tsx não encontrado em node_modules\.bin\tsx.cmd" -ForegroundColor Yellow
    Write-Host "Tentando com pnpm exec..." -ForegroundColor Yellow
    pnpm exec tsx watch server/_core/index.ts
}
