# City Work - 城市工作平台

一个现代化的求职招聘平台，集成了 MongoDB、Elasticsearch 和 Redis。

## 技术栈

### 后端
- **NestJS** - Node.js 框架
- **MongoDB** - 主数据库
- **Elasticsearch** - 搜索引擎
- **Redis** - 缓存和会话存储
- **JWT** - 身份认证
- **Swagger** - API 文档

### 前端
- **React Native** - 移动应用框架
- **Redux Toolkit** - 状态管理
- **React Navigation** - 导航
- **TypeScript** - 类型安全

## 快速开始

### 1. 启动数据库服务

使用 Docker Compose 启动 MongoDB、Elasticsearch 和 Redis：

```bash
docker-compose up -d
```

这将启动以下服务：
- **MongoDB**: `localhost:27017`
- **Elasticsearch**: `localhost:9200`
- **Redis**: `localhost:6379`
- **Kibana** (可选): `localhost:5601`
- **Redis Commander** (可选): `localhost:8081`

### 2. 后端设置

```bash
cd backend
npm install
npm run start:dev
```

后端将在 `http://localhost:3000` 启动。

API 文档可在 `http://localhost:3000/api` 查看。

### 3. 前端设置

```bash
cd frontend
npm install
npm start
```

## 环境变量

后端需要以下环境变量（已在 `.env` 文件中配置）：

```env
# Database
MONGODB_URI=mongodb://admin:password123@localhost:27017/city_work?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=elastic123

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
```

## 数据库架构

### MongoDB 集合

1. **users** - 用户信息
2. **companies** - 公司信息
3. **jobs** - 职位信息
4. **applications** - 求职申请
5. **savedjobs** - 收藏的职位
6. **messages** - 消息

### Elasticsearch 索引

1. **jobs** - 职位搜索索引
2. **companies** - 公司搜索索引
3. **users** - 用户搜索索引

## API 端点

### 认证
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录

### 用户
- `GET /users` - 获取用户列表
- `GET /users/:id` - 获取用户详情
- `PUT /users/:id` - 更新用户信息

### 公司
- `GET /companies` - 获取公司列表
- `POST /companies` - 创建公司
- `GET /companies/:id` - 获取公司详情

### 职位
- `GET /jobs` - 获取职位列表
- `POST /jobs` - 发布职位
- `GET /jobs/:id` - 获取职位详情
- `POST /jobs/:id/apply` - 申请职位
- `POST /jobs/:id/save` - 收藏职位

### 搜索
- `GET /search/jobs?q=keyword` - 搜索职位
- `GET /search/companies?q=keyword` - 搜索公司
- `GET /search/users?q=keyword` - 搜索用户

### 消息
- `POST /messaging/send` - 发送消息
- `GET /messaging/conversations` - 获取对话列表
- `GET /messaging/conversation/:userId` - 获取与特定用户的对话

## 功能特性

### 已实现功能
- ✅ 用户注册和登录
- ✅ JWT 身份认证
- ✅ 职位发布和管理
- ✅ 公司信息管理
- ✅ 职位申请系统
- ✅ 职位收藏功能
- ✅ 全文搜索（Elasticsearch）
- ✅ 实时消息系统
- ✅ Redis 缓存
- ✅ API 文档（Swagger）

### 计划功能
- 📋 文件上传（简历、头像）
- 📋 邮件通知
- 📋 实时聊天（WebSocket）
- 📋 推荐算法
- 📋 数据分析面板

## 开发工具

### 数据库管理
- **MongoDB Compass**: 连接到 `mongodb://admin:password123@localhost:27017`
- **Kibana**: 访问 `http://localhost:5601` 管理 Elasticsearch
- **Redis Commander**: 访问 `http://localhost:8081` 管理 Redis

### API 测试
- **Swagger UI**: `http://localhost:3000/api`
- **Postman**: 导入 API 集合进行测试

## 项目结构

```
city_work/
├── frontend/                # React Native 前端应用
│   ├── src/
│   │   ├── assets/          # 图片、字体等静态资源
│   │   ├── components/      # 可复用UI组件
│   │   ├── features/        # 按功能模块组织的代码
│   │   ├── hooks/           # 自定义React Hooks
│   │   ├── navigation/      # 导航配置
│   │   ├── services/        # API服务和数据获取
│   │   ├── store/           # Redux状态管理
│   │   ├── theme/           # 主题和样式
│   │   └── utils/           # 工具函数
│   ├── App.tsx              # 应用入口
│   └── package.json         # 依赖配置
│
├── backend/                 # NestJS 后端应用
│   ├── src/
│   │   ├── auth/            # 认证模块
│   │   ├── jobs/            # 职位相关功能
│   │   ├── users/           # 用户管理
│   │   ├── companies/       # 公司信息
│   │   ├── messaging/       # 消息和通知
│   │   ├── search/          # 搜索功能
│   │   └── common/          # 共享代码
│   ├── prisma/              # 数据库模型和迁移
│   └── package.json         # 依赖配置
│
├── docs/                    # 项目文档
├── .github/                 # GitHub Actions配置
└── docker/                  # Docker配置文件
```

## 部署

### 生产环境部署

1. 更新环境变量为生产环境配置
2. 构建应用：
   ```bash
   cd backend && npm run build
   cd frontend && npm run build
   ```
3. 使用 PM2 或 Docker 部署

### Docker 部署

```bash
# 构建镜像
docker build -t city-work-backend ./backend
docker build -t city-work-frontend ./frontend

# 运行容器
docker-compose -f docker-compose.prod.yml up -d
```

## 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。