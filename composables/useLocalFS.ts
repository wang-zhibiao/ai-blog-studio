import { useFsStore } from '~/stores/fs'

export interface ArticleMeta {
  title: string
  slug: string
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  status: 'draft' | 'published'
  category: string
  tags: string[]
  excerpt: string
}

export interface Article {
  id: string
  meta: ArticleMeta
  content: string
  dirHandle?: FileSystemDirectoryHandle
}

export interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video' | 'other'
  size: number
  url: string
  blob?: Blob
  repo: string
  uploadTime: string
}

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
      throw new Error('File System API 不被支持')
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
    const ext = file instanceof File ? file.name.split('.').pop() : 'png'
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

  // 读取文章列表
  const loadArticles = async (): Promise<Article[]> => {
    if (!fsStore.articlesDirHandle) {
      return []
    }

    const articles: Article[] = []

    try {
      for await (const entry of fsStore.articlesDirHandle.values()) {
        if (entry.kind === 'directory') {
          try {
            const article = await loadArticle(entry)
            if (article) {
              articles.push(article)
            }
          } catch (err) {
            console.warn(`加载文章失败: ${entry.name}`, err)
          }
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

  // 读取单篇文章
  const loadArticle = async (dirHandle: FileSystemDirectoryHandle): Promise<Article | null> => {
    try {
      // 读取 meta.json
      const metaFile = await dirHandle.getFileHandle('meta.json')
      const metaFileData = await metaFile.getFile()
      const meta = JSON.parse(await metaFileData.text()) as ArticleMeta

      // 读取内容文件（优先 index.md，没有则 index.html）
      let content = ''
      try {
        const mdFile = await dirHandle.getFileHandle('index.md')
        const mdFileData = await mdFile.getFile()
        content = await mdFileData.text()
      } catch {
        try {
          const htmlFile = await dirHandle.getFileHandle('index.html')
          const htmlFileData = await htmlFile.getFile()
          content = await htmlFileData.text()
        } catch {
          // 没有内容文件
        }
      }

      return {
        id: dirHandle.name,
        meta,
        content,
        dirHandle
      }
    } catch (err) {
      console.warn('加载文章失败:', err)
      return null
    }
  }

  // 保存文章
  const saveArticle = async (article: Omit<Article, 'dirHandle'>): Promise<Article> => {
    if (!fsStore.articlesDirHandle) {
      throw new Error('请先配置文章目录')
    }

    // 获取或创建文章目录
    const slug = article.meta.slug || article.id
    const dirHandle = await fsStore.articlesDirHandle.getDirectoryHandle(slug, { create: true })

    // 更新元数据
    const now = new Date().toISOString()
    const meta: ArticleMeta = {
      ...article.meta,
      slug,
      updatedAt: now,
      createdAt: article.meta.createdAt || now,
      publishedAt: article.meta.status === 'published'
        ? (article.meta.publishedAt || now)
        : article.meta.publishedAt
    }

    // 保存 meta.json
    const metaFile = await dirHandle.getFileHandle('meta.json', { create: true })
    const metaWritable = await metaFile.createWritable()
    await metaWritable.write(JSON.stringify(meta, null, 2))
    await metaWritable.close()

    // 保存内容（同时保存 md 和 html 两种格式）
    if (article.content.trim()) {
      // 检测内容格式
      const isHtml = article.content.trim().startsWith('<')

      if (isHtml) {
        const htmlFile = await dirHandle.getFileHandle('index.html', { create: true })
        const htmlWritable = await htmlFile.createWritable()
        await htmlWritable.write(article.content)
        await htmlWritable.close()
      } else {
        const mdFile = await dirHandle.getFileHandle('index.md', { create: true })
        const mdWritable = await mdFile.createWritable()
        await mdWritable.write(article.content)
        await mdWritable.close()
      }
    }

    return {
      ...article,
      id: slug,
      meta,
      dirHandle
    }
  }

  // 删除文章
  const deleteArticle = async (slug: string): Promise<void> => {
    if (!fsStore.articlesDirHandle) {
      throw new Error('请先配置文章目录')
    }
    await fsStore.articlesDirHandle.removeEntry(slug, { recursive: true })
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
    loadArticle,
    saveArticle,
    deleteArticle,
    saveConfig
  }
}
