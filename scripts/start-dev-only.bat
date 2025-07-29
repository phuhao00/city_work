@echo off
echo ========================================
echo     City Work 开发环境快速启动
echo ========================================
echo.

echo [1/2] 启动后端开发服务器...
cd backend
start "Backend Dev Server" cmd /k "npm run start:dev"
cd ..

echo [2/2] 启动前端开发服务器...
cd frontend
start "Frontend Dev Server" cmd /k "npm start"
cd ..

echo.
echo ========================================
echo        开发服务器启动完成！
echo ========================================
echo 后端服务: http://localhost:3000
echo 前端服务: 请查看Expo开发工具
echo.
echo 注意: 此脚本仅启动前后端服务
echo 如需数据库，请先运行 start-project.bat
echo ========================================
echo.
pause