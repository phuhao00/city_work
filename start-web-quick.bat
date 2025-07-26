@echo off
chcp 65001 > nul
echo ========================================
echo     City Work Web Quick Start
echo ========================================
echo.

echo [1/3] Starting database services (Docker)...
docker-compose up -d mongodb elasticsearch redis
if %errorlevel% neq 0 (
    echo Warning: Docker services failed to start, using mock data mode
    echo.
)

echo [2/3] Starting backend service...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)
start "Backend API Server" cmd /k "npm run start:dev"
cd ..

echo Waiting for backend service to start...
timeout /t 5 /nobreak > nul

echo [3/3] Starting frontend web application...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)

echo Starting web application...
start "City Work Web App" cmd /k "npm run web"

echo Waiting for web application to start...
timeout /t 12 /nobreak > nul

echo Opening application in browser...
start http://localhost:19006

cd ..

echo.
echo ========================================
echo           Startup Complete!
echo ========================================
echo.
echo Web App opened in browser: http://localhost:19006
echo Backend API service: http://localhost:3000
echo.
echo You can now use City Work directly in your browser!
echo.
echo Notes:
echo   - If Docker services failed, app will use mock data
echo   - First startup may take longer to install dependencies
echo   - If browser didn't open automatically, visit: http://localhost:19006
echo.
echo ========================================
echo Press any key to exit startup script (services will continue running)...
pause > nul