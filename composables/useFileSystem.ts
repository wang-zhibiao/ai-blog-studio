/**
 * 统一文件系统组合函数
 * 整合 local/GitHub/Gitee 三种存储方式，提供统一的接口
 */

import type {
  StorageType,
  StorageConfig,
  LocalStorageConfig,
  GitHubStorageConfig,
  GiteeStorageConfig,
  FileContent,
  FileInfo,
  FileSystemError,
  FileSystemErrorCode,
  StorageOperations,
  InitResult
} from '~/types/fs'
import type { Article, ArticleMeta, MediaFile, ContentFormat } from '~/types/article'
import {
  generateFileName,
  parseFileName,
  generateArticleId
} from '~/types/article'
import { useStorageStore } from '~/stores/storage'

// ==================== 错误处理 ====================

function createFileSystemError(
  message: string,
  code: FileSystemErrorCode,
  status?: number,
  originalError?: unknown
): FileSystemError {
  const error = new Error(message) as FileSystemError
  error.name = 'FileSystemError'
  error.code = code
  error.status = status
  error.originalError = originalError
  error.isAuthError = () => code === 'TOKEN_EXPIRED' || code === 'PERMISSION_DENIED'
  error.isNotFound = () => code === 'NOT_FOUND' || code === 'DIRECTORY_NOT_FOUND'
  return error
}

// ==================== 工具函数 ====================

/**
 * Base64 编码（支持 UTF-8）
 */
function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

/**
 * Base64 解码（支持 UTF-8）
 */
function decodeBase64(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ''))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

/**
 * ArrayBuffer 转 Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * 获取文件类型
 */
function getFileType(name: string): 'image' | 'video' | 'other' {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image'
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video'
  return 'other'
}

// ==================== Local FS 实现 ====================

interface LocalFSState {
  isSupported: boolean
  articlesDirHandle: FileSystemDirectoryHandle | null
  mediaDirHandle: FileSystemDirectoryHandle | null
}

function createLocalFS() {
  const storageStore = useStorageStore()

  const state: LocalFSState = {
    isSupported: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
    articlesDirHandle: null,
    mediaDirHandle: null
  }

  // 从 store 同步句柄
  const syncHandles = () => {
    state.articlesDirHandle = storageStore.local.articlesDirHandle
    state.mediaDirHandle = storageStore.local.mediaDirHandle
  }

  // 选择文章目录
  const selectArticlesDir = async (): Promise<FileSystemDirectoryHandle | null> => {
    if (!state.isSupported) {
      throw createFileSystemError('File System Access API 不被支持', 'NOT_SUPPORTED')
    }
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      })
      storageStore.setArticlesDirHandle(handle)
      syncHandles()
      return handle
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return null
      }
      throw createFileSystemError('选择目录失败: ' + (err as Error).message, 'UNKNOWN_ERROR', undefined, err)
    }
  }

  // 选择媒体目录
  const selectMediaDir = async (): Promise<FileSystemDirectoryHandle | null> => {
    if (!state.isSupported) {
      throw createFileSystemError('File System Access API 不被支持', 'NOT_SUPPORTED')
    }
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      })
      storageStore.setMediaDirHandle(handle)
      syncHandles()
      return handle
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return null
      }
      throw createFileSystemError('选择目录失败: ' + (err as Error).message, 'UNKNOWN_ERROR', undefined, err)
    }
  }

  // 验证权限
  const queryPermission = async (handle: FileSystemDirectoryHandle): Promise<boolean> => {
    try {
      // @ts-ignore
      if (handle.queryPermission) {
        // @ts-ignore
        const permission = await handle.queryPermission({ mode: 'readwrite' })
        return permission === 'granted'
      }
      // 如果不支持 queryPermission，尝试读取
      await handle.values().next()
      return true
    } catch {
      return false
    }
  }

  const verifyArticlesAccess = async (): Promise<boolean> => {
    syncHandles()
    if (!state.articlesDirHandle) return false
    return queryPermission(state.articlesDirHandle)
  }

  const verifyMediaAccess = async (): Promise<boolean> => {
    syncHandles()
    if (!state.mediaDirHandle) return false
    return queryPermission(state.mediaDirHandle)
  }

  const verifyAllAccess = async (): Promise<{ articles: boolean; media: boolean }> => {
    const [articles, media] = await Promise.all([
      verifyArticlesAccess(),
      verifyMediaAccess()
    ])
    return { articles, media }
  }

  // 获取媒体目录句柄
  const getMediaDirHandle = async (): Promise<FileSystemDirectoryHandle> => {
    syncHandles()
    if (state.mediaDirHandle) {
      return state.mediaDirHandle
    }
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }
    return await state.articlesDirHandle.getDirectoryHandle('assets', { create: true })
  }

  // 保存图片
  const saveImage = async (file: File | Blob, filename?: string): Promise<string> => {
    const mediaDir = await getMediaDirHandle()

    let ext = file instanceof File ? file.name.split('.').pop() : 'png'
    const validExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'mp4', 'webm', 'mov', 'avi']
    if (!ext || !validExts.includes(ext.toLowerCase())) {
      ext = 'png'
    }
    const uniqueName = filename || `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

    const fileHandle = await mediaDir.getFileHandle(uniqueName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(file)
    await writable.close()

    return uniqueName
  }

  // 从剪贴板保存图片
  const saveImageFromClipboard = async (): Promise<string | null> => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return null
    }
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            return await saveImage(blob)
          }
        }
      }
    } catch (err) {
      console.warn('剪贴板读取失败:', err)
    }
    return null
  }

  // 加载媒体文件列表
  const loadMediaFiles = async (): Promise<MediaFile[]> => {
    const mediaFiles: MediaFile[] = []
    try {
      const mediaDir = await getMediaDirHandle()
      for await (const entry of mediaDir.values()) {
        if (entry.kind === 'file') {
          try {
            const file = await entry.getFile()
            const fileType = getFileType(entry.name)
            let url = ''
            if (fileType === 'image') {
              url = URL.createObjectURL(file)
            }
            mediaFiles.push({
              id: `${entry.name}-${file.lastModified}`,
              name: entry.name,
              type: fileType,
              size: file.size,
              url,
              blob: file,
              repo: 'local',
              uploadTime: new Date(file.lastModified).toLocaleString('zh-CN')
            })
          } catch (err) {
            console.warn(`读取文件失败: ${entry.name}`, err)
          }
        }
      }
    } catch (err) {
      console.error('读取媒体库失败:', err)
    }
    mediaFiles.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())
    return mediaFiles
  }

  // 删除媒体文件
  const deleteMediaFile = async (filename: string): Promise<void> => {
    const mediaDir = await getMediaDirHandle()
    await mediaDir.removeEntry(filename)
  }

  // 加载元数据
  const loadArticlesMeta = async (): Promise<ArticleMeta[]> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }
    try {
      const metaHandle = await state.articlesDirHandle.getFileHandle('meta.json', { create: false })
      const file = await metaHandle.getFile()
      const content = await file.text()
      const data = JSON.parse(content) as ArticleMeta[]
      return Array.isArray(data) ? data : []
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        return []
      }
      console.warn('读取 meta.json 失败:', err)
      return []
    }
  }

  // 保存元数据
  const saveArticlesMeta = async (articlesMeta: ArticleMeta[]): Promise<void> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }
    const content = JSON.stringify(articlesMeta, null, 2)
    const metaHandle = await state.articlesDirHandle.getFileHandle('meta.json', { create: true })
    const writable = await metaHandle.createWritable()
    await writable.write(content)
    await writable.close()
  }

  // 加载文章列表
  const loadArticles = async (): Promise<Article[]> => {
    const articles: Article[] = []
    try {
      const articlesMeta = await loadArticlesMeta()
      if (articlesMeta.length === 0) return []

      const articlePromises = articlesMeta.map(async (meta) => {
        try {
          const parsed = parseFileName(meta.fileName)
          const title = parsed?.title || 'Untitled'
          let content = ''

          const fileHandle = await state.articlesDirHandle!.getFileHandle(meta.fileName, { create: false })
          const file = await fileHandle.getFile()
          content = await file.text()

          return { id: meta.id, title, meta, content } as Article
        } catch (err) {
          console.warn(`加载文章失败: ${meta.fileName}`, err)
          return null
        }
      })

      const results = await Promise.all(articlePromises)
      articles.push(...results.filter((a): a is Article => a !== null))
    } catch (err) {
      console.error('读取文章列表失败:', err)
    }

    articles.sort((a, b) => new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime())
    return articles
  }

  // 保存文章
  const saveArticle = async (article: Omit<Article, 'dirHandle'>): Promise<Article> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }

    const now = new Date().toISOString()
    const articlesMeta = await loadArticlesMeta()

    const newFileName = generateFileName(
      article.title,
      article.meta.category,
      article.meta.createdAt,
      article.meta.contentFormat
    )

    const existingIndex = articlesMeta.findIndex((m) => m.id === article.id)
    let meta: ArticleMeta

    if (existingIndex >= 0) {
      const oldMeta = articlesMeta[existingIndex]
      const oldFileName = oldMeta.fileName

      if (oldFileName !== newFileName) {
        try {
          await state.articlesDirHandle.removeEntry(oldFileName)
        } catch {
          // 忽略删除失败
        }
      }

      meta = {
        ...oldMeta,
        fileName: newFileName,
        updatedAt: now,
        publishedAt: article.meta.status === 'published' ? article.meta.publishedAt || now : article.meta.publishedAt,
        status: article.meta.status,
        contentFormat: article.meta.contentFormat,
        category: article.meta.category,
        tags: article.meta.tags,
        excerpt: article.meta.excerpt,
        cover: article.meta.cover
      }
      articlesMeta[existingIndex] = meta
    } else {
      meta = {
        id: article.id || generateArticleId(),
        fileName: newFileName,
        createdAt: article.meta.createdAt || now,
        updatedAt: now,
        publishedAt: article.meta.status === 'published' ? now : null,
        status: article.meta.status,
        contentFormat: article.meta.contentFormat,
        category: article.meta.category,
        tags: article.meta.tags,
        excerpt: article.meta.excerpt,
        cover: article.meta.cover,
        views: 0,
        pinned: false,
        order: 0
      }
      articlesMeta.push(meta)
    }

    if (article.content.trim()) {
      const fileHandle = await state.articlesDirHandle.getFileHandle(newFileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(article.content)
      await writable.close()
    }

    await saveArticlesMeta(articlesMeta)

    return { ...article, id: meta.id, meta }
  }

  // 删除文章
  const deleteArticle = async (id: string): Promise<void> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }

    const articlesMeta = await loadArticlesMeta()
    const index = articlesMeta.findIndex((m) => m.id === id)

    if (index >= 0) {
      const meta = articlesMeta[index]

      try {
        await state.articlesDirHandle.removeEntry(meta.fileName)
      } catch {
        // 忽略删除失败
      }

      articlesMeta.splice(index, 1)
      await saveArticlesMeta(articlesMeta)
    }
  }

  // 获取单篇文章
  const getArticle = async (id: string): Promise<Article | null> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }

    const articlesMeta = await loadArticlesMeta()
    const meta = articlesMeta.find((m) => m.id === id)

    if (!meta) return null

    try {
      const parsed = parseFileName(meta.fileName)
      const title = parsed?.title || 'Untitled'

      const fileHandle = await state.articlesDirHandle.getFileHandle(meta.fileName, { create: false })
      const file = await fileHandle.getFile()
      const content = await file.text()

      return { id: meta.id, title, meta, content }
    } catch (err) {
      console.warn(`获取文章失败: ${meta.fileName}`, err)
      return null
    }
  }

  // 同步句柄
  syncHandles()

  return {
    // 状态
    isSupported: computed(() => state.isSupported),
    hasArticlesAccess: computed(() => state.articlesDirHandle !== null),
    hasMediaAccess: computed(() => state.mediaDirHandle !== null),
    isReady: computed(() => state.articlesDirHandle !== null),

    // 配置
    config: { type: 'local' as const },

    // 目录选择
    selectArticlesDir,
    selectMediaDir,

    // 权限验证
    verifyArticlesAccess,
    verifyMediaAccess,
    verifyAllAccess,

    // 媒体操作
    saveImage,
    saveImageFromClipboard,
    loadMediaFiles,
    deleteMediaFile,
    getFileType,

    // 文章操作（Local FS 实现）
    loadArticles,
    saveArticle,
    deleteArticle,
    getArticle
  }
}

// ==================== 远程存储基类 ====================

interface RemoteAPI {
  request: (path: string, options?: RequestInit) => Promise<any>
  getFileContent: (path: string) => Promise<FileContent | null>
  createOrUpdateFile: (path: string, content: string, message: string, sha?: string) => Promise<void>
  deleteFile: (path: string, sha: string, message: string) => Promise<void>
  getDirectoryContents: (path: string) => Promise<FileInfo[]>
}

function createGitHubAPI(config: GitHubStorageConfig): RemoteAPI {
  const branch = config.branch || 'main'
  const basePath = config.basePath || ''
  const apiBase = `https://api.github.com/repos/${config.username}/${config.repo}`

  const getFullPath = (path: string) => basePath ? `${basePath}/${path}` : path

  const request = async (path: string, options: RequestInit = {}): Promise<any> => {
    const url = path.startsWith('http') ? path : `${apiBase}${path}`
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...((options.headers as Record<string, string>) || {})
    }

    try {
      const response = await fetch(url, { ...options, headers })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.message || `GitHub API error: ${response.status}`

        const codeMap: Record<number, FileSystemErrorCode> = {
          401: 'TOKEN_EXPIRED',
          403: 'PERMISSION_DENIED',
          404: 'NOT_FOUND',
          409: 'CONFLICT',
          422: 'VALIDATION_ERROR'
        }

        throw createFileSystemError(message, codeMap[response.status] || 'API_ERROR', response.status)
      }

      if (response.status === 204) return null
      return await response.json()
    } catch (err) {
      if ((err as FileSystemError).code) throw err
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw createFileSystemError('网络错误，请检查网络连接', 'NETWORK_ERROR')
      }
      throw createFileSystemError(err instanceof Error ? err.message : '未知错误', 'UNKNOWN_ERROR', undefined, err)
    }
  }

  const getFileContent = async (path: string): Promise<FileContent | null> => {
    try {
      const fullPath = getFullPath(path)
      const data = await request(`/contents/${encodeURIComponent(fullPath)}?ref=${branch}`)
      if (!data || data.type !== 'file') return null
      return { content: decodeBase64(data.content), sha: data.sha }
    } catch (err) {
      if ((err as FileSystemError).code === 'NOT_FOUND') return null
      throw err
    }
  }

  const createOrUpdateFile = async (path: string, content: string, message: string, sha?: string): Promise<void> => {
    const fullPath = getFullPath(path)
    const body: Record<string, string> = {
      message,
      content: encodeBase64(content),
      branch
    }
    if (sha) body.sha = sha

    await request(`/contents/${encodeURIComponent(fullPath)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  }

  const deleteFile = async (path: string, sha: string, message: string): Promise<void> => {
    const fullPath = getFullPath(path)
    await request(`/contents/${encodeURIComponent(fullPath)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sha, branch })
    })
  }

  const getDirectoryContents = async (path: string): Promise<FileInfo[]> => {
    try {
      const fullPath = getFullPath(path)
      const data = await request(`/contents/${encodeURIComponent(fullPath)}?ref=${branch}`)
      if (!Array.isArray(data)) return []
      return data.map((item: any) => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size || 0,
        downloadUrl: item.download_url,
        type: item.type === 'dir' ? 'directory' : 'file'
      }))
    } catch (err) {
      if ((err as FileSystemError).code === 'NOT_FOUND') return []
      throw err
    }
  }

  return { request, getFileContent, createOrUpdateFile, deleteFile, getDirectoryContents }
}

function createGiteeAPI(config: GiteeStorageConfig): RemoteAPI {
  const branch = config.branch || 'master'
  const basePath = config.basePath || ''
  const apiBase = `https://gitee.com/api/v5/repos/${config.username}/${config.repo}`

  const getFullPath = (path: string) => basePath ? `${basePath}/${path}` : path

  const request = async (path: string, options: RequestInit = {}): Promise<any> => {
    const url = path.startsWith('http') ? path : `${apiBase}${path}`
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    }

    const separator = url.includes('?') ? '&' : '?'
    const urlWithToken = `${url}${separator}access_token=${config.token}`

    try {
      const response = await fetch(urlWithToken, { ...options, headers })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.message || `Gitee API error: ${response.status}`

        const codeMap: Record<number, FileSystemErrorCode> = {
          401: 'TOKEN_EXPIRED',
          403: 'PERMISSION_DENIED',
          404: 'NOT_FOUND',
          409: 'CONFLICT',
          422: 'VALIDATION_ERROR'
        }

        throw createFileSystemError(message, codeMap[response.status] || 'API_ERROR', response.status)
      }

      if (response.status === 204) return null
      return await response.json()
    } catch (err) {
      if ((err as FileSystemError).code) throw err
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw createFileSystemError('网络错误，请检查网络连接', 'NETWORK_ERROR')
      }
      throw createFileSystemError(err instanceof Error ? err.message : '未知错误', 'UNKNOWN_ERROR', undefined, err)
    }
  }

  const getFileContent = async (path: string): Promise<FileContent | null> => {
    try {
      const fullPath = getFullPath(path)
      const data = await request(`/contents/${encodeURIComponent(fullPath)}?ref=${branch}`)
      if (!data || data.type !== 'file') return null
      return { content: decodeBase64(data.content), sha: data.sha }
    } catch (err) {
      if ((err as FileSystemError).code === 'NOT_FOUND') return null
      throw err
    }
  }

  const createOrUpdateFile = async (path: string, content: string, message: string, sha?: string): Promise<void> => {
    const fullPath = getFullPath(path)
    const body: Record<string, string> = {
      message,
      content: encodeBase64(content),
      branch
    }
    if (sha) body.sha = sha

    await request(`/contents/${encodeURIComponent(fullPath)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  }

  const deleteFile = async (path: string, sha: string, message: string): Promise<void> => {
    const fullPath = getFullPath(path)
    await request(`/contents/${encodeURIComponent(fullPath)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sha, branch })
    })
  }

  const getDirectoryContents = async (path: string): Promise<FileInfo[]> => {
    try {
      const fullPath = getFullPath(path)
      const data = await request(`/contents/${encodeURIComponent(fullPath)}?ref=${branch}`)
      if (!Array.isArray(data)) return []
      return data.map((item: any) => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size || 0,
        downloadUrl: item.download_url,
        type: item.type === 'dir' ? 'directory' : 'file'
      }))
    } catch (err) {
      if ((err as FileSystemError).code === 'NOT_FOUND') return []
      throw err
    }
  }

  return { request, getFileContent, createOrUpdateFile, deleteFile, getDirectoryContents }
}

// ==================== 文章操作实现 ====================

interface ArticleOperations {
  loadArticles: () => Promise<Article[]>
  saveArticle: (article: Omit<Article, 'dirHandle'>) => Promise<Article>
  deleteArticle: (id: string) => Promise<void>
  getArticle: (id: string) => Promise<Article | null>
}

function createArticleOperations(
  api: RemoteAPI,
  config: { type: StorageType; basePath?: string; branch?: string; username?: string; repo?: string }
): ArticleOperations {
  // 加载元数据
  const loadArticlesMeta = async (): Promise<ArticleMeta[]> => {
    try {
      const result = await api.getFileContent('meta.json')
      if (!result) return []
      const data = JSON.parse(result.content) as ArticleMeta[]
      return Array.isArray(data) ? data : []
    } catch (err) {
      console.warn('读取 meta.json 失败:', err)
      return []
    }
  }

  // 保存元数据
  const saveArticlesMeta = async (articlesMeta: ArticleMeta[]): Promise<void> => {
    const content = JSON.stringify(articlesMeta, null, 2)
    let sha: string | undefined
    try {
      const existing = await api.getFileContent('meta.json')
      if (existing) sha = existing.sha
    } catch {
      // 文件不存在
    }
    await api.createOrUpdateFile('meta.json', content, sha ? 'Update meta.json' : 'Create meta.json', sha)
  }

  // 加载文章列表
  const loadArticles = async (): Promise<Article[]> => {
    const articles: Article[] = []
    try {
      let articlesMeta = await loadArticlesMeta()
      if (articlesMeta.length === 0) return []

      const articlePromises = articlesMeta.map(async (meta) => {
        try {
          const parsed = parseFileName(meta.fileName)
          const title = parsed?.title || 'Untitled'
          let content = ''
          const result = await api.getFileContent(meta.fileName)
          if (result) content = result.content
          return { id: meta.id, title, meta, content } as Article
        } catch (err) {
          console.warn(`加载文章失败: ${meta.fileName}`, err)
          return null
        }
      })

      const results = await Promise.all(articlePromises)
      articles.push(...results.filter((a): a is Article => a !== null))
    } catch (err) {
      console.error('读取文章列表失败:', err)
    }

    articles.sort((a, b) => new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime())
    return articles
  }

  // 保存文章
  const saveArticle = async (article: Omit<Article, 'dirHandle'>): Promise<Article> => {
    const now = new Date().toISOString()
    const articlesMeta = await loadArticlesMeta()

    const newFileName = generateFileName(
      article.title,
      article.meta.category,
      article.meta.createdAt,
      article.meta.contentFormat
    )

    const existingIndex = articlesMeta.findIndex((m) => m.id === article.id)
    let meta: ArticleMeta

    if (existingIndex >= 0) {
      const oldMeta = articlesMeta[existingIndex]
      const oldFileName = oldMeta.fileName

      if (oldFileName !== newFileName) {
        try {
          const oldResult = await api.getFileContent(oldFileName)
          if (oldResult) {
            await api.deleteFile(oldFileName, oldResult.sha, `Delete old article: ${oldFileName}`)
          }
        } catch {
          // 忽略删除失败
        }
      }

      meta = {
        ...oldMeta,
        fileName: newFileName,
        updatedAt: now,
        publishedAt: article.meta.status === 'published' ? article.meta.publishedAt || now : article.meta.publishedAt,
        status: article.meta.status,
        contentFormat: article.meta.contentFormat,
        category: article.meta.category,
        tags: article.meta.tags,
        excerpt: article.meta.excerpt,
        cover: article.meta.cover
      }
      articlesMeta[existingIndex] = meta
    } else {
      meta = {
        id: article.id || generateArticleId(),
        fileName: newFileName,
        createdAt: article.meta.createdAt || now,
        updatedAt: now,
        publishedAt: article.meta.status === 'published' ? now : null,
        status: article.meta.status,
        contentFormat: article.meta.contentFormat,
        category: article.meta.category,
        tags: article.meta.tags,
        excerpt: article.meta.excerpt,
        cover: article.meta.cover,
        views: 0,
        pinned: false,
        order: 0
      }
      articlesMeta.push(meta)
    }

    if (article.content.trim()) {
      let sha: string | undefined
      try {
        const existing = await api.getFileContent(newFileName)
        if (existing) sha = existing.sha
      } catch {
        // 文件不存在
      }

      await api.createOrUpdateFile(
        newFileName,
        article.content,
        sha ? `Update article: ${newFileName}` : `Create article: ${newFileName}`,
        sha
      )
    }

    await saveArticlesMeta(articlesMeta)

    return { ...article, id: meta.id, meta }
  }

  // 删除文章
  const deleteArticle = async (id: string): Promise<void> => {
    const articlesMeta = await loadArticlesMeta()
    const index = articlesMeta.findIndex((m) => m.id === id)

    if (index >= 0) {
      const meta = articlesMeta[index]

      try {
        const result = await api.getFileContent(meta.fileName)
        if (result) {
          await api.deleteFile(meta.fileName, result.sha, `Delete article: ${meta.fileName}`)
        }
      } catch {
        // 忽略删除失败
      }

      articlesMeta.splice(index, 1)
      await saveArticlesMeta(articlesMeta)
    }
  }

  // 获取单篇文章
  const getArticle = async (id: string): Promise<Article | null> => {
    const articlesMeta = await loadArticlesMeta()
    const meta = articlesMeta.find((m) => m.id === id)

    if (!meta) return null

    try {
      const parsed = parseFileName(meta.fileName)
      const title = parsed?.title || 'Untitled'

      let content = ''
      const result = await api.getFileContent(meta.fileName)
      if (result) content = result.content

      return { id: meta.id, title, meta, content }
    } catch (err) {
      console.warn(`获取文章失败: ${meta.fileName}`, err)
      return null
    }
  }

  return { loadArticles, saveArticle, deleteArticle, getArticle }
}

// ==================== 主组合函数 ====================

export function useFileSystem(config: StorageConfig) {
  const type = config.type

  // 根据类型创建对应的 API
  const createStorage = (): StorageOperations => {
    switch (type) {
      case 'local':
        return createLocalFS()

      case 'github': {
        const api = createGitHubAPI(config as GitHubStorageConfig)
        const articles = createArticleOperations(api, config)
        // 远程存储需要额外的媒体操作实现
        return {
          ...createRemoteStorageBase(api, config),
          ...articles
        } as StorageOperations
      }

      case 'gitee': {
        const api = createGiteeAPI(config as GiteeStorageConfig)
        const articles = createArticleOperations(api, config)
        return {
          ...createRemoteStorageBase(api, config),
          ...articles
        } as StorageOperations
      }

      default:
        throw createFileSystemError(`不支持的存储类型: ${type}`, 'VALIDATION_ERROR')
    }
  }

  return createStorage()
}

// ==================== 远程存储基础实现 ====================

function createRemoteStorageBase(api: RemoteAPI, config: StorageConfig) {
  const type = config.type
  const isGitHub = type === 'github'

  // 验证访问权限
  const verifyAccess = async (): Promise<{ valid: boolean; error?: string }> => {
    try {
      await api.request('')
      return { valid: true }
    } catch (err) {
      if ((err as FileSystemError).code) {
        return { valid: false, error: (err as FileSystemError).message }
      }
      return { valid: false, error: '验证失败' }
    }
  }

  // 保存图片
  const saveImage = async (file: File | Blob, filename?: string): Promise<string> => {
    let ext = file instanceof File ? file.name.split('.').pop() : 'png'
    const validExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'mp4', 'webm', 'mov', 'avi']
    if (!ext || !validExts.includes(ext.toLowerCase())) ext = 'png'

    const uniqueName = filename || `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
    const buffer = await file.arrayBuffer()
    const base64Content = arrayBufferToBase64(buffer)
    const path = `assets/${uniqueName}`

    let sha: string | undefined
    try {
      const existing = await api.getFileContent(path)
      if (existing) sha = existing.sha
    } catch {
      // 文件不存在
    }

    const uploadBody: Record<string, string> = {
      message: sha ? `Update image: ${uniqueName}` : `Add image: ${uniqueName}`,
      content: base64Content,
      branch: (config as any).branch || (isGitHub ? 'main' : 'master')
    }
    if (sha) uploadBody.sha = sha

    // 直接调用请求，避免双重编码
    const apiBase = isGitHub
      ? `https://api.github.com/repos/${(config as GitHubStorageConfig).username}/${config.repo}`
      : `https://gitee.com/api/v5/repos/${(config as GiteeStorageConfig).username}/${config.repo}`

    await fetch(`${apiBase}/contents/${encodeURIComponent(path)}`, {
      method: isGitHub ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(isGitHub ? { 'Authorization': `Bearer ${(config as GitHubStorageConfig).token}` } : {})
      },
      body: JSON.stringify(uploadBody)
    })

    // 返回 raw URL
    if (isGitHub) {
      return `https://raw.githubusercontent.com/${(config as GitHubStorageConfig).username}/${config.repo}/${(config as GitHubStorageConfig).branch || 'main'}/${path}`
    } else {
      return `https://gitee.com/${(config as GiteeStorageConfig).username}/${config.repo}/raw/${(config as GiteeStorageConfig).branch || 'master'}/${path}`
    }
  }

  // 加载媒体文件列表
  const loadMediaFiles = async (): Promise<MediaFile[]> => {
    const mediaFiles: MediaFile[] = []
    try {
      const contents = await api.getDirectoryContents('assets')
      for (const item of contents) {
        if (item.type === 'file') {
          const fileType = getFileType(item.name)
          mediaFiles.push({
            id: `${item.name}-${item.sha}`,
            name: item.name,
            type: fileType,
            size: item.size,
            url: item.downloadUrl || '',
            repo: `${(config as any).username}/${config.repo}`,
            uploadTime: new Date().toLocaleString('zh-CN')
          })
        }
      }
    } catch (err) {
      console.error('读取媒体库失败:', err)
    }
    return mediaFiles
  }

  // 删除媒体文件
  const deleteMediaFile = async (filename: string): Promise<void> => {
    const path = `assets/${filename}`
    const result = await api.getFileContent(path)
    if (!result) {
      throw createFileSystemError('文件不存在', 'NOT_FOUND', 404)
    }
    await api.deleteFile(path, result.sha, `Delete media: ${filename}`)
  }

  return {
    // 状态
    isReady: computed(() => true),
    isSupported: computed(() => true),
    hasArticlesAccess: computed(() => true),
    hasMediaAccess: computed(() => true),

    // 配置
    config,

    // 目录选择（远程存储不需要）
    selectArticlesDir: async () => null,
    selectMediaDir: async () => null,

    // 权限验证
    verifyArticlesAccess: async () => { const r = await verifyAccess(); return r.valid },
    verifyMediaAccess: async () => { const r = await verifyAccess(); return r.valid },
    verifyAllAccess: async () => {
      const r = await verifyAccess()
      return { articles: r.valid, media: r.valid }
    },

    // 媒体操作
    saveImage,
    saveImageFromClipboard: async () => null,
    loadMediaFiles,
    deleteMediaFile,
    getFileType
  }
}

// ==================== 导出 ====================

export { createLocalFS, createGitHubAPI, createGiteeAPI, createArticleOperations }
export { encodeBase64, decodeBase64, arrayBufferToBase64, getFileType, createFileSystemError }
