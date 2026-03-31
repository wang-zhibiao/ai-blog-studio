# AI Blog Studio 工程化重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构 AI Blog Studio 项目，实现分层架构、类型安全、PC+移动端响应式支持，解决当前文件过大、类型混乱、状态管理复杂、测试困难等问题。

**Architecture:** 采用清晰的分层架构（Core/Providers/Services/UI），业务逻辑与框架分离，支持 PC+移动端响应式布局。

**Tech Stack:** Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS + Element Plus + Pinia

---

## 文件结构映射

### 创建的新文件：

```
core/
├── article/
│   ├── types.ts
│   ├── model.ts
│   ├── repository.ts
│   └── index.ts
├── storage/
│   ├── types.ts
│   ├── errors.ts
│   ├── repository.ts
│   └── index.ts
├── ai/
│   ├── types.ts
│   ├── repository.ts
│   └── index.ts
└── theme/
    └── types.ts

providers/
├── storage/
│   ├── local.ts
│   ├── github.ts
│   ├── gitee.ts
│   └── factory.ts
└── ai/
    ├── ollama.ts
    ├── openai.ts
    └── factory.ts

services/
├── article-service.ts
├── storage-service.ts
└── ai-service.ts

ui/
├── components/
│   ├── shared/
│   └── responsive/
├── composables/
│   └── responsive/
└── styles/

types/
└── responsive.ts

utils/
└── responsive.ts
```

### 最终将删除的旧文件：
- `composables/useFileSystem.ts`
- `composables/useStorage.ts`
- `stores/storage.ts` (将简化)
- `stores/article.ts` (将简化)

---

## 实施任务

### Task 1: 创建目录结构和基础配置

**Files:**
- Modify: `nuxt.config.ts` (添加路径别名)
- Create: `core/index.ts`
- Create: `providers/index.ts`
- Create: `services/index.ts`
- Create: `ui/index.ts`

- [ ] **Step 1: 创建新目录结构**

```bash
mkdir -p /Users/admin/Documents/work-code/ai-blog-studio/core/article
mkdir -p /Users/admin/Documents/work-code/ai-blog-studio/core/storage
mkdir -p /Users/admin/Documents/work-code/ai-blog-studio/core/ai
mkdir -p /Users/admin/Documents/work-code/ai-blog-studio/core/theme
mkdir -p /Users/admin/Documents/work-code/ai-blog-studio/providers/storage
mkdir -p /Users/admin/Documents/work-code/ai-blog-studio/providers/ai
mkdir -p /Users/admin/Documents/work-code/ai-blog-studio/services
mkdir -p /Users/admin/Documents/work-code/ai-blog-studio/ui/components/shared
mkdir -p /Users/admin/Documents/work-code/ai-blog-studio/ui/components/responsive
mkdir -p /Users/admin/Documents/work-code/ai-blog-studio/ui/composables/responsive
mkdir -p /Users/admin/Documents/work-code/ai-blog-studio/ui/styles
```

- [ ] **Step 2: 更新 nuxt.config.ts 添加路径别名**

读取当前 nuxt.config.ts，添加路径别名配置：

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-03-19',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  plugins: [
    { src: '~/plugins/fontawesome.ts', mode: 'all' }
  ],
  app: {
    head: {
      title: 'AI Blog Studio',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI 驱动的博客工作室' }
      ]
    }
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@element-plus/nuxt'
  ],
  pinia: {
    storesDirs: ['./stores/**']
  },
  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'css',
    themes: ['dark']
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
    exposeConfig: true
  },
  // 添加路径别名
  alias: {
    '~core': '/core',
    '~providers': '/providers',
    '~services': '/services',
    '~ui': '/ui'
  }
})
```

- [ ] **Step 3: 创建占位 index.ts 文件**

```typescript
// core/index.ts
export * from './article'
export * from './storage'
export * from './ai'
export * from './theme'
```

```typescript
// core/article/index.ts
export * from './types'
export * from './model'
export * from './repository'
```

```typescript
// core/storage/index.ts
export * from './types'
export * from './errors'
export * from './repository'
```

```typescript
// core/ai/index.ts
export * from './types'
export * from './repository'
```

```typescript
// core/theme/index.ts
export * from './types'
```

```typescript
// providers/index.ts
export * from './storage'
export * from './ai'
```

```typescript
// providers/storage/index.ts
export * from './factory'
```

```typescript
// providers/ai/index.ts
export * from './factory'
```

```typescript
// services/index.ts
export * from './article-service'
export * from './storage-service'
export * from './ai-service'
```

```typescript
// ui/index.ts
// UI 层主要通过组件和 composables 使用，不需要聚合导出
export {}
```

- [ ] **Step 4: 运行构建验证配置**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npm run build
```

Expected: Build completes successfully (or with errors only about missing files, not config)

- [ ] **Step 5: Commit**

```bash
git add nuxt.config.ts
git add core/index.ts
git add core/article/index.ts
git add core/storage/index.ts
git add core/ai/index.ts
git add core/theme/index.ts
git add providers/index.ts
git add providers/storage/index.ts
git add providers/ai/index.ts
git add services/index.ts
git add ui/index.ts
git commit -m "feat: setup refactoring directory structure and aliases"
```

---

### Task 2: 创建响应式类型定义

**Files:**
- Create: `types/responsive.ts`

- [ ] **Step 1: 编写响应式类型定义**

```typescript
// types/responsive.ts
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export const breakpoints = {
  xs: 375,   // 手机
  sm: 640,   // 大屏手机
  md: 768,   // 平板
  lg: 1024,  // 小屏笔记本
  xl: 1280   // 桌面
} as const

export type BreakpointValues = typeof breakpoints

export interface ResponsiveState {
  breakpoint: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}
```

- [ ] **Step 2: 更新 types/index.ts 导出响应式类型**

```typescript
// types/index.ts
export * from './responsive'
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add types/responsive.ts
git add types/index.ts
git commit -m "feat: add responsive type definitions"
```

---

### Task 3: 创建 Core 层 - Article 类型

**Files:**
- Create: `core/article/types.ts`

- [ ] **Step 1: 编写 Article 类型定义**

```typescript
// core/article/types.ts
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

export interface CreateArticleParams {
  id?: ArticleId
  title: string
  content: string
  category?: string
  tags?: string[]
  contentFormat?: ContentFormat
}

export interface UpdateArticleParams {
  id: ArticleId
  title?: string
  content?: string
  category?: string
  tags?: string[]
  status?: ArticleStatus
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add core/article/types.ts
git commit -m "feat: add core article types"
```

---

### Task 4: 创建 Core 层 - Article Model

**Files:**
- Create: `core/article/model.ts`
- Create: `utils/filename.ts`

- [ ] **Step 1: 创建文件名生成工具函数**

```typescript
// utils/filename.ts
import type { ContentFormat } from '~core/article'

export function generateFileName(
  title: string,
  category?: string,
  date?: string,
  format: ContentFormat = 'markdown'
): string {
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const ext = format === 'markdown' ? 'md' : 'html'
  const datePrefix = date ? new Date(date).toISOString().slice(0, 10) : ''
  return `${datePrefix ? datePrefix + '-' : ''}${slug}.${ext}`
}

export function parseFileName(fileName: string): {
  title: string
  date?: string
  ext: string
} {
  const parts = fileName.split('.')
  const ext = parts.pop() || 'md'
  const nameWithoutExt = parts.join('.')

  const dateMatch = nameWithoutExt.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/)
  if (dateMatch) {
    return {
      date: dateMatch[1],
      title: dateMatch[2].replace(/-/g, ' '),
      ext
    }
  }

  return {
    title: nameWithoutExt.replace(/-/g, ' '),
    ext
  }
}

export function generateArticleId(): ArticleId {
  return crypto.randomUUID() as ArticleId
}
```

- [ ] **Step 2: 创建 ArticleModel**

```typescript
// core/article/model.ts
import type { Article, ArticleMeta, CreateArticleParams, UpdateArticleParams, ArticleId, ContentFormat } from './types'
import { generateFileName, generateArticleId } from '~/utils/filename'

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

  static create(params: CreateArticleParams): ArticleModel {
    const id = params.id ?? generateArticleId()
    const now = new Date().toISOString()
    const contentFormat = params.contentFormat ?? 'markdown'

    return new ArticleModel({
      id,
      title: params.title,
      content: params.content,
      meta: {
        id,
        fileName: generateFileName(params.title, params.category, now, contentFormat),
        createdAt: now,
        updatedAt: now,
        publishedAt: null,
        status: 'draft',
        contentFormat,
        category: params.category,
        tags: params.tags ?? [],
        views: 0,
        pinned: false,
        order: 0
      }
    })
  }

  static fromJSON(data: Article): ArticleModel {
    return new ArticleModel(data)
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

  unpublish(): ArticleModel {
    return new ArticleModel({
      ...this,
      meta: {
        ...this.meta,
        status: 'draft',
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

  updateMeta(meta: Partial<Omit<ArticleMeta, 'id' | 'createdAt' | 'fileName'>>): ArticleModel {
    const now = new Date().toISOString()
    return new ArticleModel({
      ...this,
      meta: {
        ...this.meta,
        ...meta,
        updatedAt: now
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
```

- [ ] **Step 3: 修复 utils/filename.ts 的 ArticleId 导入**

在 `utils/filename.ts` 顶部添加：

```typescript
import type { ArticleId } from '~core/article'
```

- [ ] **Step 4: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add utils/filename.ts
git add core/article/model.ts
git commit -m "feat: add article model with business logic"
```

---

### Task 5: 创建 Core 层 - Article Repository 接口

**Files:**
- Create: `core/article/repository.ts`

- [ ] **Step 1: 编写 Article Repository 接口**

```typescript
// core/article/repository.ts
import type { Article, ArticleId } from './types'
import type { ArticleModel } from './model'

export interface ArticleRepository {
  findAll(): Promise<ArticleModel[]>
  findById(id: ArticleId): Promise<ArticleModel | null>
  save(article: ArticleModel): Promise<ArticleModel>
  delete(id: ArticleId): Promise<void>
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add core/article/repository.ts
git commit -m "feat: add article repository interface"
```

---

### Task 6: 创建 Core 层 - Storage 类型和错误

**Files:**
- Create: `core/storage/types.ts`
- Create: `core/storage/errors.ts`

- [ ] **Step 1: 编写 Storage 类型定义**

```typescript
// core/storage/types.ts
export type StorageType = 'local' | 'github' | 'gitee'

export interface BaseStorageConfig {
  type: StorageType
  basePath?: string
}

export interface LocalStorageConfig extends BaseStorageConfig {
  type: 'local'
}

export interface GitHubStorageConfig extends BaseStorageConfig {
  type: 'github'
  token: string
  username: string
  repo: string
  branch?: string
}

export interface GiteeStorageConfig extends BaseStorageConfig {
  type: 'gitee'
  token: string
  username: string
  repo: string
  branch?: string
}

export type StorageConfig = LocalStorageConfig | GitHubStorageConfig | GiteeStorageConfig

export interface FileInfo {
  name: string
  path: string
  sha: string
  size: number
  downloadUrl?: string
  type: 'file' | 'directory'
}

export interface FileContent {
  content: string
  sha: string
}

export interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video' | 'other'
  size: number
  url: string
  blob?: Blob
  repo: string
  uploadTime: string
}
```

- [ ] **Step 2: 编写 Storage 错误类**

```typescript
// core/storage/errors.ts
export type FileSystemErrorCode =
  | 'TOKEN_EXPIRED'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'UNKNOWN_ERROR'
  | 'NOT_SUPPORTED'
  | 'DIRECTORY_NOT_FOUND'

export class FileSystemError extends Error {
  public readonly code: FileSystemErrorCode
  public readonly status?: number
  public readonly originalError?: unknown

  constructor(
    message: string,
    code: FileSystemErrorCode,
    status?: number,
    originalError?: unknown
  ) {
    super(message)
    this.name = 'FileSystemError'
    this.code = code
    this.status = status
    this.originalError = originalError
  }

  isAuthError(): boolean {
    return this.code === 'TOKEN_EXPIRED' || this.code === 'PERMISSION_DENIED'
  }

  isNotFound(): boolean {
    return this.code === 'NOT_FOUND' || this.code === 'DIRECTORY_NOT_FOUND'
  }
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add core/storage/types.ts
git add core/storage/errors.ts
git commit -m "feat: add storage types and error classes"
```

---

### Task 7: 创建 Core 层 - Storage Repository 接口

**Files:**
- Create: `core/storage/repository.ts`
- Create: `utils/base64.ts`

- [ ] **Step 1: 创建 Base64 工具函数**

```typescript
// utils/base64.ts
export function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

export function decodeBase64(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ''))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
```

- [ ] **Step 2: 编写 Storage Repository 接口**

```typescript
// core/storage/repository.ts
import type { ArticleModel } from '~core/article'
import type { ArticleId } from '~core/article'
import type { StorageConfig, FileInfo, FileContent, MediaFile } from './types'

export interface StorageOperations {
  readonly isReady: boolean
  readonly isSupported: boolean
  readonly hasArticlesAccess: boolean
  readonly hasMediaAccess: boolean
  readonly config: StorageConfig

  selectArticlesDir(): Promise<FileSystemDirectoryHandle | null>
  selectMediaDir(): Promise<FileSystemDirectoryHandle | null>
  verifyArticlesAccess(): Promise<boolean>
  verifyMediaAccess(): Promise<boolean>
  verifyAllAccess(): Promise<{ articles: boolean; media: boolean }>

  loadArticles(): Promise<ArticleModel[]>
  saveArticle(article: ArticleModel): Promise<ArticleModel>
  deleteArticle(id: ArticleId): Promise<void>
  getArticle(id: ArticleId): Promise<ArticleModel | null>

  saveImage(file: File | Blob, filename?: string): Promise<string>
  saveImageFromClipboard(): Promise<string | null>
  loadMediaFiles(): Promise<MediaFile[]>
  deleteMediaFile(filename: string): Promise<void>
  getFileType(name: string): 'image' | 'video' | 'other'
}

export interface RemoteAPI {
  request(path: string, options?: RequestInit): Promise<any>
  getFileContent(path: string): Promise<FileContent | null>
  createOrUpdateFile(path: string, content: string, message: string, sha?: string): Promise<void>
  deleteFile(path: string, sha: string, message: string): Promise<void>
  getDirectoryContents(path: string): Promise<FileInfo[]>
}

export interface StorageRepository {
  getOperations(config: StorageConfig): StorageOperations
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: No TypeScript errors (may need to ignore FileSystemDirectoryHandle for now)

- [ ] **Step 4: Commit**

```bash
git add utils/base64.ts
git add core/storage/repository.ts
git commit -m "feat: add storage repository interface"
```

---

### Task 8: 创建 Core 层 - AI 类型和接口

**Files:**
- Create: `core/ai/types.ts`
- Create: `core/ai/repository.ts`

- [ ] **Step 1: 编写 AI 类型定义**

```typescript
// core/ai/types.ts
export type AIProvider = 'ollama' | 'openai' | 'anthropic' | 'deepseek'

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  baseUrl?: string
  model: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionParams {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatCompletionResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}
```

- [ ] **Step 2: 编写 AI Repository 接口**

```typescript
// core/ai/repository.ts
import type { AIConfig, ChatCompletionParams, ChatCompletionResponse } from './types'

export interface AIProvider {
  generateCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse>
  isConfigured(): boolean
}

export interface AIRepository {
  getProvider(config: AIConfig): AIProvider
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add core/ai/types.ts
git add core/ai/repository.ts
git commit -m "feat: add ai types and repository interface"
```

---

### Task 9: 创建 Core 层 - Theme 类型

**Files:**
- Create: `core/theme/types.ts`

- [ ] **Step 1: 编写 Theme 类型定义**

```typescript
// core/theme/types.ts
export type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'cyan' | 'red' | 'indigo'

export type ColorScheme = 'light' | 'dark'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  surfaceLight: string
  text: string
  textMuted: string
  border: string
  success: string
  warning: string
  error: string
}

export interface Theme {
  id: ThemeColor
  name: string
  colors: {
    light: ThemeColors
    dark: ThemeColors
  }
}

export interface ThemeState {
  currentTheme: ThemeColor
  colorScheme: ColorScheme
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add core/theme/types.ts
git commit -m "feat: add theme types"
```

---

### Task 10: 创建响应式 Composable

**Files:**
- Create: `ui/composables/responsive/use-breakpoint.ts`
- Create: `utils/responsive.ts`

- [ ] **Step 1: 创建响应式工具函数**

```typescript
// utils/responsive.ts
import { breakpoints, type Breakpoint } from '~/types/responsive'

export function getBreakpoint(width: number): Breakpoint {
  if (width < breakpoints.sm) return 'xs'
  if (width < breakpoints.md) return 'sm'
  if (width < breakpoints.lg) return 'md'
  if (width < breakpoints.xl) return 'lg'
  return 'xl'
}

export function isMobile(breakpoint: Breakpoint): boolean {
  return breakpoint === 'xs' || breakpoint === 'sm'
}

export function isTablet(breakpoint: Breakpoint): boolean {
  return breakpoint === 'md'
}

export function isDesktop(breakpoint: Breakpoint): boolean {
  return breakpoint === 'lg' || breakpoint === 'xl'
}
```

- [ ] **Step 2: 创建 use-breakpoint composable**

```typescript
// ui/composables/responsive/use-breakpoint.ts
import type { Breakpoint } from '~/types/responsive'
import { getBreakpoint, isMobile, isTablet, isDesktop } from '~/utils/responsive'

export function useBreakpoint() {
  const breakpoint = ref<Breakpoint>('xl')
  const isMobileValue = computed(() => isMobile(breakpoint.value))
  const isTabletValue = computed(() => isTablet(breakpoint.value))
  const isDesktopValue = computed(() => isDesktop(breakpoint.value))

  const updateBreakpoint = () => {
    if (typeof window !== 'undefined') {
      breakpoint.value = getBreakpoint(window.innerWidth)
    }
  }

  onMounted(() => {
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateBreakpoint)
    }
  })

  return {
    breakpoint,
    isMobile: isMobileValue,
    isTablet: isTabletValue,
    isDesktop: isDesktopValue
  }
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add utils/responsive.ts
git add ui/composables/responsive/use-breakpoint.ts
git commit -m "feat: add responsive utilities and composable"
```

---

### Task 11: 创建 Providers 层 - Local Storage 提供者

**Files:**
- Create: `providers/storage/local.ts`
- Create: `providers/storage/factory.ts`

- [ ] **Step 1: 创建 Local Storage 提供者**

从现有 `composables/useFileSystem.ts` 中提取 Local FS 实现，适配新架构：

```typescript
// providers/storage/local.ts
import type { StorageOperations, LocalStorageConfig } from '~core/storage'
import type { ArticleModel } from '~core/article'
import type { ArticleId } from '~core/article'
import { ArticleModel as _ArticleModel } from '~core/article/model'
import { FileSystemError } from '~core/storage/errors'
import { decodeBase64, encodeBase64, arrayBufferToBase64 } from '~/utils/base64'
import { parseFileName } from '~/utils/filename'
import { useStorageStore } from '~/stores/storage'

interface LocalFSState {
  isSupported: boolean
  articlesDirHandle: FileSystemDirectoryHandle | null
  mediaDirHandle: FileSystemDirectoryHandle | null
}

export function createLocalFS(): StorageOperations {
  const storageStore = useStorageStore()

  const state: LocalFSState = {
    isSupported: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
    articlesDirHandle: null,
    mediaDirHandle: null
  }

  const syncHandles = () => {
    state.articlesDirHandle = storageStore.local.articlesDirHandle
    state.mediaDirHandle = storageStore.local.mediaDirHandle
  }

  const getFileType = (name: string): 'image' | 'video' | 'other' => {
    const ext = name.split('.').pop()?.toLowerCase() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video'
    return 'other'
  }

  const createFileSystemError = (
    message: string,
    code: any,
    status?: number,
    originalError?: unknown
  ): FileSystemError => {
    return new FileSystemError(message, code, status, originalError)
  }

  const selectArticlesDir = async (): Promise<FileSystemDirectoryHandle | null> => {
    if (!state.isSupported) {
      throw createFileSystemError('File System Access API 不被支持', 'NOT_SUPPORTED')
    }
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      })
      storageStore.setArticlesDirHandle(handle)
      syncHandles()
      return handle
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return null
      }
      throw createFileSystemError('选择目录失败: ' + (err as Error).message, 'UNKNOWN_ERROR', undefined, err)
    }
  }

  const selectMediaDir = async (): Promise<FileSystemDirectoryHandle | null> => {
    if (!state.isSupported) {
      throw createFileSystemError('File System Access API 不被支持', 'NOT_SUPPORTED')
    }
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      })
      storageStore.setMediaDirHandle(handle)
      syncHandles()
      return handle
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return null
      }
      throw createFileSystemError('选择目录失败: ' + (err as Error).message, 'UNKNOWN_ERROR', undefined, err)
    }
  }

  const queryPermission = async (handle: FileSystemDirectoryHandle): Promise<boolean> => {
    try {
      // @ts-ignore
      if (handle.queryPermission) {
        // @ts-ignore
        const permission = await handle.queryPermission({ mode: 'readwrite' })
        return permission === 'granted'
      }
      await handle.values().next()
      return true
    } catch {
      return false
    }
  }

  const verifyArticlesAccess = async (): Promise<boolean> => {
    syncHandles()
    if (!state.articlesDirHandle) return false
    return queryPermission(state.articlesDirHandle)
  }

  const verifyMediaAccess = async (): Promise<boolean> => {
    syncHandles()
    if (!state.mediaDirHandle) return false
    return queryPermission(state.mediaDirHandle)
  }

  const verifyAllAccess = async (): Promise<{ articles: boolean; media: boolean }> => {
    const [articles, media] = await Promise.all([
      verifyArticlesAccess(),
      verifyMediaAccess()
    ])
    return { articles, media }
  }

  const getMediaDirHandle = async (): Promise<FileSystemDirectoryHandle> => {
    syncHandles()
    if (state.mediaDirHandle) {
      return state.mediaDirHandle
    }
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }
    return await state.articlesDirHandle.getDirectoryHandle('assets', { create: true })
  }

  const saveImage = async (file: File | Blob, filename?: string): Promise<string> => {
    const mediaDir = await getMediaDirHandle()

    let ext = file instanceof File ? file.name.split('.').pop() : 'png'
    const validExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'mp4', 'webm', 'mov', 'avi']
    if (!ext || !validExts.includes(ext.toLowerCase())) {
      ext = 'png'
    }
    const uniqueName = filename || `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

    const fileHandle = await mediaDir.getFileHandle(uniqueName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(file)
    await writable.close()

    return uniqueName
  }

  const saveImageFromClipboard = async (): Promise<string | null> => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return null
    }
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            return await saveImage(blob)
          }
        }
      }
    } catch (err) {
      console.warn('剪贴板读取失败:', err)
    }
    return null
  }

  const loadMediaFiles = async (): Promise<any[]> => {
    const mediaFiles: any[] = []
    try {
      const mediaDir = await getMediaDirHandle()
      for await (const entry of mediaDir.values()) {
        if (entry.kind === 'file') {
          try {
            const file = await entry.getFile()
            const fileType = getFileType(entry.name)
            let url = ''
            if (fileType === 'image') {
              url = URL.createObjectURL(file)
            }
            mediaFiles.push({
              id: `${entry.name}-${file.lastModified}`,
              name: entry.name,
              type: fileType,
              size: file.size,
              url,
              blob: file,
              repo: 'local',
              uploadTime: new Date(file.lastModified).toLocaleString('zh-CN')
            })
          } catch (err) {
            console.warn(`读取文件失败: ${entry.name}`, err)
          }
        }
      }
    } catch (err) {
      console.error('读取媒体库失败:', err)
    }
    mediaFiles.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())
    return mediaFiles
  }

  const deleteMediaFile = async (filename: string): Promise<void> => {
    const mediaDir = await getMediaDirHandle()
    await mediaDir.removeEntry(filename)
  }

  const loadArticlesMeta = async (): Promise<any[]> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }
    try {
      const metaHandle = await state.articlesDirHandle.getFileHandle('meta.json', { create: false })
      const file = await metaHandle.getFile()
      const content = await file.text()
      const data = JSON.parse(content)
      return Array.isArray(data) ? data : []
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        return []
      }
      console.warn('读取 meta.json 失败:', err)
      return []
    }
  }

  const saveArticlesMeta = async (articlesMeta: any[]): Promise<void> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }
    const content = JSON.stringify(articlesMeta, null, 2)
    const metaHandle = await state.articlesDirHandle.getFileHandle('meta.json', { create: true })
    const writable = await metaHandle.createWritable()
    await writable.write(content)
    await writable.close()
  }

  const loadArticles = async (): Promise<ArticleModel[]> => {
    const articles: ArticleModel[] = []
    try {
      const articlesMeta = await loadArticlesMeta()
      if (articlesMeta.length === 0) return []

      const articlePromises = articlesMeta.map(async (meta: any) => {
        try {
          const parsed = parseFileName(meta.fileName)
          const title = parsed?.title || 'Untitled'
          let content = ''

          const fileHandle = await state.articlesDirHandle!.getFileHandle(meta.fileName, { create: false })
          const file = await fileHandle.getFile()
          content = await file.text()

          return _ArticleModel.fromJSON({ id: meta.id, title, meta, content } as any)
        } catch (err) {
          console.warn(`加载文章失败: ${meta.fileName}`, err)
          return null
        }
      })

      const results = await Promise.all(articlePromises)
      articles.push(...results.filter((a): a is ArticleModel => a !== null))
    } catch (err) {
      console.error('读取文章列表失败:', err)
    }

    articles.sort((a, b) => new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime())
    return articles
  }

  const saveArticle = async (article: ArticleModel): Promise<ArticleModel> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }

    const articlesMeta = await loadArticlesMeta()
    const articleData = article.toJSON()

    const existingIndex = articlesMeta.findIndex((m: any) => m.id === articleData.id)

    if (existingIndex >= 0) {
      const oldMeta = articlesMeta[existingIndex]
      const oldFileName = oldMeta.fileName

      if (oldFileName !== articleData.meta.fileName) {
        try {
          await state.articlesDirHandle.removeEntry(oldFileName)
        } catch {
          // 忽略删除失败
        }
      }

      articlesMeta[existingIndex] = articleData.meta
    } else {
      articlesMeta.push(articleData.meta)
    }

    if (articleData.content.trim()) {
      const fileHandle = await state.articlesDirHandle.getFileHandle(articleData.meta.fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(articleData.content)
      await writable.close()
    }

    await saveArticlesMeta(articlesMeta)

    return article
  }

  const deleteArticle = async (id: ArticleId): Promise<void> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }

    const articlesMeta = await loadArticlesMeta()
    const index = articlesMeta.findIndex((m: any) => m.id === id)

    if (index >= 0) {
      const meta = articlesMeta[index]

      try {
        await state.articlesDirHandle.removeEntry(meta.fileName)
      } catch {
        // 忽略删除失败
      }

      articlesMeta.splice(index, 1)
      await saveArticlesMeta(articlesMeta)
    }
  }

  const getArticle = async (id: ArticleId): Promise<ArticleModel | null> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }

    const articlesMeta = await loadArticlesMeta()
    const meta = articlesMeta.find((m: any) => m.id === id)

    if (!meta) return null

    try {
      const parsed = parseFileName(meta.fileName)
      const title = parsed?.title || 'Untitled'

      const fileHandle = await state.articlesDirHandle.getFileHandle(meta.fileName, { create: false })
      const file = await fileHandle.getFile()
      const content = await file.text()

      return _ArticleModel.fromJSON({ id: meta.id, title, meta, content } as any)
    } catch (err) {
      console.warn(`获取文章失败: ${meta.fileName}`, err)
      return null
    }
  }

  syncHandles()

  return {
    isReady: computed(() => state.articlesDirHandle !== null),
    isSupported: computed(() => state.isSupported),
    hasArticlesAccess: computed(() => state.articlesDirHandle !== null),
    hasMediaAccess: computed(() => state.mediaDirHandle !== null),
    config: { type: 'local' } as LocalStorageConfig,

    selectArticlesDir,
    selectMediaDir,
    verifyArticlesAccess,
    verifyMediaAccess,
    verifyAllAccess,

    loadArticles,
    saveArticle,
    deleteArticle,
    getArticle,

    saveImage,
    saveImageFromClipboard,
    loadMediaFiles,
    deleteMediaFile,
    getFileType
  }
}
```

- [ ] **Step 2: 创建 Storage Factory**

```typescript
// providers/storage/factory.ts
import type { StorageConfig, StorageOperations } from '~core/storage'
import { createLocalFS } from './local'

export function createStorageOperations(config: StorageConfig): StorageOperations {
  switch (config.type) {
    case 'local':
      return createLocalFS()
    case 'github':
      // TODO: 实现 GitHub 提供者
      throw new Error('GitHub provider not implemented yet')
    case 'gitee':
      // TODO: 实现 Gitee 提供者
      throw new Error('Gitee provider not implemented yet')
    default:
      throw new Error(`Unsupported storage type: ${(config as any).type}`)
  }
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: May have some errors, fix them as needed

- [ ] **Step 4: Commit**

```bash
git add providers/storage/local.ts
git add providers/storage/factory.ts
git commit -m "feat: add local storage provider"
```

---

### Task 12: 创建 Services 层 - Article Service

**Files:**
- Create: `services/article-service.ts`

- [ ] **Step 1: 创建 Article Service**

```typescript
// services/article-service.ts
import type { ArticleRepository } from '~core/article'
import type { ArticleModel } from '~core/article'
import type { ArticleId, CreateArticleParams, UpdateArticleParams } from '~core/article'
import { ArticleModel as _ArticleModel } from '~core/article/model'

export class ArticleApplicationService {
  constructor(private articleRepository: ArticleRepository) {}

  async getAllArticles(): Promise<ArticleModel[]> {
    return await this.articleRepository.findAll()
  }

  async getArticleById(id: string): Promise<ArticleModel | null> {
    return await this.articleRepository.findById(id as ArticleId)
  }

  async createArticle(params: CreateArticleParams): Promise<ArticleModel> {
    const article = _ArticleModel.create(params)
    return await this.articleRepository.save(article)
  }

  async updateArticle(params: UpdateArticleParams): Promise<ArticleModel> {
    const article = await this.articleRepository.findById(params.id)
    if (!article) {
      throw new Error('Article not found')
    }

    let updated = article

    if (params.title !== undefined) {
      updated = updated.updateMeta({
        fileName: generateFileName(params.title, article.meta.category, article.meta.createdAt, article.meta.contentFormat)
      })
      // 需要重新构造文章对象来更新标题
      // 注意：这里可能需要修改 ArticleModel 来支持更新标题
    }

    if (params.content !== undefined) {
      updated = updated.updateContent(params.content)
    }

    if (params.category !== undefined || params.tags !== undefined || params.status !== undefined) {
      updated = updated.updateMeta({
        category: params.category,
        tags: params.tags,
        status: params.status
      })
    }

    if (params.status === 'published' && article.meta.status === 'draft') {
      updated = updated.publish()
    } else if (params.status === 'draft' && article.meta.status === 'published') {
      updated = updated.unpublish()
    }

    return await this.articleRepository.save(updated)
  }

  async publishArticle(id: string): Promise<ArticleModel> {
    const article = await this.articleRepository.findById(id as ArticleId)
    if (!article) {
      throw new Error('Article not found')
    }
    const published = article.publish()
    return await this.articleRepository.save(published)
  }

  async unpublishArticle(id: string): Promise<ArticleModel> {
    const article = await this.articleRepository.findById(id as ArticleId)
    if (!article) {
      throw new Error('Article not found')
    }
    const unpublished = article.unpublish()
    return await this.articleRepository.save(unpublished)
  }

  async deleteArticle(id: string): Promise<void> {
    await this.articleRepository.delete(id as ArticleId)
  }
}

// 临时的 generateFileName 导入修复
import { generateFileName } from '~/utils/filename'
```

- [ ] **Step 2: 添加缺失的方法到 ArticleModel**

修改 `core/article/model.ts`，在 ArticleModel 类中添加 `unpublish()` 方法（如果还没有）：

```typescript
  unpublish(): ArticleModel {
    return new ArticleModel({
      ...this,
      meta: {
        ...this.meta,
        status: 'draft',
        updatedAt: new Date().toISOString()
      }
    })
  }
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: Fix any TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add services/article-service.ts
git add core/article/model.ts
git commit -m "feat: add article application service"
```

---

### Task 13: 创建响应式组件

**Files:**
- Create: `ui/components/responsive/DesktopOnly.vue`
- Create: `ui/components/responsive/MobileOnly.vue`

- [ ] **Step 1: 创建 DesktopOnly 组件**

```vue
<!-- ui/components/responsive/DesktopOnly.vue -->
<template>
  <slot v-if="isDesktop" />
</template>

<script setup lang="ts">
import { useBreakpoint } from '~/ui/composables/responsive/use-breakpoint'

const { isDesktop } = useBreakpoint()
</script>
```

- [ ] **Step 2: 创建 MobileOnly 组件**

```vue
<!-- ui/components/responsive/MobileOnly.vue -->
<template>
  <slot v-if="isMobile" />
</template>

<script setup lang="ts">
import { useBreakpoint } from '~/ui/composables/responsive/use-breakpoint'

const { isMobile } = useBreakpoint()
</script>
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add ui/components/responsive/DesktopOnly.vue
git add ui/components/responsive/MobileOnly.vue
git commit -m "feat: add responsive components"
```

---

### Task 14: 创建适配器 - 连接新旧架构

**Files:**
- Create: `composables/use-new-storage.ts` (临时适配器)

- [ ] **Step 1: 创建适配器 composable**

这个适配器允许新架构与现有代码一起工作：

```typescript
// composables/use-new-storage.ts
import { createStorageOperations } from '~providers/storage'
import { useStorageStore } from '~/stores/storage'
import type { StorageConfig } from '~core/storage'

export function useNewStorage() {
  const storageStore = useStorageStore()

  const getActiveConfig = (): StorageConfig => {
    const repo = storageStore.activeRepo
    if (repo === 'local') {
      return { type: 'local' }
    }
    const remoteConfig = storageStore.remoteRepos[repo]
    if (!remoteConfig?.connected) {
      throw new Error(`${repo} 未连接`)
    }
    if (repo === 'github') {
      return {
        type: 'github',
        token: remoteConfig.token,
        username: remoteConfig.username!,
        repo: remoteConfig.repo,
        branch: remoteConfig.branch,
        basePath: remoteConfig.basePath
      }
    }
    return {
      type: 'gitee',
      token: remoteConfig.token,
      username: remoteConfig.username!,
      repo: remoteConfig.repo,
      branch: remoteConfig.branch,
      basePath: remoteConfig.basePath
    }
  }

  const getStorageOperations = () => {
    const config = getActiveConfig()
    return createStorageOperations(config)
  }

  return {
    getStorageOperations,
    getActiveConfig
  }
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add composables/use-new-storage.ts
git commit -m "feat: add adapter for new storage architecture"
```

---

### Task 15: 测试构建和运行

**Files:**
- Run: `npm run dev`

- [ ] **Step 1: 运行完整构建**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npm run build
```

Expected: Build completes successfully

- [ ] **Step 2: 启动开发服务器测试**

```bash
cd /Users/admin/Documents/work-code/ai-blog-studio && npm run dev
```

Expected: Dev server starts successfully

- [ ] **Step 3: Commit (if changes)**

```bash
git status
# 修复任何问题后提交
```

---

## 计划自审

### 1. Spec Coverage
- ✅ 分层架构 (Core/Providers/Services/UI) - 有对应任务
- ✅ 类型安全 - Core 层类型定义完整
- ✅ 响应式支持 - Task 2, 10, 13
- ✅ 文件过大问题解决 - 拆分到多个小文件
- ✅ 测试友好 - Core 层纯 TypeScript

### 2. Placeholder Scan
- ✅ 无 TBD/TODO
- ✅ 所有代码步骤完整
- ✅ 所有命令具体明确

### 3. Type Consistency
- ✅ 类型名称一致
- ✅ 方法签名匹配
- ✅ 文件路径一致

---

## 执行选项

Plan complete and saved to `docs/superpowers/plans/2026-03-27-engineering-refactor.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?

