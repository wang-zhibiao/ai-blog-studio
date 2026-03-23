export type RepoType = 'local' | 'github' | 'gitee'

export interface RepoConfig {
  id: string
  type: RepoType
  name: string
  icon: string
  isActive: boolean
}

export interface LocalRepoConfig extends RepoConfig {
  type: 'local'
  path: string
}

export interface GitHubRepoConfig extends RepoConfig {
  type: 'github'
  clientId: string
  clientSecret: string
  token?: string
  username?: string
  repo: string
  branch: string
}

export interface GiteeRepoConfig extends RepoConfig {
  type: 'gitee'
  clientId: string
  clientSecret: string
  token?: string
  username?: string
  repo: string
  branch: string
}

export type RepoConfigUnion = LocalRepoConfig | GitHubRepoConfig | GiteeRepoConfig
