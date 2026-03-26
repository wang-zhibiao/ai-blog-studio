/**
 * 统一文件系统类型定义
 * 合并本地、GitHub、Gitee 三种存储类型的通用接口
 */

import type { Article, ArticleMeta, MediaFile } from './article'

// ==================== 存储类型 ====================

export type StorageType = 'local' | 'github' | 'gitee'

// ==================== 配置类型 ====================

export interface BaseStorageConfig {
  type: StorageType
  basePath?: string
}

export interface LocalStorageConfig extends BaseStorageConfig {
  type: 'local'
  // 本地使用 File System Access API，不需要额外配置
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

export type StorageConfig =
  | LocalStorageConfig
  | GitHubStorageConfig
  | GiteeStorageConfig

// ==================== 文件元数据 ====================

export interface FileInfo {
  name: string
  path: string
  sha: string
  size: number
  downloadUrl?: string
  type: 'file' | 'directory'
}

// ==================== API 响应类型 ====================

export interface FileContent {
  content: string
  sha: string
}

// ==================== 错误类型 ====================

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
  constructor(
    message: string,
    public code: FileSystemErrorCode,
    public status?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'FileSystemError'
  }

  isAuthError(): boolean {
    return this.code === 'TOKEN_EXPIRED' || this.code === 'PERMISSION_DENIED'
  }

  isNotFound(): boolean {
    return this.code === 'NOT_FOUND' || this.code === 'DIRECTORY_NOT_FOUND'
  }
}

// ==================== 存储操作接口 ====================

export interface StorageOperations {
  // 状态
  isReady: Ref<boolean>
  isSupported: Ref<boolean>
  hasArticlesAccess: Ref<boolean>
  hasMediaAccess: Ref<boolean>

  // 配置
  config: StorageConfig

  // 目录/权限验证
  selectArticlesDir: () => Promise<FileSystemDirectoryHandle | null>
  selectMediaDir: () => Promise<FileSystemDirectoryHandle | null>
  verifyArticlesAccess: () => Promise<boolean>
  verifyMediaAccess: () => Promise<boolean>
  verifyAllAccess: () => Promise<{ articles: boolean; media: boolean }>

  // 文章操作
  loadArticles: () => Promise<Article[]>
  saveArticle: (article: Omit<Article, 'dirHandle'>) => Promise<Article>
  deleteArticle: (id: string) => Promise<void>
  getArticle: (id: string) => Promise<Article | null>

  // 媒体操作
  saveImage: (file: File | Blob, filename?: string) => Promise<string>
  saveImageFromClipboard: () => Promise<string | null>
  loadMediaFiles: () => Promise<MediaFile[]>
  deleteMediaFile: (filename: string) => Promise<void>
  getFileType: (name: string) => 'image' | 'video' | 'other'
}

// ==================== 辅助类型 ====================

export interface InitResult {
  success: boolean
  error?: string
  needsAuth?: boolean
}

export interface SyncResult {
  success: boolean
  uploaded: number
  downloaded: number
  errors: string[]
}

// ==================== 向后兼容的类型别名 ====================

/** @deprecated 使用 GitHubStorageConfig 替代 */
export type GitHubConfig = GitHubStorageConfig

/** @deprecated 使用 GiteeStorageConfig 替代 */
export type GiteeConfig = GiteeStorageConfig
