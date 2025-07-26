# City Work 项目启动指南

## 一键启动脚本

本项目提供了多种启动方式，适应不同的开发需求：

### 1. 完整项目启动（推荐）

**Windows:**
```bash
# 双击运行或在命令行执行
start-project.bat
```

**Linux/Mac:**
```bash
# 添加执行权限
chmod +x start-project.sh
# 运行脚本
./start-project.sh
```

**Node.js方式:**
```bash
# 安装依赖
npm install
# 启动完整项目
npm run start:full
```

### 2. 仅开发服务器启动

如果数据库已经在运行，可以只启动前后端开发服务器：

**Windows:**
```bash
start-dev-only.bat
```

**Node.js方式:**
```bash
npm run start:dev
```

### 3. 停止所有服务

**Windows:**
```bash
stop-project.bat
```

**手动停止:**
```bash
# 停止Docker服务
docker-compose down

# 停止Node.js进程
# Windows: 在任务管理器中结束node.exe进程
# Linux/Mac: pkill node
```

## 服务地址

启动成功后，可以通过以下地址访问各个服务：

- **后端API**: http://localhost:3000
- **前端应用**: 通过Expo开发工具访问
- **MongoDB**: localhost:27017
- **Elasticsearch**: http://localhost:9200
- **Redis Commander**: http://localhost:8081
- **Kibana**: http://localhost:5601

## 前置要求

确保以下软件已安装：

1. **Node.js** (v16+)
2. **Docker** 和 **Docker Compose**
3. **npm** 或 **yarn**

## 首次运行

首次运行项目时，脚本会自动：

1. 启动Docker数据库服务
2. 安装前后端依赖（如果node_modules不存在）
3. 启动后端开发服务器
4. 启动前端开发服务器

## 故障排除

### Docker相关问题
- 确保Docker Desktop正在运行
- 检查端口是否被占用（27017, 9200, 6379等）

### Node.js相关问题
- 删除node_modules文件夹，重新运行脚本
- 检查Node.js版本是否符合要求

### 端口冲突
- 修改docker-compose.yml中的端口映射
- 修改后端配置文件中的端口设置

## 开发建议

- 使用 `start-dev-only.bat` 进行日常开发
- 数据库服务可以保持运行，避免重复启动
- 定期运行 `docker-compose down` 清理容器