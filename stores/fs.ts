import { defineStore } from 'pinia'
import { useRepoStore } from './repo'

export interface FsConfig {
  articlesPath: string
  mediaPath: string
}

export const useFsStore = defineStore('fs', {
  state: () => ({
    // 配置状态
    articlesPath: '',
    mediaPath: '',

    // 句柄状态（不持久化，只在内存中）
    articlesDirHandle: null as FileSystemDirectoryHandle | null,
    mediaDirHandle: null as FileSystemDirectoryHandle | null,

    // 验证权限状态
    articlesAccessVerified: false,
    mediaAccessVerified: false
  }),

  getters: {
    hasArticlesAccess: (state) => state.articlesDirHandle !== null && state.articlesAccessVerified,

    hasMediaAccess: (state) => state.mediaDirHandle !== null && state.mediaAccessVerified,

    hasAnyAccess: (state) => state.articlesDirHandle !== null && state.articlesAccessVerified || state.mediaDirHandle !== null && state.mediaAccessVerified,

    config: (state) => ({
      articlesPath: state.articlesPath,
      mediaPath: state.mediaPath,
      articlesDirHandle: state.articlesDirHandle,
      mediaDirHandle: state.mediaDirHandle
    })
  },

  actions: {
    // 更新本地存储连接状态
    updateLocalRepoStatus() {
      const repoStore = useRepoStore()
      repoStore.setRepoConnected('local', this.hasArticlesAccess)
    },

    // 设置文章目录句柄
    setArticlesDirHandle(handle: FileSystemDirectoryHandle | null) {
      this.articlesDirHandle = handle
      this.articlesAccessVerified = handle !== null
      if (handle) {
        this.articlesPath = handle.name || ''
        this.saveToStorage()
      }
      this.updateLocalRepoStatus()
    },

    // 设置媒体目录句柄
    setMediaDirHandle(handle: FileSystemDirectoryHandle | null) {
      this.mediaDirHandle = handle
      this.mediaAccessVerified = handle !== null
      if (handle) {
        this.mediaPath = handle.name || ''
        this.saveToStorage()
      }
      this.updateLocalRepoStatus()
    },

    // 验证文章目录权限
    async verifyArticlesAccess(): Promise<boolean> {
      if (!this.articlesDirHandle) {
        this.articlesAccessVerified = false
        this.updateLocalRepoStatus()
        return false
      }
      try {
        // 尝试查询权限
        const permission = await this.articlesDirHandle.queryPermission({ mode: 'readwrite' })
        if (permission === 'granted') {
          this.articlesAccessVerified = true
          this.updateLocalRepoStatus()
          return true
        }
        // 尝试请求权限
        const requestResult = await this.articlesDirHandle.requestPermission({ mode: 'readwrite' })
        this.articlesAccessVerified = requestResult === 'granted'
        this.updateLocalRepoStatus()
        return this.articlesAccessVerified
      } catch {
        this.articlesAccessVerified = false
        this.updateLocalRepoStatus()
        return false
      }
    },

    // 验证媒体目录权限
    async verifyMediaAccess(): Promise<boolean> {
      if (!this.mediaDirHandle) {
        this.mediaAccessVerified = false
        this.updateLocalRepoStatus()
        return false
      }
      try {
        const permission = await this.mediaDirHandle.queryPermission({ mode: 'readwrite' })
        if (permission === 'granted') {
          this.mediaAccessVerified = true
          this.updateLocalRepoStatus()
          return true
        }
        const requestResult = await this.mediaDirHandle.requestPermission({ mode: 'readwrite' })
        this.mediaAccessVerified = requestResult === 'granted'
        this.updateLocalRepoStatus()
        return this.mediaAccessVerified
      } catch {
        this.mediaAccessVerified = false
        this.updateLocalRepoStatus()
        return false
      }
    },

    // 验证所有权限
    async verifyAllAccess(): Promise<{ articles: boolean; media: boolean }> {
      const [articlesOk, mediaOk] = await Promise.all([
        this.verifyArticlesAccess(),
        this.verifyMediaAccess()
      ])
      return { articles: articlesOk, media: mediaOk }
    },

    // 清除文章目录
    clearArticlesDir() {
      this.articlesDirHandle = null
      this.articlesAccessVerified = false
      this.articlesPath = ''
      this.saveToStorage()
      this.updateLocalRepoStatus()
    },

    // 清除媒体目录
    clearMediaDir() {
      this.mediaDirHandle = null
      this.mediaAccessVerified = false
      this.mediaPath = ''
      this.saveToStorage()
      this.updateLocalRepoStatus()
    },

    // 保存到 localStorage
    saveToStorage() {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('fsConfig', JSON.stringify({
        articlesPath: this.articlesPath,
        mediaPath: this.mediaPath
      }))
    },

    // 从 localStorage 加载
    loadFromStorage() {
      if (typeof localStorage === 'undefined') return
      try {
        const saved = localStorage.getItem('fsConfig')
        if (saved) {
          const parsed = JSON.parse(saved)
          this.articlesPath = parsed.articlesPath || ''
          this.mediaPath = parsed.mediaPath || ''
        }
      } catch {
        // ignore
      }
    },

    // 初始化
    init() {
      this.loadFromStorage()
      // 初始化时同步状态到 repoStore
      this.updateLocalRepoStatus()
    }
  },

  persist: true
})
