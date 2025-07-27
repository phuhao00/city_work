/**
 * City Work Platform API Documentation
 * 
 * 这是City Work求职招聘平台的完整API文档
 * 包含所有端点、请求/响应格式、认证方式等详细信息
 */

# City Work Platform API Documentation

## 目录
- [概述](#概述)
- [认证](#认证)
- [错误处理](#错误处理)
- [速率限制](#速率限制)
- [用户管理](#用户管理)
- [职位管理](#职位管理)
- [公司管理](#公司管理)
- [申请管理](#申请管理)
- [消息系统](#消息系统)
- [搜索功能](#搜索功能)
- [文件上传](#文件上传)
- [通知系统](#通知系统)
- [数据分析](#数据分析)

## 概述

### 基础信息
- **基础URL**: `https://api.citywork.com/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 版本控制
当前API版本: `v1`
版本通过URL路径指定: `/v1/`

## 认证

### JWT Token认证
所有需要认证的API都使用JWT Token进行身份验证。

#### 获取Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

#### 使用Token
在请求头中包含Authorization字段:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 刷新Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 错误处理

### 标准错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细错误信息"
  }
}
```

### HTTP状态码
- `200` - 成功
- `201` - 创建成功
- `400` - 请求错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源不存在
- `409` - 资源冲突
- `422` - 验证失败
- `429` - 请求过于频繁
- `500` - 服务器错误

## 速率限制

### 限制规则
- **通用API**: 每15分钟100个请求
- **认证相关**: 每15分钟5次尝试
- **搜索API**: 每分钟30个请求
- **文件上传**: 每小时10次
- **消息发送**: 每分钟20条

### 响应头
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 用户管理

### 用户注册
```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三",
  "phone": "13800138000",
  "role": "user"
}
```

### 获取用户信息
```http
GET /users/profile
Authorization: Bearer {token}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "张三",
    "phone": "13800138000",
    "avatar": "https://cdn.citywork.com/avatars/user_123.jpg",
    "role": "user",
    "profile": {
      "title": "前端开发工程师",
      "experience": 3,
      "skills": ["React", "TypeScript", "Node.js"],
      "education": "本科",
      "location": "北京"
    },
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-12-01T00:00:00Z"
  }
}
```

### 更新用户信息
```http
PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "李四",
  "profile": {
    "title": "高级前端开发工程师",
    "experience": 5,
    "skills": ["React", "Vue", "TypeScript", "Node.js"]
  }
}
```

### 上传头像
```http
POST /users/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

avatar: [文件]
```

## 职位管理

### 获取职位列表
```http
GET /jobs?page=1&limit=20&category=tech&location=北京&salary_min=10000&salary_max=30000
```

**查询参数:**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)
- `category`: 职位类别
- `location`: 工作地点
- `salary_min`: 最低薪资
- `salary_max`: 最高薪资
- `experience`: 经验要求
- `company`: 公司ID
- `sort`: 排序方式 (created_at, salary, views)

**响应:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_123",
        "title": "前端开发工程师",
        "company": {
          "id": "company_456",
          "name": "科技有限公司",
          "logo": "https://cdn.citywork.com/logos/company_456.jpg"
        },
        "location": "北京",
        "salary": {
          "min": 15000,
          "max": 25000,
          "currency": "CNY"
        },
        "experience": "3-5年",
        "education": "本科",
        "skills": ["React", "TypeScript", "Node.js"],
        "description": "职位描述...",
        "requirements": "任职要求...",
        "benefits": ["五险一金", "弹性工作", "年终奖"],
        "type": "full_time",
        "remote": false,
        "urgent": false,
        "views": 1250,
        "applications": 45,
        "createdAt": "2023-12-01T00:00:00Z",
        "updatedAt": "2023-12-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### 获取职位详情
```http
GET /jobs/{jobId}
```

### 创建职位 (企业用户)
```http
POST /jobs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "前端开发工程师",
  "location": "北京",
  "salary": {
    "min": 15000,
    "max": 25000,
    "currency": "CNY"
  },
  "experience": "3-5年",
  "education": "本科",
  "skills": ["React", "TypeScript", "Node.js"],
  "description": "职位描述...",
  "requirements": "任职要求...",
  "benefits": ["五险一金", "弹性工作", "年终奖"],
  "type": "full_time",
  "remote": false,
  "urgent": false
}
```

### 更新职位
```http
PUT /jobs/{jobId}
Authorization: Bearer {token}
Content-Type: application/json
```

### 删除职位
```http
DELETE /jobs/{jobId}
Authorization: Bearer {token}
```

## 公司管理

### 获取公司列表
```http
GET /companies?page=1&limit=20&industry=tech&location=北京&size=medium
```

### 获取公司详情
```http
GET /companies/{companyId}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "company_456",
    "name": "科技有限公司",
    "logo": "https://cdn.citywork.com/logos/company_456.jpg",
    "industry": "互联网",
    "size": "100-500人",
    "location": "北京",
    "website": "https://company.com",
    "description": "公司简介...",
    "culture": "企业文化...",
    "benefits": ["五险一金", "弹性工作", "年终奖"],
    "rating": 4.5,
    "reviews": 128,
    "jobs": {
      "active": 15,
      "total": 45
    },
    "founded": "2015",
    "employees": 350,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-12-01T00:00:00Z"
  }
}
```

### 创建公司档案 (企业用户)
```http
POST /companies
Authorization: Bearer {token}
Content-Type: application/json
```

### 更新公司信息
```http
PUT /companies/{companyId}
Authorization: Bearer {token}
Content-Type: application/json
```

## 申请管理

### 申请职位
```http
POST /applications
Authorization: Bearer {token}
Content-Type: application/json

{
  "jobId": "job_123",
  "coverLetter": "求职信内容...",
  "resume": "resume_file_id"
}
```

### 获取我的申请
```http
GET /applications/my?status=pending&page=1&limit=20
Authorization: Bearer {token}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app_789",
        "job": {
          "id": "job_123",
          "title": "前端开发工程师",
          "company": {
            "name": "科技有限公司",
            "logo": "https://cdn.citywork.com/logos/company_456.jpg"
          }
        },
        "status": "pending",
        "coverLetter": "求职信内容...",
        "appliedAt": "2023-12-01T00:00:00Z",
        "updatedAt": "2023-12-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

### 获取职位申请 (企业用户)
```http
GET /jobs/{jobId}/applications
Authorization: Bearer {token}
```

### 更新申请状态 (企业用户)
```http
PUT /applications/{applicationId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "interview",
  "note": "邀请面试"
}
```

## 消息系统

### 获取对话列表
```http
GET /messages/conversations
Authorization: Bearer {token}
```

### 获取对话消息
```http
GET /messages/conversations/{conversationId}?page=1&limit=50
Authorization: Bearer {token}
```

### 发送消息
```http
POST /messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversationId": "conv_123",
  "content": "消息内容",
  "type": "text"
}
```

### 标记消息已读
```http
PUT /messages/{messageId}/read
Authorization: Bearer {token}
```

## 搜索功能

### 综合搜索
```http
GET /search?q=前端开发&type=jobs&location=北京&page=1&limit=20
```

**查询参数:**
- `q`: 搜索关键词
- `type`: 搜索类型 (jobs, companies, users)
- `location`: 地点筛选
- `page`: 页码
- `limit`: 每页数量

### 智能推荐
```http
GET /recommendations/jobs
Authorization: Bearer {token}
```

### 搜索建议
```http
GET /search/suggestions?q=前端
```

## 文件上传

### 上传简历
```http
POST /files/resume
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [PDF文件]
```

### 上传头像
```http
POST /files/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [图片文件]
```

### 获取文件信息
```http
GET /files/{fileId}
Authorization: Bearer {token}
```

## 通知系统

### 获取通知列表
```http
GET /notifications?type=all&page=1&limit=20
Authorization: Bearer {token}
```

### 标记通知已读
```http
PUT /notifications/{notificationId}/read
Authorization: Bearer {token}
```

### 获取未读通知数量
```http
GET /notifications/unread-count
Authorization: Bearer {token}
```

### 推送通知设置
```http
PUT /notifications/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "pushToken": "expo_push_token",
  "preferences": {
    "jobAlerts": true,
    "messageNotifications": true,
    "applicationUpdates": true
  }
}
```

## 数据分析

### 用户统计 (管理员)
```http
GET /analytics/users?period=30d
Authorization: Bearer {token}
```

### 职位统计 (企业用户)
```http
GET /analytics/jobs/{jobId}
Authorization: Bearer {token}
```

### 申请统计
```http
GET /analytics/applications?period=7d
Authorization: Bearer {token}
```

## WebSocket连接

### 实时消息
```javascript
const ws = new WebSocket('wss://api.citywork.com/ws');

// 认证
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your_jwt_token'
}));

// 监听消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
};
```

### 消息类型
- `message`: 新消息
- `notification`: 通知
- `application_update`: 申请状态更新
- `job_alert`: 职位提醒

## SDK和示例

### JavaScript SDK
```javascript
import CityWorkAPI from 'citywork-api-sdk';

const api = new CityWorkAPI({
  baseURL: 'https://api.citywork.com/v1',
  token: 'your_jwt_token'
});

// 获取职位列表
const jobs = await api.jobs.list({
  page: 1,
  limit: 20,
  location: '北京'
});
```

### React Native示例
```javascript
import { CityWorkProvider, useJobs } from 'citywork-react-native';

function JobList() {
  const { jobs, loading, error } = useJobs({
    location: '北京',
    category: 'tech'
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <FlatList
      data={jobs}
      renderItem={({ item }) => <JobCard job={item} />}
    />
  );
}
```

## 更新日志

### v1.2.0 (2023-12-01)
- 新增数据分析API
- 优化搜索性能
- 增加WebSocket支持

### v1.1.0 (2023-11-01)
- 新增通知系统
- 增加文件上传功能
- 优化认证流程

### v1.0.0 (2023-10-01)
- 初始版本发布
- 基础用户、职位、公司管理
- 申请和消息系统

## 联系我们

- **技术支持**: tech@citywork.com
- **API问题**: api@citywork.com
- **文档反馈**: docs@citywork.com

---

*最后更新: 2023-12-01*