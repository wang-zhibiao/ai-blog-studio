import { useRepoStore } from '~/stores/repo'
import { useLocalFS } from '~/composables/useLocalFS'
import { useGitHubFS, type GitHubConfig } from '~/composables/useGitHubFS'
import { useGiteeFS, type GiteeConfig } from '~/composables/useGiteeFS'
import type { Article, MediaFile } from '~/types/article'

/**
 * 统一存储接口
 * 根据当前激活的仓库自动选择本地文件系统或远程存储
 */
export function useStorage() {
  const repoStore = useRepoStore()
  const localFS = useLocalFS()

  // 计算属性：检查当前存储是否就绪
  const isReady = computed(() => {
    const repo = repoStore.currentRepo
    if (!repo) return false
    if (repo.id === 'local') {
      return localFS.hasArticlesAccess.value
    }
    return repo.connected
  })

  // 计算属性：是否有文章访问权限
  const hasArticlesAccess = computed(() => {
    const repo = repoStore.currentRepo
    if (!repo) return false
    if (repo.id === 'local') {
      return localFS.hasArticlesAccess.value
    }
    return repo.connected
  })

  // 计算属性：是否有媒体访问权限
  const hasMediaAccess = computed(() => {
    const repo = repoStore.currentRepo
    if (!repo) return false
    if (repo.id === 'local') {
      return localFS.hasMediaAccess.value || localFS.hasArticlesAccess.value
    }
    return repo.connected
  })

  // 获取远程存储实例
  const getRemoteStorage = () => {
    const repo = repoStore.currentRepo
    if (!repo) throw new Error('未选择存储仓库')
    if (repo.id === 'github') {
      const config = loadGitHubConfig()
      if (!config) throw new Error('GitHub 未配置')
      return useGitHubFS(config)
    } else if (repo.id === 'gitee') {
      const config = loadGiteeConfig()
      if (!config) throw new Error('Gitee 未配置')
      return useGiteeFS(config)
    }
    throw new Error('未知的仓库类型')
  }

  // 加载文章列表
  const loadArticles = async (): Promise<Article[]> => {
    const repo = repoStore.currentRepo
    if (!repo) throw new Error('未选择存储仓库')
    if (repo.id === 'local') {
      return localFS.loadArticles()
    } else {
      const remote = getRemoteStorage()
      return remote.loadArticles()
    }
  }

  // 保存文章
  const saveArticle = async (article: Omit<Article, 'dirHandle'>): Promise<Article> => {
    const repo = repoStore.currentRepo
    if (!repo) throw new Error('未选择存储仓库')
    if (repo.id === 'local') {
      return localFS.saveArticle(article)
    } else {
      const remote = getRemoteStorage()
      return remote.saveArticle(article)
    }
  }

  // 删除文章
  const deleteArticle = async (id: string): Promise<void> => {
    const repo = repoStore.currentRepo
    if (!repo) throw new Error('未选择存储仓库')
    if (repo.id === 'local') {
      return localFS.deleteArticle(id)
    } else {
      const remote = getRemoteStorage()
      return remote.deleteArticle(id)
    }
  }

  // 加载媒体文件列表
  const loadMediaFiles = async (): Promise<MediaFile[]> => {
    const repo = repoStore.currentRepo
    if (!repo) throw new Error('未选择存储仓库')
    if (repo.id === 'local') {
      return localFS.loadMediaFiles()
    } else {
      const remote = getRemoteStorage()
      return remote.loadMediaFiles()
    }
  }

  // 保存图片
  const saveImage = async (file: File | Blob, filename?: string): Promise<string> => {
    const repo = repoStore.currentRepo
    if (!repo) throw new Error('未选择存储仓库')
    if (repo.id === 'local') {
      return localFS.saveImage(file, filename)
    } else {
      const remote = getRemoteStorage()
      return remote.saveImage(file, filename)
    }
  }

  // 删除媒体文件
  const deleteMediaFile = async (filename: string): Promise<void> => {
    const repo = repoStore.currentRepo
    if (!repo) throw new Error('未选择存储仓库')
    if (repo.id === 'local') {
      return localFS.deleteMediaFile(filename)
    } else {
      const remote = getRemoteStorage()
      return remote.deleteMediaFile(filename)
    }
  }

  // 获取文件类型
  const getFileType = (name: string): 'image' | 'video' | 'other' => {
    const ext = name.split('.').pop()?.toLowerCase() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video'
    return 'other'
  }

  return {
    // 状态
    isReady,
    hasArticlesAccess,
    hasMediaAccess,
    // 文章操作
    loadArticles,
    saveArticle,
    deleteArticle,
    // 媒体操作
    loadMediaFiles,
    saveImage,
    deleteMediaFile,
    getFileType
  }
}

// 辅助函数：从 localStorage 加载 GitHub 配置
export function loadGitHubConfig(): GitHubConfig | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const saved = localStorage.getItem('githubConfig')
    if (saved) {
      return JSON.parse(saved) as GitHubConfig
    }
  } catch {
    // ignore
  }
  return null
}

// 辅助函数：从 localStorage 加载 Gitee 配置
export function loadGiteeConfig(): GiteeConfig | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const saved = localStorage.getItem('giteeConfig')
    if (saved) {
      return JSON.parse(saved) as GiteeConfig
    }
  } catch {
    // ignore
  }
  return null
}

// 导出辅助函数，供设置页面使用
export function saveGitHubConfig(config: GitHubConfig): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem('githubConfig', JSON.stringify(config))
}

export function saveGiteeConfig(config: GiteeConfig): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem('giteeConfig', JSON.stringify(config))
}

export function clearGitHubConfig(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem('githubConfig')
}

export function clearGiteeConfig(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem('giteeConfig')
}
