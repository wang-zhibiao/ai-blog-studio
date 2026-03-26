import { useFsStore } from '~/stores/fs'
import type { Article, ArticleMeta, ContentFormat, MediaFile } from '~/types/article'
import { generateFileName, parseFileName, generateArticleId, generateExcerpt } from '~/types/article'


export function useLocalFS() {
  const fsStore = useFsStore()

  const isSupported = computed(() => {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window
  })

  const config = computed(() => fsStore.config)
  const hasArticlesAccess = computed(() => fsStore.hasArticlesAccess)
  const hasMediaAccess = computed(() => fsStore.hasMediaAccess)

  // 选择文章目录
  const selectArticlesDir = async () => {
    if (!isSupported.value) {
      throw new Error('File System API 不被支持')
    }
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      })
      fsStore.setArticlesDirHandle(handle)
      return handle
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        throw err
      }
      return null
    }
  }

  // 选择媒体库目录
  const selectMediaDir = async () => {
    if (!isSupported.value) {
      throw new Error('File System Access API 不被支持')
    }
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      })
      fsStore.setMediaDirHandle(handle)
      return handle
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        throw err
      }
      return null
    }
  }

  // 验证文章目录权限
  const verifyArticlesAccess = async (): Promise<boolean> => {
    return await fsStore.verifyArticlesAccess()
  }

  // 验证媒体目录权限
  const verifyMediaAccess = async (): Promise<boolean> => {
    return await fsStore.verifyMediaAccess()
  }

  // 验证所有权限
  const verifyAllAccess = async (): Promise<{ articles: boolean; media: boolean }> => {
    return await fsStore.verifyAllAccess()
  }

  // 获取或创建媒体库目录（如果未配置，使用文章目录下的 assets）
  const getMediaDirHandle = async (): Promise<FileSystemDirectoryHandle> => {
    if (fsStore.mediaDirHandle) {
      return fsStore.mediaDirHandle
    }
    if (!fsStore.articlesDirHandle) {
      throw new Error('请先配置文章目录')
    }
    // 使用文章目录下的 assets 文件夹
    return await fsStore.articlesDirHandle.getDirectoryHandle('assets', { create: true })
  }

  // 保存图片到媒体库
  const saveImage = async (file: File | Blob, filename?: string): Promise<string> => {
    const mediaDir = await getMediaDirHandle()

    // 生成唯一文件名
    let ext = file instanceof File ? file.name.split('.').pop() : 'png'
    // 验证扩展名是否有效，无效则默认使用 'png'
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

  // 读取媒体文件列表
  const loadMediaFiles = async (): Promise<MediaFile[]> => {
    const mediaFiles: MediaFile[] = []

    try {
      const mediaDir = await getMediaDirHandle()

      for await (const entry of mediaDir.values()) {
        if (entry.kind === 'file') {
          try {
            const file = await entry.getFile()
            const type = getFileType(entry.name)

            // 创建临时 URL
            let url = ''
            if (type === 'image') {
              url = URL.createObjectURL(file)
            }

            mediaFiles.push({
              id: `${entry.name}-${file.lastModified}`,
              name: entry.name,
              type,
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

    // 按上传时间排序
    mediaFiles.sort((a, b) =>
      new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
    )

    return mediaFiles
  }

  // 删除媒体文件
  const deleteMediaFile = async (filename: string): Promise<void> => {
    const mediaDir = await getMediaDirHandle()
    await mediaDir.removeEntry(filename)
  }

  // 获取文件类型
  const getFileType = (name: string): 'image' | 'video' | 'other' => {
    const ext = name.split('.').pop()?.toLowerCase() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video'
    return 'other'
  }

  // 读取或初始化 meta.json
  const loadArticlesMeta = async (): Promise<ArticleMeta[]> => {
    if (!fsStore.articlesDirHandle) {
      return []
    }

    try {
      const metaFile = await fsStore.articlesDirHandle.getFileHandle('meta.json')
      const file = await metaFile.getFile()
      const content = await file.text()
      const data = JSON.parse(content) as ArticleMeta[]
      return Array.isArray(data) ? data : []
    } catch {
      // meta.json 不存在，初始化空数组
      return []
    }
  }

  // 保存 meta.json
  const saveArticlesMeta = async (articlesMeta: ArticleMeta[]): Promise<void> => {
    if (!fsStore.articlesDirHandle) {
      throw new Error('请先配置文章目录')
    }

    const metaFile = await fsStore.articlesDirHandle.getFileHandle('meta.json', { create: true })
    const writable = await metaFile.createWritable()
    await writable.write(JSON.stringify(articlesMeta, null, 2))
    await writable.close()
  }

  // 从目录中扫描文章文件并初始化 meta.json
  const scanAndInitMeta = async (): Promise<ArticleMeta[]> => {
    if (!fsStore.articlesDirHandle) {
      return []
    }

    const articlesMeta: ArticleMeta[] = []
    const now = new Date().toISOString()

    try {
      // 遍历目录中的所有文件
      for await (const entry of fsStore.articlesDirHandle.values()) {
        if (entry.kind === 'file' && (entry.name.endsWith('.md') || entry.name.endsWith('.html'))) {
          // 解析文件名
          const parsed = parseFileName(entry.name)
          if (!parsed) continue

          // 读取文件内容
          const file = await entry.getFile()
          const content = await file.text()

          // 创建 meta 数据
          const meta: ArticleMeta = {
            id: generateArticleId(),
            fileName: entry.name,
            createdAt: parsed.date.toISOString(),
            updatedAt: new Date(file.lastModified).toISOString(),
            publishedAt: null,
            status: 'draft',
            contentFormat: entry.name.endsWith('.md') ? 'markdown' : 'html',
            category: parsed.category,
            tags: [],
            excerpt: generateExcerpt(content, 200),
            views: 0,
            pinned: false,
            order: 0
          }

          articlesMeta.push(meta)
        }
      }

      // 保存 meta.json
      if (articlesMeta.length > 0) {
        await saveArticlesMeta(articlesMeta)
      }
    } catch (err) {
      console.error('扫描文章文件失败:', err)
    }

    return articlesMeta
  }

  // 读取文章列表
  const loadArticles = async (): Promise<Article[]> => {
    if (!fsStore.articlesDirHandle) {
      return []
    }

    const articles: Article[] = []

    try {
      // 从 meta.json 读取元数据
      let articlesMeta = await loadArticlesMeta()

      // 如果 meta.json 为空，尝试扫描目录并初始化
      if (articlesMeta.length === 0) {
        articlesMeta = await scanAndInitMeta()
      }

      // 遍历元数据，读取每篇文章的内容
      for (const meta of articlesMeta) {
        try {
          // 从文件名解析标题
          const parsed = parseFileName(meta.fileName)
          const title = parsed?.title || 'Untitled'

          // 读取内容文件
          let content = ''
          try {
            const fileHandle = await fsStore.articlesDirHandle.getFileHandle(meta.fileName)
            const file = await fileHandle.getFile()
            content = await file.text()
          } catch {
            // 内容文件不存在
            console.warn(`文章文件不存在: ${meta.fileName}`)
          }

          articles.push({
            id: meta.id,
            title,
            meta,
            content,
            dirHandle: fsStore.articlesDirHandle
          })
        } catch (err) {
          console.warn(`加载文章失败: ${meta.fileName}`, err)
        }
      }
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
    if (!fsStore.articlesDirHandle) {
      throw new Error('请先配置文章目录')
    }

    const now = new Date().toISOString()
    const articlesMeta = await loadArticlesMeta()

    // 生成新文件名
    const newFileName = generateFileName(article.title, article.meta.category, article.meta.createdAt, article.meta.contentFormat)

    // 查找现有文章
    const existingIndex = articlesMeta.findIndex(m => m.id === article.id)

    let meta: ArticleMeta

    if (existingIndex >= 0) {
      const oldMeta = articlesMeta[existingIndex]
      const oldFileName = oldMeta.fileName

      // 如果文件名变化，删除旧文件
      if (oldFileName !== newFileName) {
        try {
          await fsStore.articlesDirHandle.removeEntry(oldFileName)
        } catch {
          // 忽略删除失败
        }
      }

      // 更新元数据
      meta = {
        ...oldMeta,
        fileName: newFileName,
        updatedAt: now,
        publishedAt: article.meta.status === 'published'
          ? (article.meta.publishedAt || now)
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
      const fileHandle = await fsStore.articlesDirHandle.getFileHandle(newFileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(article.content)
      await writable.close()
    }

    // 保存 meta.json
    await saveArticlesMeta(articlesMeta)

    return {
      ...article,
      id: meta.id,
      meta,
      dirHandle: fsStore.articlesDirHandle
    }
  }

  // 删除文章
  const deleteArticle = async (id: string): Promise<void> => {
    if (!fsStore.articlesDirHandle) {
      throw new Error('请先配置文章目录')
    }

    const articlesMeta = await loadArticlesMeta()
    const index = articlesMeta.findIndex(m => m.id === id)

    if (index >= 0) {
      const meta = articlesMeta[index]

      // 删除内容文件
      try {
        await fsStore.articlesDirHandle.removeEntry(meta.fileName)
      } catch {
        // 忽略删除失败
      }

      // 从元数据中移除
      articlesMeta.splice(index, 1)
      await saveArticlesMeta(articlesMeta)
    }
  }

  // 保存配置
  const saveConfig = () => {
    fsStore.saveToStorage()
  }

  return {
    config,
    isSupported,
    hasArticlesAccess,
    hasMediaAccess,
    selectArticlesDir,
    selectMediaDir,
    verifyArticlesAccess,
    verifyMediaAccess,
    verifyAllAccess,
    saveImage,
    saveImageFromClipboard,
    loadMediaFiles,
    deleteMediaFile,
    getFileType,
    loadArticles,
    saveArticle,
    deleteArticle,
    saveConfig
  }
}
