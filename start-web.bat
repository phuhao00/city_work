@echo off
echo ========================================
echo     City Work Web版本快速启动
echo ========================================
echo.

echo [1/3] 启动数据库服务 (Docker)...
docker-compose up -d mongodb elasticsearch redis
if %errorlevel% neq 0 (
    echo 警告: Docker服务启动失败，将使用模拟数据模式
    echo.
)

echo [2/3] 启动后端服务...
cd backend
if not exist node_modules (
    echo 安装后端依赖...
    call npm install
)
start "Backend API Server" cmd /k "npm run start:dev"
cd ..

echo 等待后端服务启动...
timeout /t 5 /nobreak > nul

echo [3/3] 启动前端Web应用...
cd frontend
if not exist node_modules (
    echo 安装前端依赖...
    call npm install
)

echo 启动Web应用...
start "City Work Web App" cmd /k "npm run web"

echo 等待Web应用启动...
timeout /t 10 /nobreak > nul

echo 正在浏览器中打开应用...
start http://localhost:19006

cd ..

echo.
echo ========================================
echo           🎉 启动完成！
echo ========================================
echo.
echo 🌐 Web应用已在浏览器中打开: http://localhost:19006
echo 🔧 后端API服务: http://localhost:3000
echo.
echo ✅ 您现在可以直接在浏览器中使用City Work应用！
echo.
echo 📝 注意事项:
echo   - 如果Docker服务未启动，应用将使用模拟数据
echo   - 首次启动可能需要更长时间来安装依赖
echo   - 如果浏览器未自动打开，请手动访问: http://localhost:19006
echo.
echo ========================================
echo 按任意键退出启动脚本（不会关闭服务）...
pause > nul