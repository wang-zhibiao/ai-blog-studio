import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import type { RepoType, RemoteRepoConfig, LocalState } from '~/types'

export type { RepoType, RemoteRepoConfig, LocalState } from '~/types'

export const useStorageStore = defineStore('storage', {
  state: () => ({
    // ===== 远程仓库配置（持久化）=====
    remoteRepos: {
      github: {
        token: '',
        username: '',
        repo: '',
        branch: 'main',
        basePath: '',
        connected: false
      } as RemoteRepoConfig,
      gitee: {
        token: '',
        username: '',
        repo: '',
        branch: 'master',
        basePath: '',
        connected: false
      } as RemoteRepoConfig
    },

    // ===== 本地存储状态（仅运行时，不持久化）=====
    local: {
      connected: false,
      articlesDirHandle: null as FileSystemDirectoryHandle | null,
      mediaDirHandle: null as FileSystemDirectoryHandle | null
    } as LocalState,

    // ===== 当前激活的存储（持久化）=====
    activeRepo: 'local' as RepoType
  }),

  getters: {
    // 当前激活的仓库
    currentRepo: (state): RepoType => state.activeRepo,

    // 是否是本地存储
    isLocal: (state): boolean => state.activeRepo === 'local',

    // 当前远程配置（如果不是本地）
    currentRemoteConfig: (state): RemoteRepoConfig | null => {
      if (state.activeRepo === 'local') return null
      return state.remoteRepos[state.activeRepo]
    },

    // 是否有任何连接
    hasAnyConnection: (state): boolean => {
      return state.local.connected ||
        state.remoteRepos.github.connected ||
        state.remoteRepos.gitee.connected
    },

    // GitHub 配置
    githubConfig: (state): RemoteRepoConfig => state.remoteRepos.github,

    // Gitee 配置
    giteeConfig: (state): RemoteRepoConfig => state.remoteRepos.gitee,

    // 本地存储状态
    localState: (state): LocalState => state.local
  },

  actions: {
    // ===== 远程仓库操作 =====

    setGitHubConfig(config: Partial<RemoteRepoConfig>) {
      this.remoteRepos.github = { ...this.remoteRepos.github, ...config }
    },

    setGiteeConfig(config: Partial<RemoteRepoConfig>) {
      this.remoteRepos.gitee = { ...this.remoteRepos.gitee, ...config }
    },

    setGitHubConnected(connected: boolean) {
      this.remoteRepos.github.connected = connected
    },

    setGiteeConnected(connected: boolean) {
      this.remoteRepos.gitee.connected = connected
    },

    disconnectGitHub() {
      this.remoteRepos.github = {
        token: '',
        username: '',
        repo: '',
        branch: 'main',
        basePath: '',
        connected: false
      }
      if (this.activeRepo === 'github') {
        this.activeRepo = 'local'
      }
    },

    disconnectGitee() {
      this.remoteRepos.gitee = {
        token: '',
        username: '',
        repo: '',
        branch: 'master',
        basePath: '',
        connected: false
      }
      if (this.activeRepo === 'gitee') {
        this.activeRepo = 'local'
      }
    },

    // ===== 本地存储操作 =====

    setLocalConnected(connected: boolean) {
      this.local.connected = connected
    },

    setArticlesDirHandle(handle: FileSystemDirectoryHandle | null) {
      this.local.articlesDirHandle = handle
      this.local.connected = handle !== null
    },

    setMediaDirHandle(handle: FileSystemDirectoryHandle | null) {
      this.local.mediaDirHandle = handle
    },

    clearLocalStorage() {
      this.local = {
        connected: false,
        articlesDirHandle: null,
        mediaDirHandle: null
      }
    },

    // ===== 激活仓库操作 =====

    setActiveRepo(repo: RepoType) {
      // 检查是否可以激活
      if (repo === 'github' && !this.remoteRepos.github.connected) {
        console.warn('GitHub 未连接，无法激活')
        return
      }
      if (repo === 'gitee' && !this.remoteRepos.gitee.connected) {
        console.warn('Gitee 未连接，无法激活')
        return
      }
      this.activeRepo = repo
    },

    // ===== 初始化 =====

    init() {
      // 确保至少有一个激活的仓库
      const hasActive = this.activeRepo === 'local' ||
        (this.activeRepo === 'github' && this.remoteRepos.github.connected) ||
        (this.activeRepo === 'gitee' && this.remoteRepos.gitee.connected)

      if (!hasActive) {
        this.activeRepo = 'local'
      }
    }
  },

  persist: {
    // 只持久化远程配置和激活的仓库
    pick: ['remoteRepos', 'activeRepo']
    // 注意：local 不持久化，因为 File System Access API 句柄无法持久化
  }
})

// 初始化跨标签页同步
if (typeof window !== 'undefined') {
  const { useCrossTabSync } = require('~/composables/useCrossTabSync')
  useCrossTabSync(useStorageStore, {
    channel: 'storage_sync',
    pick: ['remoteRepos', 'activeRepo'],
    strategy: 'replace',
    debug: import.meta.dev
  })
}
