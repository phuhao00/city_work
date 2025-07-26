@echo off
setlocal enabledelayedexpansion

REM City Work 平台 - Windows生产环境部署脚本
REM 版本: v2.0
REM 作者: City Work 开发团队

title City Work 平台 - 生产环境部署

echo.
echo ========================================
echo 🚀 City Work 平台 - 生产环境部署
echo ========================================
echo.

REM 检查系统要求
echo [INFO] 检查系统要求...

REM 检查Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

REM 检查Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose 未安装，请先安装 Docker Compose
    pause
    exit /b 1
)

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm 未安装，请先安装 npm
    pause
    exit /b 1
)

echo [SUCCESS] 系统要求检查通过
echo.

REM 创建必要的目录
echo [INFO] 创建必要的目录...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "nginx" mkdir nginx
if not exist "nginx\ssl" mkdir nginx\ssl
if not exist "nginx\logs" mkdir nginx\logs
if not exist "monitoring" mkdir monitoring
if not exist "backups" mkdir backups
echo [SUCCESS] 目录创建完成
echo.

REM 设置环境变量
echo [INFO] 设置环境变量...
if not exist ".env.production" (
    echo [WARNING] .env.production 文件不存在，使用默认配置
    if exist ".env.example" copy ".env.example" ".env.production" >nul
)
echo [SUCCESS] 环境变量设置完成
echo.

REM 构建应用
echo [INFO] 构建应用...

REM 构建后端
echo [INFO] 构建后端应用...
cd backend
call npm install --production
call npm run build 2>nul || echo [WARNING] 后端构建跳过
cd ..

REM 构建前端
echo [INFO] 构建前端应用...
cd frontend
call npm install --production
call npm run build 2>nul || echo [WARNING] 前端构建跳过
cd ..

echo [SUCCESS] 应用构建完成
echo.

REM 启动数据库服务
echo [INFO] 启动数据库服务...
docker-compose -f docker-compose.production.yml up -d mongodb
docker-compose -f docker-compose.production.yml up -d redis
docker-compose -f docker-compose.production.yml up -d elasticsearch

echo [INFO] 等待数据库服务启动...
timeout /t 30 /nobreak >nul
echo [SUCCESS] 数据库服务启动完成
echo.

REM 初始化数据库
echo [INFO] 初始化数据库...
echo [INFO] 等待MongoDB完全启动...

REM 等待MongoDB启动
:wait_mongodb
docker exec citywork_mongodb mongosh --eval "print('MongoDB is ready')" >nul 2>&1
if errorlevel 1 (
    echo [INFO] 等待MongoDB启动...
    timeout /t 5 /nobreak >nul
    goto wait_mongodb
)

REM 运行数据库初始化脚本
if exist "mongo-init.js" (
    docker exec -i citywork_mongodb mongosh citywork < mongo-init.js
    echo [SUCCESS] MongoDB初始化完成
)

REM 等待Elasticsearch启动
echo [INFO] 等待Elasticsearch完全启动...
:wait_elasticsearch
curl -s http://localhost:9200/_cluster/health >nul 2>&1
if errorlevel 1 (
    echo [INFO] 等待Elasticsearch启动...
    timeout /t 5 /nobreak >nul
    goto wait_elasticsearch
)

echo [SUCCESS] 数据库初始化完成
echo.

REM 启动应用服务
echo [INFO] 启动应用服务...
docker-compose -f docker-compose.production.yml up -d backend
docker-compose -f docker-compose.production.yml up -d frontend
docker-compose -f docker-compose.production.yml up -d nginx
echo [SUCCESS] 应用服务启动完成
echo.

REM 启动监控服务
echo [INFO] 启动监控服务...
docker-compose -f docker-compose.production.yml up -d prometheus
docker-compose -f docker-compose.production.yml up -d grafana
echo [SUCCESS] 监控服务启动完成
echo.

REM 健康检查
echo [INFO] 执行健康检查...

REM 检查后端API
set /a count=0
:check_backend
set /a count+=1
curl -s http://localhost:3000/api/health >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] 后端API健康检查通过
    goto check_frontend
)
if !count! geq 30 (
    echo [ERROR] 后端API健康检查失败
    goto error_exit
)
timeout /t 2 /nobreak >nul
goto check_backend

:check_frontend
REM 检查前端应用
set /a count=0
:check_frontend_loop
set /a count+=1
curl -s http://localhost:19006 >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] 前端应用健康检查通过
    goto check_databases
)
if !count! geq 30 (
    echo [ERROR] 前端应用健康检查失败
    goto error_exit
)
timeout /t 2 /nobreak >nul
goto check_frontend_loop

:check_databases
REM 检查数据库连接
docker exec citywork_mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] MongoDB连接检查通过
) else (
    echo [ERROR] MongoDB连接检查失败
    goto error_exit
)

docker exec citywork_redis redis-cli ping >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] Redis连接检查通过
) else (
    echo [ERROR] Redis连接检查失败
    goto error_exit
)

echo [SUCCESS] 所有健康检查通过
echo.

REM 显示部署信息
echo ========================================
echo 🎉 City Work 平台部署完成！
echo ========================================
echo.
echo 📋 服务访问地址:
echo   🌐 前端应用: http://localhost:19006
echo   🔗 后端API: http://localhost:3000/api
echo   📊 API文档: http://localhost:3000/api/docs
echo   📈 监控面板: http://localhost:3001 (admin/admin123)
echo   🔍 Prometheus: http://localhost:9090
echo.
echo 📋 数据库访问:
echo   🍃 MongoDB: mongodb://admin:password123@localhost:27017
echo   🔴 Redis: redis://localhost:6379
echo   🔍 Elasticsearch: http://localhost:9200
echo.
echo 📋 管理命令:
echo   查看日志: docker-compose -f docker-compose.production.yml logs -f
echo   停止服务: docker-compose -f docker-compose.production.yml down
echo   重启服务: docker-compose -f docker-compose.production.yml restart
echo.
echo [SUCCESS] 平台已准备好为用户提供服务！
echo.

REM 询问是否打开浏览器
set /p open_browser="是否打开浏览器查看应用？(Y/N): "
if /i "!open_browser!"=="Y" (
    start http://localhost:19006
    start http://localhost:3000/api
)

echo.
echo 按任意键退出...
pause >nul
goto :eof

:error_exit
echo [ERROR] 部署过程中发生错误，正在清理...
docker-compose -f docker-compose.production.yml down >nul 2>&1
echo.
echo 按任意键退出...
pause >nul
exit /b 1