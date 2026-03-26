/**
 * 统一导出所有类型定义
 *
 * 使用方式：
 * import type { Article, Category, AIConfig } from '~/types'
 */

// ==================== Storage ====================
export type {
  RepoType,
  RepoConfig,
  LocalRepoConfig,
  GitHubRepoConfig,
  GiteeRepoConfig,
  RepoConfigUnion,
  RemoteRepoConfig,
  LocalState
} from './storage'

// ==================== Article ====================
export type {
  Article,
  ArticleMeta,
  EditorArticle,
  ArticleStats,
  ArticleQuery,
  MediaFile,
  ParsedFileName,
  ContentFormat
} from './article'

export {
  parseFileName,
  generateFileName,
  generateArticleId,
  generateExcerpt,
  extractImagesFromContent
} from './article'

// ==================== Taxonomy ====================
export type {
  Category,
  Tag
} from './taxonomy'

// ==================== AI ====================
export type {
  AIProvider,
  AIConfig,
  AIAction,
  AIResponse,
  AIUsage
} from './ai'

// ==================== Theme ====================
export type {
  ThemeColor,
  ThemeMode,
  FullThemeColors
} from './theme'

// ==================== Unified FS ====================
export type {
  StorageType,
  StorageConfig,
  LocalStorageConfig,
  GitHubStorageConfig,
  GiteeStorageConfig,
  FileInfo,
  FileContent,
  FileSystemError,
  FileSystemErrorCode,
  StorageOperations,
  InitResult
} from './fs'

export { FileSystemError as FileSystemErrorClass } from './fs'
