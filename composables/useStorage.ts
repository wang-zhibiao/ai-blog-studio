/**
 * 统一存储接口
 * 根据当前激活的仓库自动选择本地文件系统或远程存储
 */

import { useStorageStore } from '~/stores/storage'
import { useFileSystem } from '~/composables/useFileSystem'
import type { StorageConfig, StorageOperations } from '~/types/fs'
import type { Article, MediaFile } from '~/types/article'

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
    disconnectGitee: storageStore.disconnectGitee.bind(storageStore)
  }
}

/**
 * 获取当前激活存储的文件系统操作接口
 */
export function useActiveFileSystem(): StorageOperations {
  const storageStore = useStorageStore()
  const repo = storageStore.activeRepo

  // 构建配置
  const config = computed<StorageConfig>(() => {
    if (repo === 'local') {
      return { type: 'local' }
    }

    const remoteConfig = storageStore.remoteRepos[repo]
    if (!remoteConfig?.connected) {
      throw new Error(`${repo} 未连接`)
    }

    if (repo === 'github') {
      return {
        type: 'github',
        token: remoteConfig.token,
        username: remoteConfig.username!,
        repo: remoteConfig.repo,
        branch: remoteConfig.branch,
        basePath: remoteConfig.basePath
      }
    }

    return {
      type: 'gitee',
      token: remoteConfig.token,
      username: remoteConfig.username!,
      repo: remoteConfig.repo,
      branch: remoteConfig.branch,
      basePath: remoteConfig.basePath
    }
  })

  // 使用 useFileSystem 获取操作接口
  return useFileSystem(config.value)
}

/**
 * 简化版：直接操作文章
 */
export function useArticleStorage() {
  const fs = useActiveFileSystem()

  return {
    loadArticles: () => fs.loadArticles(),
    saveArticle: (article: Omit<Article, 'dirHandle'>) => fs.saveArticle(article),
    deleteArticle: (id: string) => fs.deleteArticle(id),
    getArticle: (id: string) => fs.getArticle(id)
  }
}

/**
 * 简化版：直接操作媒体
 */
export function useMediaStorage() {
  const fs = useActiveFileSystem()

  return {
    saveImage: (file: File | Blob, filename?: string) => fs.saveImage(file, filename),
    saveImageFromClipboard: () => fs.saveImageFromClipboard(),
    loadMediaFiles: () => fs.loadMediaFiles(),
    deleteMediaFile: (filename: string) => fs.deleteMediaFile(filename),
    getFileType: (name: string) => fs.getFileType(name)
  }
}
