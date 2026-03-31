# AI Blog Studio 工程化重构设计文档

**日期:** 2026-03-27
**版本:** v1.0
**状态:** 待审核

---

## 概述

本文档描述 AI Blog Studio 项目的全面工程化重构方案，旨在解决当前代码中的文件过大、类型混乱、状态管理复杂、测试困难等问题。

### 重构目标

- ✅ 全面工程化（代码质量 + 开发流程 + 架构改进）
- ✅ 类型安全与架构清晰为重点
- ✅ 支持 PC + 移动端响应式架构
- ✅ 提高代码可维护性和可测试性

---

## 架构设计

### 核心原则

1. **分层架构**：清晰的层级划分，外层依赖内层
2. **关注点分离**：业务逻辑与 UI 分离、与技术实现分离
3. **类型优先**：严格的 TypeScript 类型，消除 `any` 类型
4. **测试友好**：核心逻辑可独立测试，不依赖框架

### 目录结构

```
ai-blog-studio/
├── core/                      # 核心业务逻辑（与 UI 无关）
│   ├── article/
│   │   ├── types.ts         # 文章类型定义
│   │   ├── model.ts         # 文章实体/模型
│   │   ├── repository.ts    # 文章仓库接口
│   │   └── service.ts       # 文章业务逻辑
│   ├── storage/
│   │   ├── types.ts         # 存储类型
│   │   ├── errors.ts        # 文件系统错误
│   │   └── repository.ts    # 存储接口
│   ├── ai/
│   │   ├── types.ts
│   │   └── repository.ts
│   └── theme/
│       └── types.ts
│
├── providers/                 # 数据提供者实现
│   ├── storage/
│   │   ├── local.ts         # Local FS 实现
│   │   ├── github.ts        # GitHub 实现
│   │   ├── gitee.ts         # Gitee 实现
│   │   └── factory.ts       # 工厂函数
│   └── ai/
│       ├── ollama.ts
│       ├── openai.ts
│       └── factory.ts
│
├── services/                  # 应用服务
│   ├── article-service.ts    # 文章应用服务
│   ├── storage-service.ts    # 存储应用服务
│   └── ai-service.ts         # AI 应用服务
│
├── ui/                        # UI 层
│   ├── components/
│   │   ├── shared/          # 通用组件（PC+移动共用）
│   │   ├── article/         # 文章相关组件
│   │   ├── layout/          # 布局组件
│   │   └── responsive/      # 响应式专用组件
│   ├── composables/
│   │   ├── responsive/      # 响应式相关
│   │   ├── article/
│   │   └── storage/
│   └── styles/
│       ├── tokens.css       # 设计令牌
│       ├── utilities.css    # 工具类
│       └── responsive.css   # 响应式断点
│
├── pages/                   # 页面层
│   ├── index.vue
│   └── console/
│
├── stores/                  # Pinia（仅 UI 状态）
│   ├── ui.ts               # UI 状态
│   └── session.ts          # 会话状态
│
├── types/                   # 全局类型
│   ├── responsive.ts       # 响应式类型
│   └── index.ts
│
├── utils/
│   ├── responsive.ts       # 响应式工具
│   ├── base64.ts
│   └── filename.ts
│
└── assets/
```

---

## 分层详细设计

### 1. Core 层（核心业务逻辑）

**职责：**
- 定义业务实体和值对象
- 定义仓库接口（不关心具体实现）
- 包含纯业务逻辑
- 与 UI 框架无关、与存储技术无关

**示例：** `core/article/types.ts`
```typescript
export type ArticleId = string & { __brand: 'ArticleId' }

export type ArticleStatus = 'draft' | 'published'

export type ContentFormat = 'markdown' | 'html'

export interface ArticleMeta {
  id: ArticleId
  fileName: string
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  status: ArticleStatus
  contentFormat: ContentFormat
  category?: string
  tags: string[]
  excerpt?: string
  cover?: string
  views: number
  pinned: boolean
  order: number
}

export interface Article {
  id: ArticleId
  title: string
  content: string
  meta: ArticleMeta
}
```

**示例：** `core/article/model.ts`
```typescript
import { Article, ArticleId, ArticleStatus, ContentFormat } from './types'

export class ArticleModel {
  readonly id: ArticleId
  readonly title: string
  readonly content: string
  readonly meta: ArticleMeta

  private constructor(props: Article) {
    this.id = props.id
    this.title = props.title
    this.content = props.content
    this.meta = props.meta
  }

  static create(props: {
    id?: ArticleId
    title: string
    content: string
    category?: string
    tags?: string[]
    contentFormat?: ContentFormat
  }): ArticleModel {
    const id = props.id ?? (crypto.randomUUID() as ArticleId)
    const now = new Date().toISOString()
    return new ArticleModel({
      id,
      title: props.title,
      content: props.content,
      meta: {
        id,
        fileName: generateFileName(props.title, props.category, now, props.contentFormat ?? 'markdown'),
        createdAt: now,
        updatedAt: now,
        publishedAt: null,
        status: 'draft',
        contentFormat: props.contentFormat ?? 'markdown',
        category: props.category,
        tags: props.tags ?? [],
        views: 0,
        pinned: false,
        order: 0
      }
    })
  }

  publish(): ArticleModel {
    return new ArticleModel({
      ...this,
      meta: {
        ...this.meta,
        status: 'published',
        publishedAt: this.meta.publishedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
  }

  updateContent(content: string): ArticleModel {
    return new ArticleModel({
      ...this,
      content,
      meta: {
        ...this.meta,
        updatedAt: new Date().toISOString()
      }
    })
  }

  toJSON(): Article {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      meta: this.meta
    }
  }
}

function generateFileName(
  title: string,
  category?: string,
  date?: string,
  format: ContentFormat = 'markdown'
): string {
  const slug = title.toLowerCase().replace(/\s+/g, '-')
  const ext = format === 'markdown' ? 'md' : 'html'
  const datePrefix = date ? new Date(date).toISOString().slice(0, 10) : ''
  return `${datePrefix ? datePrefix + '-' : ''}${slug}.${ext}`
}
```

### 2. Providers 层（数据提供者）

**职责：**
- 实现 Core 层定义的仓库接口
- 处理具体的技术细节（Local FS、GitHub API、Gitee API）
- 提供工厂函数创建具体实现

### 3. Services 层（应用服务）

**职责：**
- 编排 Core 层的对象完成用例
- 处理跨实体的业务逻辑
- 作为 UI 层和 Core 层的桥梁

### 4. UI 层

**职责：**
- 处理所有 UI 相关逻辑
- 响应式布局和组件
- 用户交互处理
- 调用 Services 层完成业务操作

---

## 响应式设计

### 断点定义

```typescript
// types/responsive.ts
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export const breakpoints = {
  xs: 375,   // 手机
  sm: 640,   // 大屏手机
  md: 768,   // 平板
  lg: 1024,  // 小屏笔记本
  xl: 1280   // 桌面
}
```

### 布局策略

**PC 端：**
- 顶部固定 Header
- 左侧固定 Sidebar
- 右侧可滚动 Main Content

**移动端：**
- 顶部固定 Header
- 中间可滚动 Main Content
- 底部固定 Bottom Navigation

---

## 迁移计划

### 阶段 1：搭建新架构骨架
- 创建新目录结构
- 配置 TypeScript 路径别名
- 设置基础类型定义

### 阶段 2：迁移 Core 层
- 迁移 article 模块
- 迁移 storage 模块
- 迁移 ai 模块
- 迁移 theme 模块

### 阶段 3：迁移 Providers 层
- 实现 Local FS 提供者
- 实现 GitHub 提供者
- 实现 Gitee 提供者

### 阶段 4：迁移 Services 层
- 实现应用服务
- 连接 Core 和 Providers

### 阶段 5：重构 UI 层
- 迁移组件
- 实现响应式布局
- 迁移页面

### 阶段 6：清理旧代码
- 删除旧的 composables
- 删除旧的 stores
- 更新引用

---

## 成功标准

- [ ] 所有 `any` 类型被消除
- [ ] Core 层无 Vue/Nuxt 依赖
- [ ] Core 层有单元测试覆盖
- [ ] 支持 PC + 移动端响应式布局
- [ ] 文件大小控制在合理范围（单个文件 < 200 行）
- [ ] 构建通过，无 TypeScript 错误

---

## 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 重构期间功能中断 | 高 | 中 | 分阶段迁移，保持旧代码可用 |
| 学习曲线 | 中 | 高 | 详细文档，代码示例 |
| 时间超出预期 | 中 | 中 | 优先核心功能，次要功能可延后 |

---

## 附录

### A. 相关文档
- CHANGELOG.md - 项目变更日志
- CLAUDE.md - 项目开发指令

### B. 参考资料
- Domain-Driven Design (DDD)
- Nuxt 4 Documentation
- Vue 3 Composition API
- Tailwind CSS Responsive Design

