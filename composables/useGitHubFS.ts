import type { Article, ArticleMeta, MediaFile, ContentFormat } from '~/types/article'
import { generateFileName, parseFileName, generateArticleId, generateExcerpt } from '~/types/article'
import type { GitHubConfig } from '~/types/file-system'

export type { GitHubConfig } from '~/types/file-system'


// GitHub API 响应类型
interface GitHubFileResponse {
  content: string
  sha: string
  name: string
  path: string
  type: 'file' | 'dir'
  download_url?: string
}

interface GitHubDirectoryResponse {
  name: string
  path: string
  sha: string
  type: 'file' | 'dir'
  size: number
  download_url?: string
}

// 错误类型
export class GitHubFSError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message)
    this.name = 'GitHubFSError'
  }
}

export function useGitHubFS(config: GitHubConfig) {
  const branch = config.branch || 'main'
  const basePath = config.basePath || ''

  // 计算完整路径
  const getFullPath = (path: string) => {
    return basePath ? `${basePath}/${path}` : path
  }

  // GitHub API 基础 URL
  const apiBase = `https://api.github.com/repos/${config.username}/${config.repo}`

  // GitHub API 请求封装
  async function githubRequest(path: string, options: RequestInit = {}): Promise<any> {
    const url = path.startsWith('http') ? path : `${apiBase}${path}`

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...((options.headers as Record<string, string>) || {})
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.message || `GitHub API error: ${response.status}`

        if (response.status === 401) {
          throw new GitHubFSError('Token 已失效，请重新授权', 'TOKEN_EXPIRED', 401)
        } else if (response.status === 403) {
          throw new GitHubFSError('权限不足，请检查 Token 权限', 'PERMISSION_DENIED', 403)
        } else if (response.status === 404) {
          throw new GitHubFSError('文件或目录不存在', 'NOT_FOUND', 404)
        } else if (response.status === 409) {
          throw new GitHubFSError('文件已存在或存在冲突', 'CONFLICT', 409)
        } else if (response.status === 422) {
          throw new GitHubFSError('请求参数错误: ' + message, 'VALIDATION_ERROR', 422)
        }

        throw new GitHubFSError(message, 'API_ERROR', response.status)
      }

      // 204 No Content
      if (response.status === 204) {
        return null
      }

      return await response.json()
    } catch (err) {
      if (err instanceof GitHubFSError) {
        throw err
      }

      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new GitHubFSError('网络错误，请检查网络连接', 'NETWORK_ERROR')
      }

      throw new GitHubFSError(
        err instanceof Error ? err.message : '未知错误',
        'UNKNOWN_ERROR'
      )
    }
  }

  // 获取文件内容
  async function getFileContent(path: string): Promise<{ content: string; sha: string } | null> {
    try {
      const fullPath = getFullPath(path)
      const data = await githubRequest(`/contents/${encodeURIComponent(fullPath)}?ref=${branch}`)

      if (!data || data.type !== 'file') {
        return null
      }

      // GitHub 返回的 content 是 base64 编码的
      // 使用 decodeURIComponent + escape 正确处理 UTF-8 编码的中文
      const binaryString = atob(data.content.replace(/\s/g, ''))
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const content = new TextDecoder().decode(bytes)
      return { content, sha: data.sha }
    } catch (err) {
      if (err instanceof GitHubFSError && err.code === 'NOT_FOUND') {
        return null
      }
      throw err
    }
  }

  // 创建或更新文件
  async function createOrUpdateFile(
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<void> {
    const fullPath = getFullPath(path)
    const body: Record<string, string> = {
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch
    }

    if (sha) {
      body.sha = sha
    }

    await githubRequest(`/contents/${encodeURIComponent(fullPath)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }

  // 删除文件
  async function deleteFile(path: string, sha: string, message: string): Promise<void> {
    const fullPath = getFullPath(path)

    await githubRequest(`/contents/${encodeURIComponent(fullPath)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        sha,
        branch
      })
    })
  }

  // 获取目录内容
  async function getDirectoryContents(path: string): Promise<GitHubDirectoryResponse[]> {
    try {
      const fullPath = getFullPath(path)
      const data = await githubRequest(`/contents/${encodeURIComponent(fullPath)}?ref=${branch}`)

      if (!Array.isArray(data)) {
        return []
      }

      return data
    } catch (err) {
      if (err instanceof GitHubFSError && err.code === 'NOT_FOUND') {
        return []
      }
      throw err
    }
  }

  // 读取 meta.json
  async function loadArticlesMeta(): Promise<ArticleMeta[]> {
    try {
      const result = await getFileContent('meta.json')
      if (!result) {
        return []
      }
      const data = JSON.parse(result.content) as ArticleMeta[]
      return Array.isArray(data) ? data : []
    } catch (err) {
      console.warn('读取 meta.json 失败:', err)
      return []
    }
  }

  // 保存 meta.json
  async function saveArticlesMeta(articlesMeta: ArticleMeta[]): Promise<void> {
    const content = JSON.stringify(articlesMeta, null, 2)

    // 尝试获取已存在的 sha
    let sha: string | undefined
    try {
      const existing = await getFileContent('meta.json')
      if (existing) {
        sha = existing.sha
      }
    } catch {
      // 文件不存在，不需要 sha
    }

    await createOrUpdateFile(
      'meta.json',
      content,
      sha ? 'Update meta.json' : 'Create meta.json',
      sha
    )
  }

  // 读取文章列表
  const loadArticles = async (): Promise<Article[]> => {
    const articles: Article[] = []

    try {
      // 从 meta.json 读取元数据
      let articlesMeta = await loadArticlesMeta()

      // 如果 meta.json 为空，返回空数组
      // （GitHub 存储不支持扫描目录初始化，因为没有 showDirectoryPicker）
      if (articlesMeta.length === 0) {
        return []
      }

      // 并行获取每篇文章的内容
      const articlePromises = articlesMeta.map(async (meta) => {
        try {
          // 从文件名解析标题
          const parsed = parseFileName(meta.fileName)
          const title = parsed?.title || 'Untitled'

          // 读取内容文件
          let content = ''
          try {
            const result = await getFileContent(meta.fileName)
            if (result) {
              content = result.content
            }
          } catch {
            // 内容文件不存在
            console.warn(`文章文件不存在: ${meta.fileName}`)
          }

          return {
            id: meta.id,
            title,
            meta,
            content
          } as Article
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

    // 按更新时间排序
    articles.sort((a, b) =>
      new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime()
    )

    return articles
  }

  // 保存文章
  const saveArticle = async (article: Omit<Article, 'dirHandle'>): Promise<Article> => {
    const now = new Date().toISOString()
    const articlesMeta = await loadArticlesMeta()

    // 生成新文件名
    const newFileName = generateFileName(
      article.title,
      article.meta.category,
      article.meta.createdAt,
      article.meta.contentFormat
    )

    // 查找现有文章
    const existingIndex = articlesMeta.findIndex((m) => m.id === article.id)

    let meta: ArticleMeta

    if (existingIndex >= 0) {
      const oldMeta = articlesMeta[existingIndex]
      const oldFileName = oldMeta.fileName

      // 如果文件名变化，删除旧文件
      if (oldFileName !== newFileName) {
        try {
          const oldResult = await getFileContent(oldFileName)
          if (oldResult) {
            await deleteFile(
              oldFileName,
              oldResult.sha,
              `Delete old article: ${oldFileName}`
            )
          }
        } catch {
          // 忽略删除失败
        }
      }

      // 更新元数据
      meta = {
        ...oldMeta,
        fileName: newFileName,
        updatedAt: now,
        publishedAt:
          article.meta.status === 'published'
            ? article.meta.publishedAt || now
            : article.meta.publishedAt,
        status: article.meta.status,
        contentFormat: article.meta.contentFormat,
        category: article.meta.category,
        tags: article.meta.tags,
        excerpt: article.meta.excerpt,
        cover: article.meta.cover
      }

      articlesMeta[existingIndex] = meta
    } else {
      // 新增文章
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

    // 保存内容文件
    if (article.content.trim()) {
      let sha: string | undefined
      try {
        const existing = await getFileContent(newFileName)
        if (existing) {
          sha = existing.sha
        }
      } catch {
        // 文件不存在
      }

      await createOrUpdateFile(
        newFileName,
        article.content,
        sha ? `Update article: ${newFileName}` : `Create article: ${newFileName}`,
        sha
      )
    }

    // 保存 meta.json
    await saveArticlesMeta(articlesMeta)

    return {
      ...article,
      id: meta.id,
      meta
    }
  }

  // 删除文章
  const deleteArticle = async (id: string): Promise<void> => {
    const articlesMeta = await loadArticlesMeta()
    const index = articlesMeta.findIndex((m) => m.id === id)

    if (index >= 0) {
      const meta = articlesMeta[index]

      // 删除内容文件
      try {
        const result = await getFileContent(meta.fileName)
        if (result) {
          await deleteFile(
            meta.fileName,
            result.sha,
            `Delete article: ${meta.fileName}`
          )
        }
      } catch {
        // 忽略删除失败
      }

      // 从元数据中移除
      articlesMeta.splice(index, 1)
      await saveArticlesMeta(articlesMeta)
    }
  }

  // 获取单篇文章
  const getArticle = async (id: string): Promise<Article | null> => {
    const articlesMeta = await loadArticlesMeta()
    const meta = articlesMeta.find((m) => m.id === id)

    if (!meta) {
      return null
    }

    try {
      const parsed = parseFileName(meta.fileName)
      const title = parsed?.title || 'Untitled'

      let content = ''
      const result = await getFileContent(meta.fileName)
      if (result) {
        content = result.content
      }

      return {
        id: meta.id,
        title,
        meta,
        content
      }
    } catch (err) {
      console.warn(`获取文章失败: ${meta.fileName}`, err)
      return null
    }
  }

  // ArrayBuffer 转 Base64
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // 保存图片
  const saveImage = async (file: File | Blob, filename?: string): Promise<string> => {
    // 生成唯一文件名
    let ext = file instanceof File ? file.name.split('.').pop() : 'png'
    // 验证扩展名是否有效，无效则默认使用 'png'
    const validExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'mp4', 'webm', 'mov', 'avi']
    if (!ext || !validExts.includes(ext.toLowerCase())) {
      ext = 'png'
    }
    const uniqueName = filename || `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

    // 读取文件为 ArrayBuffer
    const buffer = await file.arrayBuffer()
    const base64Content = arrayBufferToBase64(buffer)

    // 上传到 GitHub
    const path = `assets/${uniqueName}`

    // 检查文件是否已存在
    let sha: string | undefined
    try {
      const existing = await getFileContent(path)
      if (existing) {
        sha = existing.sha
      }
    } catch {
      // 文件不存在
    }

    // 直接调用 githubRequest 上传，避免 createOrUpdateFile 中的双重 base64 编码
    const uploadBody: Record<string, string> = {
      message: sha ? `Update image: ${uniqueName}` : `Add image: ${uniqueName}`,
      content: base64Content,
      branch
    }

    if (sha) {
      uploadBody.sha = sha
    }

    await githubRequest(`/contents/${encodeURIComponent(getFullPath(path))}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uploadBody)
    })

    // 返回 GitHub raw URL
    return `https://raw.githubusercontent.com/${config.username}/${config.repo}/${branch}/${getFullPath(path)}`
  }

  // 从剪贴板保存图片（GitHub 不支持直接访问剪贴板，返回 null）
  const saveImageFromClipboard = async (): Promise<string | null> => {
    // GitHub 存储模式不支持剪贴板直接上传
    // 需要在调用方处理剪贴板读取
    return null
  }

  // 读取媒体文件列表
  const loadMediaFiles = async (): Promise<MediaFile[]> => {
    const mediaFiles: MediaFile[] = []

    try {
      const contents = await getDirectoryContents('assets')

      for (const item of contents) {
        if (item.type === 'file') {
          const type = getFileType(item.name)

          mediaFiles.push({
            id: `${item.name}-${item.sha}`,
            name: item.name,
            type: type,
            size: item.size || 0,
            url: item.download_url || '',
            repo: `${config.username}/${config.repo}`,
            uploadTime: new Date().toLocaleString('zh-CN') // GitHub API 不返回上传时间
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

    // 获取文件 sha
    const result = await getFileContent(path)
    if (!result) {
      throw new GitHubFSError('文件不存在', 'NOT_FOUND', 404)
    }

    await deleteFile(path, result.sha, `Delete media: ${filename}`)
  }

  // 获取文件类型
  const getFileType = (name: string): 'image' | 'video' | 'other' => {
    const ext = name.split('.').pop()?.toLowerCase() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video'
    return 'other'
  }

  // 验证访问权限
  const verifyAccess = async (): Promise<{ valid: boolean; error?: string }> => {
    try {
      // 尝试获取仓库信息
      await githubRequest('')
      return { valid: true }
    } catch (err) {
      if (err instanceof GitHubFSError) {
        return { valid: false, error: err.message }
      }
      return { valid: false, error: '验证失败' }
    }
  }

  // 获取配置信息
  const getConfig = () => {
    return {
      type: 'github' as const,
      username: config.username,
      repo: config.repo,
      branch,
      basePath
    }
  }

  // 模拟本地 FS 的目录选择（GitHub 不需要）
  const selectArticlesDir = async () => {
    return null
  }

  const selectMediaDir = async () => {
    return null
  }

  // 验证权限（模拟）
  const verifyArticlesAccess = async (): Promise<boolean> => {
    const result = await verifyAccess()
    return result.valid
  }

  const verifyMediaAccess = async (): Promise<boolean> => {
    const result = await verifyAccess()
    return result.valid
  }

  const verifyAllAccess = async (): Promise<{ articles: boolean; media: boolean }> => {
    const result = await verifyAccess()
    return {
      articles: result.valid,
      media: result.valid
    }
  }

  // 计算属性（模拟）
  const isSupported = computed(() => true)
  const hasArticlesAccess = computed(() => true)
  const hasMediaAccess = computed(() => true)
  const configRef = computed(() => getConfig())

  // 保存配置（GitHub 不需要本地存储）
  const saveConfig = () => {
    // GitHub 配置由调用方管理
  }

  return {
    // 配置和状态
    config: configRef,
    isSupported,
    hasArticlesAccess,
    hasMediaAccess,

    // 目录选择（GitHub 不需要）
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

    // 文章操作
    loadArticles,
    saveArticle,
    deleteArticle,
    getArticle,

    // 配置管理
    saveConfig,

    // GitHub 特有的方法
    verifyAccess,
    getConfig
  }
}
