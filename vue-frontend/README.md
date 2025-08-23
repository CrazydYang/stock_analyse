# 股票分析系统 - Vue前端框架

这是一个基于Vue 3 + TypeScript + Element Plus的股票分析系统前端框架，具有固定的侧边栏和顶栏布局，方便快速开发股票分析相关功能。

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📁 项目结构

```
src/
├── layouts/              # 布局组件
│   └── DefaultLayout.vue # 默认布局（包含侧边栏和顶栏）
├── views/               # 页面组件
│   ├── HomeView.vue     # 首页
│   ├── analysis/        # 分析相关页面
│   │   ├── TechnicalAnalysis.vue    # 技术分析
│   │   └── FundamentalAnalysis.vue  # 基本面分析
│   ├── PortfolioView.vue # 投资组合
│   └── SettingsView.vue  # 系统设置
├── router/              # 路由配置
├── components/          # 公共组件
└── assets/             # 静态资源
```

## 🎯 如何添加新功能

### 1. 添加新的菜单分类

在 `src/layouts/DefaultLayout.vue` 中修改 `menuItems` 数组：

```typescript
const menuItems = [
  {
    path: '/',
    title: '首页',
    icon: 'HomeFilled'
  },
  {
    path: '/your-category',
    title: '新分类',
    icon: 'YourIcon',
    children: [
      {
        path: '/your-category/sub-page',
        title: '子页面',
        icon: 'YourSubIcon'
      }
    ]
  }
]
```

### 2. 创建新页面

1. 在 `src/views/` 目录下创建新的Vue组件
2. 在 `src/router/index.ts` 中添加对应的路由配置

```typescript
{
  path: '/your-page',
  name: 'your-page',
  component: () => import('../views/YourPage.vue'),
  meta: { title: '页面标题' }
}
```

### 3. 页面模板示例

```vue
<template>
  <div class="your-page">
    <el-card class="page-header">
      <template #header>
        <span>页面标题</span>
      </template>
      
      <div class="page-content">
        <!-- 页面内容 -->
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑
</script>

<style scoped>
.your-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-content {
  margin-top: 20px;
}
</style>
```

## 🎨 内置功能

### ✅ 已集成功能

- **响应式布局**：适配桌面和移动设备
- **主题切换**：支持浅色/深色主题
- **侧边栏导航**：可折叠的侧边栏菜单
- **面包屑导航**：显示当前页面位置
- **用户菜单**：顶栏右侧用户操作菜单
- **Element Plus**：完整的UI组件库
- **图标库**：集成@element-plus/icons-vue

### 📊 现有页面功能

1. **首页** - 欢迎界面和功能导航
2. **技术分析** - K线图、技术指标、交易信号
3. **基本面分析** - 公司信息、财务指标、财务报表
4. **投资组合** - 持仓管理、收益统计、行业分布
5. **系统设置** - 用户设置、数据源配置、系统信息

## 🔧 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript
- **Vue Router** - 官方路由管理器
- **Element Plus** - 基于Vue 3的组件库
- **Vite** - 下一代前端构建工具

## 🌟 特色功能

### 侧边栏特性
- 自动折叠/展开
- 响应式宽度调整
- 图标支持
- 子菜单支持

### 顶栏特性
- 面包屑导航
- 用户头像和菜单
- 折叠/展开侧边栏按钮

### 页面模板
- 统一的卡片式布局
- 响应式设计
- 标准的间距和样式

## 📝 开发规范

### 命名规范
- 组件名使用PascalCase
- 文件名使用kebab-case
- 路由名使用kebab-case

### 样式规范
- 使用scoped样式避免污染
- 统一的类名前缀
- 标准的间距变量

### 代码规范
- 使用TypeScript
- 遵循Vue 3 Composition API
- 使用setup语法糖

## 🎯 下一步开发建议

1. **数据集成**：连接真实的股票数据API
2. **图表功能**：集成ECharts或TradingView
3. **用户认证**：添加登录注册功能
4. **数据持久化**：使用Pinia状态管理
5. **主题定制**：自定义主题颜色
6. **国际化**：添加多语言支持

## 🆘 常见问题

### 图标不显示
确保在 `main.ts` 中正确注册了图标组件。

### 样式冲突
使用scoped样式或CSS模块避免样式冲突。

### 路由问题
检查路由配置是否正确，特别是meta信息的title字段。

## 原始Vue模板信息

This template should help get you started developing with Vue 3 in Vite.

### Recommended IDE Setup
[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

### Type Support for `.vue` Imports in TS
TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

### Customize configuration
See [Vite Configuration Reference](https://vite.dev/config/).
