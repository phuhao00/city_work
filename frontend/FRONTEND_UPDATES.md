# City Work Frontend - Updated Architecture

## 概述

前端已更新以匹配新的 MongoDB 后端架构，包含完整的 Redux Toolkit 状态管理和现代化的组件结构。

## 主要更新

### 1. Redux 状态管理
- **Auth Slice**: 用户认证和授权管理
- **Jobs Slice**: 职位搜索、申请和收藏功能
- **Companies Slice**: 公司信息管理
- **Messaging Slice**: 消息和对话功能
- **Search Slice**: 统一搜索功能（支持 Elasticsearch）

### 2. 类型定义
- 统一的 TypeScript 接口定义 (`src/types/index.ts`)
- 与后端 MongoDB 模型完全匹配的数据结构

### 3. 工具函数
- **验证**: 邮箱、密码、电话等验证函数
- **格式化**: 日期、薪资、文件大小等格式化函数
- **存储**: AsyncStorage 封装和便捷方法

### 4. 配置管理
- 环境配置 (`src/config/index.ts`)
- API 端点配置
- 主题和样式常量

### 5. 示例组件
- **LoginScreen**: 登录界面示例
- **JobListScreen**: 职位列表界面示例
- **SearchScreen**: 搜索界面示例

## 文件结构

```
src/
├── components/          # React 组件
│   ├── auth/           # 认证相关组件
│   ├── jobs/           # 职位相关组件
│   ├── search/         # 搜索相关组件
│   └── index.ts        # 组件导出
├── features/           # Redux 功能切片
│   ├── auth/           # 认证切片
│   ├── jobs/           # 职位切片
│   ├── companies/      # 公司切片
│   ├── messaging/      # 消息切片
│   └── search/         # 搜索切片
├── services/           # API 服务
│   └── api.ts          # RTK Query API 配置
├── store/              # Redux store 配置
│   └── index.ts        # Store 配置
├── types/              # TypeScript 类型定义
│   └── index.ts        # 统一类型导出
├── utils/              # 工具函数
│   ├── validation.ts   # 验证函数
│   ├── format.ts       # 格式化函数
│   ├── storage.ts      # 存储服务
│   └── index.ts        # 工具函数导出
└── config/             # 配置文件
    └── index.ts        # 应用配置
```

## 新增依赖

以下依赖已添加到 `package.json`:

- `@react-native-async-storage/async-storage`: 本地存储
- `react-native-vector-icons`: 图标库
- `react-native-paper`: Material Design 组件
- `react-native-elements`: UI 组件库
- `react-native-image-picker`: 图片选择器
- `react-native-document-picker`: 文档选择器

## 使用示例

### 1. 使用认证功能

```typescript
import { useLoginMutation } from '../features/auth/authSlice';

const [login, { isLoading }] = useLoginMutation();

const handleLogin = async () => {
  try {
    const result = await login({ email, password }).unwrap();
    // 登录成功
  } catch (error) {
    // 处理错误
  }
};
```

### 2. 获取职位列表

```typescript
import { useGetJobsQuery } from '../features/jobs/jobsSlice';

const { data: jobsData, isLoading } = useGetJobsQuery({
  page: 1,
  limit: 10,
  location: 'Beijing',
});
```

### 3. 搜索功能

```typescript
import { useSearchJobsQuery } from '../features/search/searchSlice';

const { data: searchResults } = useSearchJobsQuery({
  query: 'React Developer',
  location: 'Shanghai',
});
```

## 下一步

1. 安装新增的依赖包
2. 配置导航路由
3. 实现完整的 UI 组件
4. 添加错误处理和加载状态
5. 实现推送通知和实时消息功能

## 注意事项

- 所有 API 调用都使用 RTK Query 进行缓存和状态管理
- 数据模型已更新以匹配 MongoDB 的 `_id` 字段
- 组件使用 TypeScript 进行类型安全
- 样式使用统一的主题配置