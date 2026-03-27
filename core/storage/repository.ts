import type { ArticleModel } from '../article'
import type { ArticleId } from '../article'
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
