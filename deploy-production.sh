#!/bin/bash

# City Work 平台 - 生产环境部署脚本
# 版本: v2.0
# 作者: City Work 开发团队

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查系统要求
check_requirements() {
    log_info "检查系统要求..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    log_success "系统要求检查通过"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    mkdir -p uploads
    mkdir -p logs
    mkdir -p nginx/ssl
    mkdir -p nginx/logs
    mkdir -p monitoring
    mkdir -p backups
    
    log_success "目录创建完成"
}

# 设置环境变量
setup_environment() {
    log_info "设置环境变量..."
    
    if [ ! -f .env.production ]; then
        log_warning ".env.production 文件不存在，使用默认配置"
        cp .env.example .env.production 2>/dev/null || true
    fi
    
    # 生成随机密钥
    if ! grep -q "JWT_SECRET=" .env.production; then
        JWT_SECRET=$(openssl rand -base64 32)
        echo "JWT_SECRET=$JWT_SECRET" >> .env.production
    fi
    
    if ! grep -q "SESSION_SECRET=" .env.production; then
        SESSION_SECRET=$(openssl rand -base64 32)
        echo "SESSION_SECRET=$SESSION_SECRET" >> .env.production
    fi
    
    log_success "环境变量设置完成"
}

# 构建应用
build_application() {
    log_info "构建应用..."
    
    # 构建后端
    log_info "构建后端应用..."
    cd backend
    npm install --production
    npm run build 2>/dev/null || log_warning "后端构建跳过"
    cd ..
    
    # 构建前端
    log_info "构建前端应用..."
    cd frontend
    npm install --production
    npm run build 2>/dev/null || log_warning "前端构建跳过"
    cd ..
    
    log_success "应用构建完成"
}

# 启动数据库服务
start_databases() {
    log_info "启动数据库服务..."
    
    # 启动MongoDB
    docker-compose -f docker-compose.production.yml up -d mongodb
    
    # 启动Redis
    docker-compose -f docker-compose.production.yml up -d redis
    
    # 启动Elasticsearch
    docker-compose -f docker-compose.production.yml up -d elasticsearch
    
    # 等待数据库启动
    log_info "等待数据库服务启动..."
    sleep 30
    
    log_success "数据库服务启动完成"
}

# 初始化数据库
initialize_database() {
    log_info "初始化数据库..."
    
    # 等待MongoDB完全启动
    until docker exec citywork_mongodb mongosh --eval "print('MongoDB is ready')" &>/dev/null; do
        log_info "等待MongoDB启动..."
        sleep 5
    done
    
    # 运行数据库初始化脚本
    if [ -f mongo-init.js ]; then
        docker exec -i citywork_mongodb mongosh citywork < mongo-init.js
        log_success "MongoDB初始化完成"
    fi
    
    # 等待Elasticsearch完全启动
    until curl -s http://localhost:9200/_cluster/health &>/dev/null; do
        log_info "等待Elasticsearch启动..."
        sleep 5
    done
    
    log_success "数据库初始化完成"
}

# 启动应用服务
start_application() {
    log_info "启动应用服务..."
    
    # 启动后端服务
    docker-compose -f docker-compose.production.yml up -d backend
    
    # 启动前端服务
    docker-compose -f docker-compose.production.yml up -d frontend
    
    # 启动Nginx
    docker-compose -f docker-compose.production.yml up -d nginx
    
    log_success "应用服务启动完成"
}

# 启动监控服务
start_monitoring() {
    log_info "启动监控服务..."
    
    # 启动Prometheus
    docker-compose -f docker-compose.production.yml up -d prometheus
    
    # 启动Grafana
    docker-compose -f docker-compose.production.yml up -d grafana
    
    log_success "监控服务启动完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 检查后端API
    for i in {1..30}; do
        if curl -s http://localhost:3000/api/health &>/dev/null; then
            log_success "后端API健康检查通过"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "后端API健康检查失败"
            return 1
        fi
        sleep 2
    done
    
    # 检查前端应用
    for i in {1..30}; do
        if curl -s http://localhost:19006 &>/dev/null; then
            log_success "前端应用健康检查通过"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "前端应用健康检查失败"
            return 1
        fi
        sleep 2
    done
    
    # 检查数据库连接
    if docker exec citywork_mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
        log_success "MongoDB连接检查通过"
    else
        log_error "MongoDB连接检查失败"
        return 1
    fi
    
    # 检查Redis连接
    if docker exec citywork_redis redis-cli ping &>/dev/null; then
        log_success "Redis连接检查通过"
    else
        log_error "Redis连接检查失败"
        return 1
    fi
    
    log_success "所有健康检查通过"
}

# 显示部署信息
show_deployment_info() {
    log_success "🎉 City Work 平台部署完成！"
    echo ""
    echo "📋 服务访问地址:"
    echo "  🌐 前端应用: http://localhost:19006"
    echo "  🔗 后端API: http://localhost:3000/api"
    echo "  📊 API文档: http://localhost:3000/api/docs"
    echo "  📈 监控面板: http://localhost:3001 (admin/admin123)"
    echo "  🔍 Prometheus: http://localhost:9090"
    echo ""
    echo "📋 数据库访问:"
    echo "  🍃 MongoDB: mongodb://admin:password123@localhost:27017"
    echo "  🔴 Redis: redis://localhost:6379"
    echo "  🔍 Elasticsearch: http://localhost:9200"
    echo ""
    echo "📋 管理命令:"
    echo "  查看日志: docker-compose -f docker-compose.production.yml logs -f"
    echo "  停止服务: docker-compose -f docker-compose.production.yml down"
    echo "  重启服务: docker-compose -f docker-compose.production.yml restart"
    echo ""
    log_success "平台已准备好为用户提供服务！"
}

# 错误处理
handle_error() {
    log_error "部署过程中发生错误，正在清理..."
    docker-compose -f docker-compose.production.yml down 2>/dev/null || true
    exit 1
}

# 主函数
main() {
    echo "🚀 City Work 平台 - 生产环境部署"
    echo "=================================="
    echo ""
    
    # 设置错误处理
    trap handle_error ERR
    
    # 执行部署步骤
    check_requirements
    create_directories
    setup_environment
    build_application
    start_databases
    initialize_database
    start_application
    start_monitoring
    health_check
    show_deployment_info
}

# 命令行参数处理
case "${1:-}" in
    "start")
        main
        ;;
    "stop")
        log_info "停止所有服务..."
        docker-compose -f docker-compose.production.yml down
        log_success "所有服务已停止"
        ;;
    "restart")
        log_info "重启所有服务..."
        docker-compose -f docker-compose.production.yml restart
        log_success "所有服务已重启"
        ;;
    "status")
        log_info "检查服务状态..."
        docker-compose -f docker-compose.production.yml ps
        ;;
    "logs")
        docker-compose -f docker-compose.production.yml logs -f
        ;;
    "backup")
        log_info "创建数据备份..."
        mkdir -p backups/$(date +%Y%m%d_%H%M%S)
        docker exec citywork_mongodb mongodump --out /tmp/backup
        docker cp citywork_mongodb:/tmp/backup backups/$(date +%Y%m%d_%H%M%S)/
        log_success "数据备份完成"
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs|backup}"
        echo ""
        echo "命令说明:"
        echo "  start   - 部署并启动所有服务"
        echo "  stop    - 停止所有服务"
        echo "  restart - 重启所有服务"
        echo "  status  - 查看服务状态"
        echo "  logs    - 查看服务日志"
        echo "  backup  - 创建数据备份"
        exit 1
        ;;
esac