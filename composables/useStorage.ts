/**
 * 统一存储接口
 * 根据当前激活的仓库自动选择本地文件系统或远程存储
 */

import { useStorageStore } from '~/stores/storage'
import { useFileSystem } from '~/composables/useFileSystem'
import type { StorageConfig, StorageOperations } from '~/types/fs'
import type { Article, MediaFile } from '~/types/article'

/**
 * 获取当前激活存储的文件系统操作接口（延迟获取）
 */
function getActiveFS(): StorageOperations {
  const storageStore = useStorageStore()
  const repo = storageStore.activeRepo

  // 构建配置
  let config: StorageConfig
  if (repo === 'local') {
    config = { type: 'local' }
  } else {
    const remoteConfig = storageStore.remoteRepos[repo]
    if (!remoteConfig?.connected) {
      throw new Error(`${repo} 未连接`)
    }
    if (repo === 'github') {
      config = {
        type: 'github',
        token: remoteConfig.token,
        username: remoteConfig.username!,
        repo: remoteConfig.repo,
        branch: remoteConfig.branch,
        basePath: remoteConfig.basePath
      }
    } else {
      config = {
        type: 'gitee',
        token: remoteConfig.token,
        username: remoteConfig.username!,
        repo: remoteConfig.repo,
        branch: remoteConfig.branch,
        basePath: remoteConfig.basePath
      }
    }
  }

  return useFileSystem(config)
}

/**
 * 获取当前存储配置
 */
export function useStorage() {
  const storageStore = useStorageStore()

  // 计算属性：检查当前存储是否就绪
  const isReady = computed(() => {
    const repo = storageStore.activeRepo
    if (repo === 'local') {
      return storageStore.local.connected
    }
    return storageStore.remoteRepos[repo]?.connected ?? false
  })

  // 计算属性：是否有文章访问权限
  const hasArticlesAccess = computed(() => {
    const repo = storageStore.activeRepo
    if (repo === 'local') {
      return storageStore.local.connected
    }
    return storageStore.remoteRepos[repo]?.connected ?? false
  })

  // 计算属性：是否有媒体访问权限
  const hasMediaAccess = computed(() => {
    const repo = storageStore.activeRepo
    if (repo === 'local') {
      return storageStore.local.connected
    }
    return storageStore.remoteRepos[repo]?.connected ?? false
  })

  // 文章操作方法（延迟获取 FS）
  const loadArticles = async (): Promise<Article[]> => {
    if (!isReady.value) return []
    const fs = getActiveFS()
    return fs.loadArticles()
  }

  const saveArticle = async (article: Omit<Article, 'dirHandle'>): Promise<Article> => {
    const fs = getActiveFS()
    return fs.saveArticle(article)
  }

  const deleteArticle = async (id: string): Promise<void> => {
    const fs = getActiveFS()
    return fs.deleteArticle(id)
  }

  const getArticle = async (id: string): Promise<Article | null> => {
    const fs = getActiveFS()
    return fs.getArticle(id)
  }

  // 媒体操作方法
  const saveImage = async (file: File | Blob, filename?: string): Promise<string> => {
    const fs = getActiveFS()
    return fs.saveImage(file, filename)
  }

  const saveImageFromClipboard = async (): Promise<string | null> => {
    const fs = getActiveFS()
    return fs.saveImageFromClipboard()
  }

  const loadMediaFiles = async (): Promise<MediaFile[]> => {
    if (!isReady.value) return []
    const fs = getActiveFS()
    return fs.loadMediaFiles()
  }

  const deleteMediaFile = async (filename: string): Promise<void> => {
    const fs = getActiveFS()
    return fs.deleteMediaFile(filename)
  }

  // 返回接口
  return {
    // 状态
    isReady,
    hasArticlesAccess,
    hasMediaAccess,
    // 存储状态
    currentRepo: computed(() => storageStore.activeRepo),
    localState: computed(() => storageStore.local),
    remoteRepos: computed(() => storageStore.remoteRepos),
    // 操作方法
    setActiveRepo: storageStore.setActiveRepo.bind(storageStore),
    setLocalConnected: storageStore.setLocalConnected.bind(storageStore),
    setGitHubConfig: storageStore.setGitHubConfig.bind(storageStore),
    setGiteeConfig: storageStore.setGiteeConfig.bind(storageStore),
    disconnectGitHub: storageStore.disconnectGitHub.bind(storageStore),
    disconnectGitee: storageStore.disconnectGitee.bind(storageStore),
    // 文章操作（添加这些方法以兼容现有页面）
    loadArticles,
    saveArticle,
    deleteArticle,
    getArticle,
    // 媒体操作
    saveImage,
    saveImageFromClipboard,
    loadMediaFiles,
    deleteMediaFile
  }
}

/**
 * 获取当前激活存储的文件系统操作接口
 */
export function useActiveFileSystem(): StorageOperations {
  return getActiveFS()
}

/**
 * 简化版：直接操作文章
 */
export function useArticleStorage() {
  return {
    loadArticles: async (): Promise<Article[]> => {
      const fs = getActiveFS()
      return fs.loadArticles()
    },
    saveArticle: (article: Omit<Article, 'dirHandle'>) => {
      const fs = getActiveFS()
      return fs.saveArticle(article)
    },
    deleteArticle: (id: string) => {
      const fs = getActiveFS()
      return fs.deleteArticle(id)
    },
    getArticle: (id: string) => {
      const fs = getActiveFS()
      return fs.getArticle(id)
    }
  }
}

/**
 * 简化版：直接操作媒体
 */
export function useMediaStorage() {
  return {
    saveImage: (file: File | Blob, filename?: string) => {
      const fs = getActiveFS()
      return fs.saveImage(file, filename)
    },
    saveImageFromClipboard: () => {
      const fs = getActiveFS()
      return fs.saveImageFromClipboard()
    },
    loadMediaFiles: async (): Promise<MediaFile[]> => {
      const fs = getActiveFS()
      return fs.loadMediaFiles()
    },
    deleteMediaFile: (filename: string) => {
      const fs = getActiveFS()
      return fs.deleteMediaFile(filename)
    },
    getFileType: (name: string) => {
      const fs = getActiveFS()
      return fs.getFileType(name)
    }
  }
}
