@echo off
chcp 65001 > nul
echo ========================================
echo     City Work - Auto Web Launcher
echo ========================================
echo.

echo [1/2] Starting frontend web application...
cd frontend

echo Starting web service (this may take a moment)...
start "City Work Web App" cmd /k "npx expo start --web --offline"

echo Waiting for web service to initialize...
timeout /t 15 /nobreak > nul

echo [2/2] Opening application in browser...
start http://localhost:19006

cd ..

echo.
echo ========================================
echo           Launch Complete!
echo ========================================
echo.
echo ✅ City Work Web App is now running!
echo 🌐 URL: http://localhost:19006
echo.
echo 📝 Features available:
echo   - Job search and browsing
echo   - Company profiles
echo   - User authentication (mock data)
echo   - Messaging system
echo   - Full offline support
echo.
echo 💡 Tips:
echo   - The app uses mock data for offline testing
echo   - All features work without backend connection
echo   - Close the terminal window to stop the service
echo.
echo ========================================
echo Application launched successfully!
echo You can now use City Work in your browser.
echo ========================================
echo.
pause