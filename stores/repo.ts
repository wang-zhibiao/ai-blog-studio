import { defineStore } from 'pinia'
import { loadGitHubConfig, loadGiteeConfig } from '~/composables/useStorage'

export type RepoType = 'local' | 'github' | 'gitee'

export interface RepoConfig {
  id: RepoType
  name: string
  icon: string | string[]
  connected: boolean
  active: boolean
  username?: string
  repo?: string
  branch?: string
  basePath?: string
}

export const useRepoStore = defineStore('repo', {
  state: () => ({
    repos: [
      { id: 'local', name: '本地存储', icon: 'floppy-disk', connected: false, active: true },
      { id: 'github', name: 'GitHub', icon: ['fab', 'github'], connected: false, active: false },
      { id: 'gitee', name: 'Gitee', icon: ['fab', 'gitee'], connected: false, active: false }
    ] as RepoConfig[]
  }),

  getters: {
    currentRepo: (state) => state.repos.find(r => r.active) || state.repos[0],

    getRepo: (state) => (id: RepoType) => state.repos.find(r => r.id === id)
  },

  actions: {
    setActiveRepo(id: RepoType) {
      const repo = this.getRepo(id)
      if (!repo) return

      this.repos.forEach(r => r.active = false)
      repo.active = true
      this.saveToStorage()
    },

    setRepoConnected(id: RepoType, connected: boolean, config?: Partial<RepoConfig>) {
      const repo = this.getRepo(id)
      if (!repo) return

      repo.connected = connected
      if (config) {
        Object.assign(repo, config)
      }
      this.saveToStorage()
    },

    disconnectRepo(id: RepoType) {
      const repo = this.getRepo(id)
      if (!repo) return

      repo.connected = false
      repo.username = undefined
      repo.repo = undefined
      repo.branch = undefined

      // 如果断开的是当前活动仓库，切换到本地
      if (repo.active && id !== 'local') {
        this.setActiveRepo('local')
      }
      this.saveToStorage()
    },

    // 保存到 localStorage - 本地仓库的 connected 状态不保存
    saveToStorage() {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('repoConfig', JSON.stringify({
        repos: this.repos.map(r => ({
          id: r.id,
          // 本地仓库的 connected 状态不持久化，因为 File System API 句柄无法持久化
          connected: r.id === 'local' ? false : r.connected,
          active: r.active,
          username: r.username,
          repo: r.repo,
          branch: r.branch
        }))
      }))
    },

    // 从 localStorage 加载
    loadFromStorage() {
      if (typeof localStorage === 'undefined') return
      try {
        const saved = localStorage.getItem('repoConfig')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.repos) {
            parsed.repos.forEach((savedRepo: any) => {
              const repo = this.getRepo(savedRepo.id as RepoType)
              if (repo) {
                // 本地仓库始终设为未连接，因为句柄无法持久化
                if (savedRepo.id === 'local') {
                  repo.connected = false
                } else {
                  // 远程仓库：检查实际配置是否存在来确定连接状态
                  repo.connected = this.checkRepoConnection(savedRepo.id as RepoType)
                }
                repo.active = savedRepo.active || false
                repo.username = savedRepo.username
                repo.repo = savedRepo.repo
                repo.branch = savedRepo.branch
              }
            })
            // 确保至少有一个活动仓库
            if (!this.repos.some(r => r.active)) {
              this.repos[0].active = true
            }
          }
        }
      } catch {
        // ignore
      }
    },

    // 检查仓库实际连接状态
    checkRepoConnection(id: RepoType): boolean {
      if (id === 'github') {
        const config = loadGitHubConfig()
        return !!config && !!config.token && !!config.repo
      } else if (id === 'gitee') {
        const config = loadGiteeConfig()
        return !!config && !!config.token && !!config.repo
      }
      return false
    },

    // 初始化
    init() {
      this.loadFromStorage()
    }
  },

  persist: true
})
