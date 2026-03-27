import type { StorageOperations, LocalStorageConfig } from '../../core/storage'
import type { ArticleModel } from '../../core/article'
import type { ArticleId } from '../../core/article'
import { ArticleModel as _ArticleModel } from '../../core/article/model'
import { FileSystemError } from '../../core/storage/errors'
import { decodeBase64, encodeBase64, arrayBufferToBase64 } from '../../../utils/base64'
import { parseFileName } from '../../../utils/filename'
import { useStorageStore } from '../../../stores/storage'

interface LocalFSState {
  isSupported: boolean
  articlesDirHandle: FileSystemDirectoryHandle | null
  mediaDirHandle: FileSystemDirectoryHandle | null
}

export function createLocalFS(): StorageOperations {
  const storageStore = useStorageStore()

  const state: LocalFSState = {
    isSupported: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
    articlesDirHandle: null,
    mediaDirHandle: null
  }

  const syncHandles = () => {
    state.articlesDirHandle = storageStore.local.articlesDirHandle
    state.mediaDirHandle = storageStore.local.mediaDirHandle
  }

  const getFileType = (name: string): 'image' | 'video' | 'other' => {
    const ext = name.split('.').pop()?.toLowerCase() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video'
    return 'other'
  }

  const createFileSystemError = (
    message: string,
    code: any,
    status?: number,
    originalError?: unknown
  ): FileSystemError => {
    return new FileSystemError(message, code, status, originalError)
  }

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

  const queryPermission = async (handle: FileSystemDirectoryHandle): Promise<boolean> => {
    try {
      // @ts-ignore
      if (handle.queryPermission) {
        // @ts-ignore
        const permission = await handle.queryPermission({ mode: 'readwrite' })
        return permission === 'granted'
      }
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

  const loadMediaFiles = async (): Promise<any[]> => {
    const mediaFiles: any[] = []
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

  const deleteMediaFile = async (filename: string): Promise<void> => {
    const mediaDir = await getMediaDirHandle()
    await mediaDir.removeEntry(filename)
  }

  const loadArticlesMeta = async (): Promise<any[]> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }
    try {
      const metaHandle = await state.articlesDirHandle.getFileHandle('meta.json', { create: false })
      const file = await metaHandle.getFile()
      const content = await file.text()
      const data = JSON.parse(content)
      return Array.isArray(data) ? data : []
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        return []
      }
      console.warn('读取 meta.json 失败:', err)
      return []
    }
  }

  const saveArticlesMeta = async (articlesMeta: any[]): Promise<void> => {
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

  const loadArticles = async (): Promise<ArticleModel[]> => {
    const articles: ArticleModel[] = []
    try {
      const articlesMeta = await loadArticlesMeta()
      if (articlesMeta.length === 0) return []

      const articlePromises = articlesMeta.map(async (meta: any) => {
        try {
          const parsed = parseFileName(meta.fileName)
          const title = parsed?.title || 'Untitled'
          let content = ''

          const fileHandle = await state.articlesDirHandle!.getFileHandle(meta.fileName, { create: false })
          const file = await fileHandle.getFile()
          content = await file.text()

          return _ArticleModel.fromJSON({ id: meta.id, title, meta, content } as any)
        } catch (err) {
          console.warn(`加载文章失败: ${meta.fileName}`, err)
          return null
        }
      })

      const results = await Promise.all(articlePromises)
      articles.push(...results.filter((a): a is ArticleModel => a !== null))
    } catch (err) {
      console.error('读取文章列表失败:', err)
    }

    articles.sort((a: any, b: any) => new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime())
    return articles
  }

  const saveArticle = async (article: ArticleModel): Promise<ArticleModel> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }

    const articlesMeta = await loadArticlesMeta()
    const articleData = article.toJSON()

    const existingIndex = articlesMeta.findIndex((m: any) => m.id === articleData.id)

    if (existingIndex >= 0) {
      const oldMeta = articlesMeta[existingIndex]
      const oldFileName = oldMeta.fileName

      if (oldFileName !== articleData.meta.fileName) {
        try {
          await state.articlesDirHandle.removeEntry(oldFileName)
        } catch {
          // 忽略删除失败
        }
      }

      articlesMeta[existingIndex] = articleData.meta
    } else {
      articlesMeta.push(articleData.meta)
    }

    if (articleData.content.trim()) {
      const fileHandle = await state.articlesDirHandle.getFileHandle(articleData.meta.fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(articleData.content)
      await writable.close()
    }

    await saveArticlesMeta(articlesMeta)

    return article
  }

  const deleteArticle = async (id: ArticleId): Promise<void> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }

    const articlesMeta = await loadArticlesMeta()
    const index = articlesMeta.findIndex((m: any) => m.id === id)

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

  const getArticle = async (id: ArticleId): Promise<ArticleModel | null> => {
    syncHandles()
    if (!state.articlesDirHandle) {
      throw createFileSystemError('请先配置文章目录', 'DIRECTORY_NOT_FOUND')
    }

    const articlesMeta = await loadArticlesMeta()
    const meta = articlesMeta.find((m: any) => m.id === id)

    if (!meta) return null

    try {
      const parsed = parseFileName(meta.fileName)
      const title = parsed?.title || 'Untitled'

      const fileHandle = await state.articlesDirHandle.getFileHandle(meta.fileName, { create: false })
      const file = await fileHandle.getFile()
      const content = await file.text()

      return _ArticleModel.fromJSON({ id: meta.id, title, meta, content } as any)
    } catch (err) {
      console.warn(`获取文章失败: ${meta.fileName}`, err)
      return null
    }
  }

  syncHandles()

  return {
    isReady: computed(() => state.articlesDirHandle !== null),
    isSupported: computed(() => state.isSupported),
    hasArticlesAccess: computed(() => state.articlesDirHandle !== null),
    hasMediaAccess: computed(() => state.mediaDirHandle !== null),
    config: { type: 'local' } as LocalStorageConfig,

    selectArticlesDir,
    selectMediaDir,
    verifyArticlesAccess,
    verifyMediaAccess,
    verifyAllAccess,

    loadArticles,
    saveArticle,
    deleteArticle,
    getArticle,

    saveImage,
    saveImageFromClipboard,
    loadMediaFiles,
    deleteMediaFile,
    getFileType
  }
}
