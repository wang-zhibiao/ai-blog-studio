/**
 * 存储相关类型定义
 * 包含仓库配置、远程存储配置等
 */

// 存储类型
export type RepoType = 'local' | 'github' | 'gitee'

// 基础仓库配置接口
export interface RepoConfig {
  id: string
  type: RepoType
  name: string
  icon: string
  isActive: boolean
}

// 本地仓库配置
export interface LocalRepoConfig extends RepoConfig {
  type: 'local'
  path: string
}

// GitHub 仓库配置
export interface GitHubRepoConfig extends RepoConfig {
  type: 'github'
  clientId: string
  clientSecret: string
  token?: string
  username?: string
  repo: string
  branch: string
}

// Gitee 仓库配置
export interface GiteeRepoConfig extends RepoConfig {
  type: 'gitee'
  clientId: string
  clientSecret: string
  token?: string
  username?: string
  repo: string
  branch: string
}

// 仓库配置联合类型
export type RepoConfigUnion = LocalRepoConfig | GitHubRepoConfig | GiteeRepoConfig

// 远程仓库配置（用于存储模块）
export interface RemoteRepoConfig {
  token: string
  username: string
  repo: string
  branch: string
  basePath: string
  connected: boolean
}

// 本地存储状态（仅运行时）
export interface LocalState {
  connected: boolean
  articlesDirHandle: FileSystemDirectoryHandle | null
  mediaDirHandle: FileSystemDirectoryHandle | null
}
