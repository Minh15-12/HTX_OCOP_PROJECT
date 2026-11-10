# ==============================================================================
# Automated Production Deployment Script for Windows Environments
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " Starting HTX OCOP Production Deployment: $(Get-Date)" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

# 1. Check SSL Certificates
$certFile = "docker/ssl/server.crt"
$keyFile  = "docker/ssl/server.key"
if (-not (Test-Path $certFile) -or -not (Test-Path $keyFile)) {
    Write-Host ">>> SSL certificates missing. Generating now..." -ForegroundColor Yellow
    powershell -ExecutionPolicy Bypass -File scripts/generate_ssl_certs.ps1
}

# 2. Build Frontend Distribution
Write-Host ">>> Building production frontend bundle (Vite + TypeScript)..." -ForegroundColor Cyan
Set-Location "frontend"
npm run build
Set-Location $rootDir

# 3. Optimize Laravel Backend
Write-Host ">>> Optimizing Laravel caching and database migrations..." -ForegroundColor Cyan
Set-Location "backend"
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan migrate --force
Set-Location $rootDir

Write-Host "==========================================================================" -ForegroundColor Green
Write-Host " DEPLOYMENT SUCCESSFUL: All assets built, caches optimized, and database migrated!" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green
