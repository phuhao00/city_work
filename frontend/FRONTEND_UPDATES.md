# City Work Frontend - Updated Architecture

## 概述

前端已更新以匹配新的 MongoDB 后端架构，包含完整的 Redux Toolkit 状态管理和现代化的组件结构。最新更新包括增强的 Feed 功能，支持帖子创建、搜索和交互。

## 主要更新

### 1. Redux 状态管理
- **Auth Slice**: 用户认证和授权管理
- **Jobs Slice**: 职位搜索、申请和收藏功能
- **Companies Slice**: 公司信息管理
- **Messaging Slice**: 消息和对话功能
- **Search Slice**: 统一搜索功能（支持 Elasticsearch）

### 2. Feed 功能 (最新更新)
- **FeedScreen**: 增强的社交动态界面
  - 搜索功能（支持内容和标签搜索）
  - 帖子类型过滤（工作、活动、讨论、公告）
  - 点赞和交互功能
  - 响应式设计
- **CreatePostModal**: 帖子创建模态框
  - 多种帖子类型支持
  - 标签系统
  - 实时预览功能
  - 表单验证

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
│   ├── feed/           # Feed 相关组件 (新增)
│   │   ├── FeedScreen.tsx      # 主要 Feed 界面
│   │   └── CreatePostModal.tsx # 创建帖子模态框
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

### 3. Feed 功能使用

```typescript
import { FeedScreen } from '../components/feed/FeedScreen';
import { CreatePostModal } from '../components/feed/CreatePostModal';

// 在 Feed 界面中搜索帖子
const handleSearch = (query: string) => {
  const filtered = feedData.filter(item =>
    item.content.toLowerCase().includes(query.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );
  setFilteredData(filtered);
};

// 创建新帖子
const handleCreatePost = (postData: {
  content: string;
  type: 'job' | 'event' | 'discussion' | 'announcement';
  tags: string[];
}) => {
  // 处理帖子创建逻辑
  console.log('Creating post:', postData);
};
```

### 4. 搜索功能

```typescript
import { useSearchJobsQuery } from '../features/search/searchSlice';

const { data: searchResults } = useSearchJobsQuery({
  query: 'React Developer',
  location: 'Shanghai',
});
```

## 最新功能更新

### 🚀 高级功能实现

#### 1. 通知系统 (`src/components/notifications/`)
- **NotificationsScreen.tsx**: 全面的通知管理
  - 实时通知显示
  - 基于类别的过滤（工作、消息、系统）
  - 标记为已读/未读功能
  - 批量操作（全部标记为已读、删除）
  - 通知设置和偏好
  - 推送通知支持

#### 2. 公司档案页面 (`src/components/companies/`)
- **CompanyProfileScreen.tsx**: 详细的公司信息展示
  - 公司概览和基本信息
  - 文化和价值观展示
  - 员工福利和待遇
  - 开放职位列表
  - 公司评价和评分
  - 关注/取消关注功能
  - 标签页界面（概览、职位、评价）

#### 3. 高级求职申请系统 (`src/components/applications/`)
- **ApplicationsScreen.tsx**: 完整的申请跟踪
  - 申请状态管理（待处理、审核中、面试、录用、拒绝、撤回）
  - 申请进度时间线视图
  - 个人笔记和提醒
  - 面试安排集成
  - 申请统计和分析
  - 记录导出功能

#### 4. 用户设置和偏好 (`src/components/settings/`)
- **SettingsScreen.tsx**: 全面的用户自定义
  - 通知偏好（邮件、推送、应用内）
  - 隐私和安全设置
  - 求职偏好（地点、薪资、类型）
  - 账户管理（档案、密码、删除）
  - 主题和显示选项
  - 语言和地区设置

#### 5. 分析仪表板 (`src/components/analytics/`)
- **CompanyAnalyticsScreen.tsx**: 企业商业智能
  - 职位发布性能指标
  - 申请和候选人分析
  - 招聘漏斗可视化
  - 招聘时间统计
  - 每次招聘成本计算
  - 趋势分析和预测
  - 自定义报告工具

## 下一步

1. 安装新增的依赖包
2. 配置导航路由
3. 实现完整的 UI 组件
4. 添加错误处理和加载状态
5. 实现推送通知和实时消息功能
6. 集成分析和报告功能
7. 优化性能和用户体验

## 注意事项

- 所有 API 调用都使用 RTK Query 进行缓存和状态管理
- 数据模型已更新以匹配 MongoDB 的 `_id` 字段
- 组件使用 TypeScript 进行类型安全
- 样式使用统一的主题配置
- 新增功能已集成到现有架构中
- 所有新组件都遵循现有的设计模式