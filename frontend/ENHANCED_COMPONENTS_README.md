# City Work 增强版界面组件

## 概述

这是 City Work 平台的增强版界面组件库，提供了现代化、用户友好的UI组件和屏幕，大幅提升了用户体验。

## 🎨 特性

### 视觉设计
- **现代化界面**: 采用Material Design设计语言
- **主题支持**: 完全支持深色/浅色主题切换
- **渐变效果**: 美观的渐变色彩搭配
- **动画效果**: 流畅的过渡动画和交互反馈
- **响应式设计**: 适配不同屏幕尺寸

### 用户体验
- **直观操作**: 简洁明了的操作流程
- **即时反馈**: 及时的操作反馈和状态提示
- **加载优化**: 优雅的加载动画和骨架屏
- **错误处理**: 友好的错误提示和重试机制
- **手势支持**: 支持下拉刷新、滑动等手势

### 性能优化
- **组件复用**: 高度可复用的组件设计
- **懒加载**: 按需加载组件和数据
- **内存优化**: 优化的内存使用和垃圾回收
- **缓存机制**: 智能的数据缓存策略

## 📦 组件库

### 基础UI组件

#### EnhancedButton
增强版按钮组件，支持多种样式和状态。

```typescript
<EnhancedButton
  title="立即申请"
  variant="primary"
  size="large"
  icon="paper-plane"
  loading={isLoading}
  onPress={handleApply}
/>
```

**属性:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient'
- `size`: 'small' | 'medium' | 'large'
- `loading`: boolean
- `disabled`: boolean
- `icon`: Ionicons图标名称

#### EnhancedInput
增强版输入框组件，带有浮动标签和动画效果。

```typescript
<EnhancedInput
  label="邮箱地址"
  value={email}
  onChangeText={setEmail}
  placeholder="请输入邮箱"
  icon="mail"
  variant="outlined"
  error={emailError}
/>
```

**属性:**
- `variant`: 'default' | 'filled' | 'outlined'
- `size`: 'small' | 'medium' | 'large'
- `icon`: Ionicons图标名称
- `error`: 错误信息
- `hint`: 提示信息

#### EnhancedCard
增强版卡片组件，支持多种样式和动画。

```typescript
<EnhancedCard
  variant="elevated"
  animated
  title="卡片标题"
  subtitle="副标题"
  icon="star"
  onPress={handlePress}
>
  <Text>卡片内容</Text>
</EnhancedCard>
```

**属性:**
- `variant`: 'default' | 'elevated' | 'outlined' | 'gradient'
- `animated`: boolean
- `title`: 标题
- `subtitle`: 副标题
- `icon`: Ionicons图标名称

#### BottomSheet
底部弹出层组件，支持手势操作和多个停靠点。

```typescript
<BottomSheet
  visible={showBottomSheet}
  onClose={() => setShowBottomSheet(false)}
  snapPoints={[300, 500]}
>
  <View>
    {/* 内容 */}
  </View>
</BottomSheet>
```

#### Toast
全局消息提示系统。

```typescript
toastManager.show({
  message: '操作成功',
  type: 'success',
  duration: 2000,
});
```

#### ThemeSwitcher
主题切换组件。

```typescript
<ThemeSwitcher
  size="medium"
  showLabel={true}
/>
```

#### Skeleton
骨架屏加载组件。

```typescript
<SkeletonCard />
<SkeletonJobCard />
<SkeletonProfile />
<SkeletonList itemCount={5} />
```

### 增强版屏幕组件

#### EnhancedHomeScreen
- 动态问候语
- 快捷操作按钮
- 统计概览
- 职位推荐
- 下拉刷新

#### EnhancedLoginScreen
- 动画过渡
- 输入验证
- 社交登录
- 错误处理

#### EnhancedJobListScreen
- 智能搜索
- 高级筛选
- 多种排序
- 视图切换
- 无限滚动

#### EnhancedJobDetailScreen
- 详细信息展示
- 申请流程
- 收藏分享
- 公司信息

#### EnhancedProfileScreen
- 个人资料管理
- 在线编辑
- 数据统计
- 快捷操作

#### EnhancedMyApplicationsScreen
- 申请状态跟踪
- 状态筛选
- 详情查看
- 操作管理

#### EnhancedSettingsScreen
- 主题切换
- 通知设置
- 安全设置
- 数据管理

#### ComponentShowcaseScreen
- 组件演示
- 功能展示
- 样式预览

## 🚀 快速开始

### 1. 导入组件

```typescript
import {
  EnhancedButton,
  EnhancedInput,
  EnhancedCard,
  BottomSheet,
  toastManager,
  ThemeSwitcher,
} from './components/ui';

import {
  EnhancedHomeScreen,
  EnhancedLoginScreen,
  EnhancedJobListScreen,
  ComponentShowcaseScreen,
} from './components';
```

### 2. 使用主题

```typescript
import { useTheme } from './hooks/useTheme';

const MyComponent = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>Hello World</Text>
      <ThemeSwitcher />
    </View>
  );
};
```

### 3. 运行演示应用

```typescript
import EnhancedApp from './EnhancedApp';

export default function App() {
  return <EnhancedApp />;
}
```

## 📱 屏幕截图

### 主页
- 现代化的欢迎界面
- 快捷操作按钮
- 数据统计卡片
- 职位推荐列表

### 职位列表
- 智能搜索功能
- 多维度筛选
- 列表/网格视图
- 骨架屏加载

### 个人中心
- 完整的用户信息
- 编辑功能
- 统计数据
- 设置入口

### 设置页面
- 主题切换
- 语言选择
- 通知设置
- 安全选项

## 🎯 设计原则

### 一致性
- 统一的设计语言
- 一致的交互模式
- 标准化的组件接口

### 可用性
- 直观的操作流程
- 清晰的视觉层次
- 友好的错误处理

### 可访问性
- 支持屏幕阅读器
- 合适的对比度
- 键盘导航支持

### 性能
- 优化的渲染性能
- 智能的数据加载
- 内存使用优化

## 🔧 技术栈

- **React Native**: 跨平台移动应用框架
- **TypeScript**: 类型安全的JavaScript
- **Expo**: 开发工具和服务
- **React Navigation**: 导航库
- **Redux Toolkit**: 状态管理
- **Ionicons**: 图标库
- **Animated API**: 动画系统

## 📚 API文档

### 主题系统

```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    gray: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}
```

### 组件属性

详细的组件属性文档请参考各组件的TypeScript接口定义。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- 项目主页: [City Work](https://github.com/citywork/app)
- 问题反馈: [Issues](https://github.com/citywork/app/issues)
- 邮箱: support@citywork.com

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和设计师！

---

**City Work Team** - 让求职更简单，让招聘更高效