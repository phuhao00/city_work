@echo off
echo ========================================
echo        City Work 项目一键启动
echo ========================================
echo.

echo [1/4] 启动数据库服务 (Docker)...
docker-compose up -d mongodb elasticsearch redis
if %errorlevel% neq 0 (
    echo 错误: Docker服务启动失败，请确保Docker已安装并运行
    pause
    exit /b 1
)

echo [2/4] 等待数据库服务启动完成...
timeout /t 10 /nobreak > nul

echo [3/4] 安装后端依赖并启动后端服务...
cd backend
if not exist node_modules (
    echo 安装后端依赖...
    call npm install
)
start "Backend Server" cmd /k "npm run start:dev"
cd ..

echo [4/4] 安装前端依赖并启动前端Web服务...
cd frontend
if not exist node_modules (
    echo 安装前端依赖...
    call npm install
)

echo 启动前端Web服务...
start "Frontend Web Server" cmd /k "npm run web"

echo 等待前端服务启动...
timeout /t 8 /nobreak > nul

echo 正在浏览器中打开应用...
start http://localhost:19006

cd ..

echo.
echo ========================================
echo           启动完成！
echo ========================================
echo 🌐 前端Web应用: http://localhost:19006 (已自动打开)
echo 🔧 后端API服务: http://localhost:3000
echo 📊 数据库管理:
echo   - MongoDB: localhost:27017
echo   - Elasticsearch: http://localhost:9200
echo   - Redis Commander: http://localhost:8081
echo   - Kibana: http://localhost:5601
echo ========================================
echo.
echo ✅ 项目已完全启动，您可以直接在浏览器中使用应用！
echo 按任意键退出启动脚本（不会关闭服务）...
pause > nul