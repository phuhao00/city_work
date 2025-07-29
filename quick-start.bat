@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:start
echo.
echo ========================================
echo     City Work Quick Start Menu
echo ========================================
echo.
echo Please select startup option:
echo.
echo [1] Full Project Startup (Recommended)
echo     Includes: Database + Backend + Frontend + Auto Browser
echo.
echo [2] Development Environment
echo     Includes: Backend + Frontend (No Database)
echo.
echo [3] Web Version Startup
echo     Includes: Database + Backend + Web Frontend
echo.
echo [4] Quick Web Experience
echo     Frontend Web Version Only
echo.
echo [5] Stop All Services
echo.
echo [0] Exit
echo.
echo ========================================
set /p choice=Enter option (0-5): 

if "%choice%"=="1" (
    echo Starting full project...
    call scripts\start-project.bat
) else if "%choice%"=="2" (
    echo Starting development environment...
    call scripts\start-dev-only.bat
) else if "%choice%"=="3" (
    echo Starting web version...
    call scripts\start-web.bat
) else if "%choice%"=="4" (
    echo Starting quick web experience...
    call scripts\launch-web.bat
) else if "%choice%"=="5" (
    echo Stopping all services...
    call scripts\stop-project.bat
) else if "%choice%"=="0" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid option, please try again
    pause
    goto :start
)

pause