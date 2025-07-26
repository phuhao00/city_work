#!/bin/bash

echo "========================================"
echo "        City Work 项目一键启动"
echo "========================================"
echo

echo "[1/4] 启动数据库服务 (Docker)..."
docker-compose up -d mongodb elasticsearch redis
if [ $? -ne 0 ]; then
    echo "错误: Docker服务启动失败，请确保Docker已安装并运行"
    exit 1
fi

echo "[2/4] 等待数据库服务启动完成..."
sleep 10

echo "[3/4] 安装后端依赖并启动后端服务..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install
fi
npm run start:dev &
BACKEND_PID=$!
cd ..

echo "[4/4] 安装前端依赖并启动前端服务..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi
npm start &
FRONTEND_PID=$!
cd ..

echo
echo "========================================"
echo "           启动完成！"
echo "========================================"
echo "后端服务: http://localhost:3000"
echo "前端服务: 请查看Expo开发工具"
echo "数据库管理:"
echo "  - MongoDB: localhost:27017"
echo "  - Elasticsearch: http://localhost:9200"
echo "  - Redis Commander: http://localhost:8081"
echo "  - Kibana: http://localhost:5601"
echo "========================================"
echo
echo "进程ID:"
echo "  - 后端: $BACKEND_PID"
echo "  - 前端: $FRONTEND_PID"
echo
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap 'echo "正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose down; exit' INT
wait