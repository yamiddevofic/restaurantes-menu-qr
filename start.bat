@echo off
title QRTA - Sistema de Restaurantes
color 0A

echo.
echo ========================================
echo    QRTA - Sistema de Restaurantes
echo ========================================
echo.

REM Verificar si PowerShell esta disponible
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PowerShell no encontrado. 
    echo Abre PowerShell manualmente y ejecuta: .\start.ps1
    pause
    exit /b 1
)

REM Ejecutar script PowerShell
echo Iniciando proyecto...
powershell -ExecutionPolicy Bypass -File "%~dp0start.ps1"

REM Si PowerShell termina, pausar
pause