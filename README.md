# AI Blog Studio

一个集博客编写后台、博客网站于一体，并能连接 AI 大模型的现代化博客工作室。

## 功能特性

### ✍️ 智能文章编辑
- 集成 SunEditor 富文本编辑器
- 支持 Markdown 和 HTML 双格式编辑
- 实时预览切换
- AI 辅助写作功能

### 💾 多仓库存储
- **本地文件存储**: 直接在本地目录管理文章
- **GitHub 集成**: 授权后可直接操作 GitHub 仓库
- **Gitee 集成**: 支持 Gitee 仓库存储
- 授权信息安全存储在 Cookie 中

### 🎨 现代化界面
- 深色主题设计
- 响应式布局
- 流畅的动画效果

## 快速开始

### 环境要求
- Node.js >= 20.x
- npm >= 10.x

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000 查看项目。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
ai-blog-studio/
├── components/              # 组件目录
│   ├── layout/             # 布局组件
│   │   ├── ConsoleHeader.vue    # 控制台顶部导航
│   │   └── ConsoleLayout.vue    # 控制台布局容器
│   ├── editor/             # 编辑器组件
│   │   ├── SunEditor.vue        # SunEditor 封装
│   │   └── EditorToolbar.vue    # 编辑器工具栏
│   ├── article/            # 文章相关组件
│   │   ├── ArticleCard.vue      # 文章卡片
│   │   └── ArticleList.vue      # 文章列表
│   └── settings/           # 设置组件
│       ├── RepoConfig.vue       # 仓库配置
│       └── UserMenu.vue         # 用户菜单
├── pages/                  # 页面目录
│   ├── index.vue          # 首页（营销页）
│   ├── console/           # 控制台
│   │   ├── index.vue      # 文章列表
│   │   ├── editor/
│   │   │   ├── index.vue  # 新建文章
│   │   │   └── [id].vue   # 编辑文章
│   │   └── settings.vue   # 设置页
│   └── blog/              # 博客展示
├── composables/            # 组合式函数
│   ├── useAuth.ts         # 授权管理
│   ├── useStorage.ts      # 存储抽象层
│   ├── useGitHub.ts       # GitHub API
│   ├── useGitee.ts        # Gitee API
│   └── useLocalFS.ts      # 本地文件操作
├── server/                 # 服务端代码
│   ├── api/
│   │   ├── proxy/[...path].ts    # API 代理
│   │   └── auth/
│   │       ├── github.ts          # GitHub OAuth
│   │       └── gitee.ts           # Gitee OAuth
│   └── middleware/
│       └── auth.ts        # 授权中间件
├── types/                  # TypeScript 类型定义
│   ├── article.ts
│   ├── repo.ts
│   └── index.ts
├── utils/                  # 工具函数
│   ├── markdown.ts
│   └── storage.ts
├── assets/
│   └── css/
│       ├── main.css       # 全局样式
│       └── console.css    # 控制台样式
├── nuxt.config.ts         # Nuxt 配置
├── package.json
└── README.md
```

## 配置说明

### 存储配置

在设置页面中可以配置以下存储方式：

#### 本地存储
- 文章默认存储在 `./data/articles/` 目录
- 支持 `.md` 和 `.html` 格式

#### GitHub 集成
1. 创建 GitHub OAuth App
2. 在设置中配置 Client ID 和 Client Secret
3. 完成 OAuth 授权
4. 选择目标仓库

#### Gitee 集成
1. 创建 Gitee 第三方应用
2. 在设置中配置 Client ID 和 Client Secret
3. 完成 OAuth 授权
4. 选择目标仓库

### 文章格式

文章支持 YAML front-matter 元数据：

```markdown
---
title: 文章标题
date: 2026-03-20
tags: [标签1, 标签2]
category: 分类
---

文章内容...
```

## 技术栈

- **框架**: Nuxt 4
- **UI**: Vue 3
- **编辑器**: SunEditor
- **样式**: 原生 CSS + CSS Variables
- **API**: Nitro Server Routes

## 开发指南

### 添加新的存储提供商

1. 在 `composables/` 中创建新的 provider 文件
2. 实现 `useStorage` 接口
3. 在设置页面添加配置项

### 自定义编辑器

编辑器组件位于 `components/editor/SunEditor.vue`，可根据需求扩展功能。

## License

MIT
