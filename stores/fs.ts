import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRepoStore } from './repo'

export interface FsConfig {
  articlesPath: string
  mediaPath: string
}

export const useFsStore = defineStore('fs', () => {
  const repoStore = useRepoStore()

  // 配置状态
  const articlesPath = ref('')
  const mediaPath = ref('')

  // 句柄状态（不持久化，只在内存中）
  const articlesDirHandle = ref<FileSystemDirectoryHandle | null>(null)
  const mediaDirHandle = ref<FileSystemDirectoryHandle | null>(null)

  // 验证权限状态
  const articlesAccessVerified = ref(false)
  const mediaAccessVerified = ref(false)

  // 计算属性
  const hasArticlesAccess = computed(() =>
    articlesDirHandle.value !== null && articlesAccessVerified.value
  )
  const hasMediaAccess = computed(() =>
    mediaDirHandle.value !== null && mediaAccessVerified.value
  )
  const hasAnyAccess = computed(() => hasArticlesAccess.value || hasMediaAccess.value)

  // 配置对象
  const config = computed(() => ({
    articlesPath: articlesPath.value,
    mediaPath: mediaPath.value,
    articlesDirHandle: articlesDirHandle.value,
    mediaDirHandle: mediaDirHandle.value
  }))

  // 更新本地存储连接状态
  const updateLocalRepoStatus = () => {
    repoStore.setRepoConnected('local', hasArticlesAccess.value)
  }

  // 设置文章目录句柄
  const setArticlesDirHandle = (handle: FileSystemDirectoryHandle | null) => {
    articlesDirHandle.value = handle
    articlesAccessVerified.value = handle !== null
    if (handle) {
      articlesPath.value = handle.name || ''
      saveToStorage()
    }
    updateLocalRepoStatus()
  }

  // 设置媒体目录句柄
  const setMediaDirHandle = (handle: FileSystemDirectoryHandle | null) => {
    mediaDirHandle.value = handle
    mediaAccessVerified.value = handle !== null
    if (handle) {
      mediaPath.value = handle.name || ''
      saveToStorage()
    }
    updateLocalRepoStatus()
  }

  // 验证文章目录权限
  const verifyArticlesAccess = async (): Promise<boolean> => {
    if (!articlesDirHandle.value) {
      articlesAccessVerified.value = false
      updateLocalRepoStatus()
      return false
    }
    try {
      // 尝试查询权限
      const permission = await articlesDirHandle.value.queryPermission({ mode: 'readwrite' })
      if (permission === 'granted') {
        articlesAccessVerified.value = true
        updateLocalRepoStatus()
        return true
      }
      // 尝试请求权限
      const requestResult = await articlesDirHandle.value.requestPermission({ mode: 'readwrite' })
      articlesAccessVerified.value = requestResult === 'granted'
      updateLocalRepoStatus()
      return articlesAccessVerified.value
    } catch {
      articlesAccessVerified.value = false
      updateLocalRepoStatus()
      return false
    }
  }

  // 验证媒体目录权限
  const verifyMediaAccess = async (): Promise<boolean> => {
    if (!mediaDirHandle.value) {
      mediaAccessVerified.value = false
      updateLocalRepoStatus()
      return false
    }
    try {
      const permission = await mediaDirHandle.value.queryPermission({ mode: 'readwrite' })
      if (permission === 'granted') {
        mediaAccessVerified.value = true
        updateLocalRepoStatus()
        return true
      }
      const requestResult = await mediaDirHandle.value.requestPermission({ mode: 'readwrite' })
      mediaAccessVerified.value = requestResult === 'granted'
      updateLocalRepoStatus()
      return mediaAccessVerified.value
    } catch {
      mediaAccessVerified.value = false
      updateLocalRepoStatus()
      return false
    }
  }

  // 验证所有权限
  const verifyAllAccess = async (): Promise<{ articles: boolean; media: boolean }> => {
    const [articlesOk, mediaOk] = await Promise.all([
      verifyArticlesAccess(),
      verifyMediaAccess()
    ])
    return { articles: articlesOk, media: mediaOk }
  }

  // 清除文章目录
  const clearArticlesDir = () => {
    articlesDirHandle.value = null
    articlesAccessVerified.value = false
    articlesPath.value = ''
    saveToStorage()
    updateLocalRepoStatus()
  }

  // 清除媒体目录
  const clearMediaDir = () => {
    mediaDirHandle.value = null
    mediaAccessVerified.value = false
    mediaPath.value = ''
    saveToStorage()
    updateLocalRepoStatus()
  }

  // 保存到 localStorage
  const saveToStorage = () => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem('fsConfig', JSON.stringify({
      articlesPath: articlesPath.value,
      mediaPath: mediaPath.value
    }))
  }

  // 从 localStorage 加载
  const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return
    try {
      const saved = localStorage.getItem('fsConfig')
      if (saved) {
        const parsed = JSON.parse(saved)
        articlesPath.value = parsed.articlesPath || ''
        mediaPath.value = parsed.mediaPath || ''
      }
    } catch {
      // ignore
    }
  }

  // 初始化
  const init = () => {
    loadFromStorage()
    // 初始化时同步状态到 repoStore
    updateLocalRepoStatus()
  }

  return {
    // 状态
    articlesPath,
    mediaPath,
    articlesDirHandle,
    mediaDirHandle,
    articlesAccessVerified,
    mediaAccessVerified,

    // 计算属性
    hasArticlesAccess,
    hasMediaAccess,
    hasAnyAccess,
    config,

    // 方法
    setArticlesDirHandle,
    setMediaDirHandle,
    verifyArticlesAccess,
    verifyMediaAccess,
    verifyAllAccess,
    clearArticlesDir,
    clearMediaDir,
    saveToStorage,
    loadFromStorage,
    init
  }
})
