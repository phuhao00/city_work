@echo off
echo Starting City Work Platform...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0 && node temp-backend.js"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo City Work Platform is starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:19006
echo.
echo Press any key to open project showcase...
pause >nul

echo Opening project showcase...
start "" "%~dp0project-showcase.html"

echo.
echo All services started successfully!
echo Press any key to exit...
pause >nul