import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
}

export const useRepoStore = defineStore('repo', () => {
  // 仓库列表
  const repos = ref<RepoConfig[]>([
    { id: 'local', name: '本地存储', icon:  'floppy-disk', connected: false, active: true },
    { id: 'github', name: 'GitHub', icon: ['fab', 'github'], connected: false, active: false },
    { id: 'gitee', name: 'Gitee', icon: ['fab', 'gitee'], connected: false, active: false }
  ])

  // 当前活动仓库
  const currentRepo = computed(() => repos.value.find(r => r.active) || repos.value[0])

  // 获取仓库
  const getRepo = (id: RepoType) => repos.value.find(r => r.id === id)

  // 切换仓库
  const setActiveRepo = (id: RepoType) => {
    const repo = getRepo(id)
    if (!repo) return

    repos.value.forEach(r => r.active = false)
    repo.active = true
    saveToStorage()
  }

  // 更新仓库连接状态
  const setRepoConnected = (id: RepoType, connected: boolean, config?: Partial<RepoConfig>) => {
    const repo = getRepo(id)
    if (!repo) return

    repo.connected = connected
    if (config) {
      Object.assign(repo, config)
    }
    saveToStorage()
  }

  // 断开仓库
  const disconnectRepo = (id: RepoType) => {
    const repo = getRepo(id)
    if (!repo) return

    repo.connected = false
    repo.username = undefined
    repo.repo = undefined
    repo.branch = undefined

    // 如果断开的是当前活动仓库，切换到本地
    if (repo.active && id !== 'local') {
      setActiveRepo('local')
    }
    saveToStorage()
  }

  // 保存到 localStorage - 本地仓库的 connected 状态不保存
  const saveToStorage = () => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem('repoConfig', JSON.stringify({
      repos: repos.value.map(r => ({
        id: r.id,
        // 本地仓库的 connected 状态不持久化，因为 File System API 句柄无法持久化
        connected: r.id === 'local' ? false : r.connected,
        active: r.active,
        username: r.username,
        repo: r.repo,
        branch: r.branch
      }))
    }))
  }

  // 从 localStorage 加载
  const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return
    try {
      const saved = localStorage.getItem('repoConfig')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.repos) {
          parsed.repos.forEach((savedRepo: any) => {
            const repo = getRepo(savedRepo.id as RepoType)
            if (repo) {
              // 本地仓库始终设为未连接，因为句柄无法持久化
              repo.connected = savedRepo.id === 'local' ? false : (savedRepo.connected || false)
              repo.active = savedRepo.active || false
              repo.username = savedRepo.username
              repo.repo = savedRepo.repo
              repo.branch = savedRepo.branch
            }
          })
          // 确保至少有一个活动仓库
          if (!repos.value.some(r => r.active)) {
            repos.value[0].active = true
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 初始化
  const init = () => {
    loadFromStorage()
  }

  return {
    repos,
    currentRepo,
    getRepo,
    setActiveRepo,
    setRepoConnected,
    disconnectRepo,
    saveToStorage,
    loadFromStorage,
    init
  }
})
