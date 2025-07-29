# City Work 项目脚本管理

本目录包含了 City Work 项目的所有启动、部署和管理脚本。

## 📁 脚本分类

### 🚀 启动脚本 (Development)
- `start-project.bat/sh` - 完整项目启动（包含数据库）
- `start-dev-only.bat` - 仅启动前后端开发服务器
- `start-web.bat` - Web版本启动（包含数据库）
- `start-web-quick.bat` - 快速Web启动
- `launch-web.bat` - 自动Web启动器
- `start-complete-platform.bat` - 完整平台启动

### 🛠️ 部署脚本 (Production)
- `deploy-production.bat/sh` - 生产环境部署脚本

### ⏹️ 管理脚本 (Management)
- `stop-project.bat` - 停止所有项目服务
- `start-full.js` - Node.js版本的完整启动脚本

## 🎯 使用指南

### 开发环境快速启动
```bash
# Windows
start-dev-only.bat

# Linux/Mac
./start-project.sh
```

### Web版本快速体验
```bash
# Windows
launch-web.bat
```

### 完整项目启动（推荐）
```bash
# Windows
start-project.bat

# Linux/Mac
./start-project.sh
```

### 生产环境部署
```bash
# Windows
deploy-production.bat

# Linux/Mac
./deploy-production.sh
```

## 📋 脚本功能对比

| 脚本名称 | 数据库 | 后端 | 前端 | 自动打开浏览器 | 适用场景 |
|---------|--------|------|------|----------------|----------|
| start-project | ✅ | ✅ | ✅ | ✅ | 完整开发 |
| start-dev-only | ❌ | ✅ | ✅ | ❌ | 纯前后端开发 |
| start-web | ✅ | ✅ | ✅(Web) | ✅ | Web版本开发 |
| launch-web | ❌ | ❌ | ✅(Web) | ✅ | 快速Web体验 |
| start-complete-platform | ❌ | ✅ | ✅ | ✅ | 演示展示 |

## 🔧 维护说明

### 脚本更新原则
1. 保持向后兼容性
2. 统一错误处理
3. 添加详细的日志输出
4. 支持跨平台（Windows/Linux/Mac）

### 新增脚本规范
1. 文件命名：`功能-用途.bat/sh`
2. 添加脚本头部注释
3. 包含错误处理逻辑
4. 更新本README文档

## 🚨 常见问题

### Docker相关
- 确保Docker Desktop已安装并运行
- 检查端口占用情况（3000, 19006, 27017等）

### 依赖安装
- 首次运行会自动安装依赖
- 如遇到问题，可手动删除node_modules重新安装

### 端口冲突
- 后端默认端口：3000
- 前端默认端口：19006
- 数据库端口：27017 (MongoDB), 9200 (Elasticsearch), 6379 (Redis)

## 📞 技术支持

如遇到脚本相关问题，请检查：
1. 系统环境要求
2. 依赖安装状态
3. 端口占用情况
4. Docker服务状态