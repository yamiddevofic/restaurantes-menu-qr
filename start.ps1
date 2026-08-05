# ============================================
# QRTA - Script de inicio del proyecto completo
# ============================================

$ErrorActionPreference = "Stop"

# Colores para la consola
function Write-Header {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "       QRTA - Sistema de Restaurantes" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Ok     { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Info   { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Yellow }
function Write-Error  { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Verificar Node.js
function Test-Node {
    try {
        $version = node --version 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Node no encontrado" }
        Write-Ok "Node.js detectado: $version"
        return $true
    } catch {
        Write-Error "Node.js no esta instalado. Descargalo desde https://nodejs.org"
        return $false
    }
}

# Verificar npm
function Test-Npm {
    try {
        $version = npm --version 2>&1
        if ($LASTEXITCODE -ne 0) { throw "npm no encontrado" }
        Write-Ok "npm detectado: $version"
        return $true
    } catch {
        Write-Error "npm no esta instalado."
        return $false
    }
}

# Instalar dependencias si no existen node_modules
function Install-Dependencies {
    param($path, $name)
    
    if (Test-Path "$path\node_modules") {
        Write-Ok "${name}: dependencias ya instaladas"
    } else {
        Write-Info "${name}: instalando dependencias..."
        Push-Location $path
        npm install --silent 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Ok "${name}: dependencias instaladas"
        } else {
            Write-Error "${name}: fallo al instalar dependencias"
            Pop-Location
            return $false
        }
        Pop-Location
    }
    return $true
}

# ============================================
# INICIO
# ============================================

Clear-Host
Write-Header

# Verificar prerequisitos
Write-Info "Verificando prerequisitos..."
if (-not (Test-Node)) { exit 1 }
if (-not (Test-Npm)) { exit 1 }

# Instalar dependencias
Write-Info ""
Write-Info "Verificando dependencias..."
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

if (-not (Test-Path $backendDir)) { Write-Error "Carpeta 'backend' no encontrada"; exit 1 }
if (-not (Test-Path $frontendDir)) { Write-Error "Carpeta 'frontend' no encontrada"; exit 1 }

Install-Dependencies -path $backendDir -name "Backend"
Install-Dependencies -path $frontendDir -name "Frontend"

# URLs
$backendUrl = "http://localhost:3000"
$frontendUrl = "http://localhost:5173"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "         Iniciando servidores..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Backend:  $backendUrl" -ForegroundColor Green
Write-Host "  Frontend: $frontendUrl" -ForegroundColor Green
Write-Host "  Swagger:  $backendUrl/api-docs" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Presiona Ctrl+C para detener" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Iniciar procesos en background
$backendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "start" -WorkingDirectory $backendDir -PassThru -NoNewWindow
$frontendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory $frontendDir -PassThru -NoNewWindow

Write-Ok "Servidores iniciados (Backend PID: $($backendProcess.Id), Frontend PID: $($frontendProcess.Id))"

# Manejar Ctrl+C
$cleanup = {
    Write-Info ""
    Write-Info "Deteniendo servidores..."
    if (-not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Ok "Backend detenido"
    }
    if (-not $frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Ok "Frontend detenido"
    }
    Write-Ok "Todos los servidores detenidos"
}

# Registrar evento de salida
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $cleanup | Out-Null

# Esperar a que los procesos terminen (o Ctrl+C)
try {
    while (-not $backendProcess.HasExited -or -not $frontendProcess.HasExited) {
        Start-Sleep -Seconds 1
    }
} finally {
    & $cleanup
}