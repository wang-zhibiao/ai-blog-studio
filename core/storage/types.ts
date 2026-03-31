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
