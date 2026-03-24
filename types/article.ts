/**
 * 文章内容格式
 */
export type ContentFormat = 'html' | 'markdown'

/**
 * 文章元数据
 * 存储在 meta.json 中
 */
export interface ArticleMeta {
  /** 文章 ID: post-{timestamp} */
  id: string
  /** 文章文件名（包含扩展名），用于定位文件 */
  fileName: string
  /** 创建时间 (ISO 8601) */
  createdAt: string
  /** 最后更新时间 (ISO 8601) */
  updatedAt: string
  /** 发布时间 (ISO 8601), 草稿时为 null */
  publishedAt: string | null
  /** 文章状态 */
  status: 'draft' | 'published'
  /** 内容格式 */
  contentFormat: ContentFormat
  /** 分类 */
  category: string
  /** 标签数组 */
  tags: string[]
  /** 摘要/描述 */
  excerpt: string
  /** 封面图片 URL */
  cover?: string
  /** 作者 */
  author?: string
  /** 阅读次数 */
  views?: number
  /** 是否置顶 */
  pinned?: boolean
  /** 排序权重 */
  order?: number
}

/**
 * 完整文章对象（内存中使用）
 */
export interface Article {
  /** 唯一标识 (post-{timestamp}) */
  id: string
  /** 文章标题（从文件名解析或用户编辑） */
  title: string
  /** 文章元数据 */
  meta: ArticleMeta
  /** 文章内容 (Markdown 或 HTML) */
  content: string
  /** 文件系统目录句柄 (仅本地存储时有) */
  dirHandle?: FileSystemDirectoryHandle
}

/**
 * 编辑器中使用的文章格式
 */
export interface EditorArticle {
  id: string
  title: string
  content: string
  contentFormat: ContentFormat
  tags: string[]
  category: string
  date: string
  isPublished: boolean
  excerpt?: string
  cover?: string
}

/**
 * 文章统计信息
 */
export interface ArticleStats {
  total: number
  published: number
  drafts: number
  categories: { name: string; count: number }[]
  tags: { name: string; count: number }[]
  recent: Article[]
}

/**
 * 文章查询参数
 */
export interface ArticleQuery {
  status?: 'draft' | 'published' | 'all'
  category?: string
  tag?: string
  keyword?: string
  sortBy?: 'date' | 'title' | 'views'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * 媒体文件
 */
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

/**
 * 从文件名解析文章信息
 * 文件名格式: {标题}-{分类}-{yyyy-MM-dd HHmm}.{ext}
 */
export interface ParsedFileName {
  title: string
  category: string
  date: Date
  ext: string
}

/**
 * 解析文件名
 */
export function parseFileName(fileName: string): ParsedFileName | null {
  const match = fileName.match(/^(.+)-(.+)-(\d{4}-\d{2}-\d{2})\s(\d{4})\.(md|html)$/)
  if (!match) return null

  const [, title, category, dateStr, timeStr, ext] = match
  const date = new Date(`${dateStr} ${timeStr.substring(0, 2)}:${timeStr.substring(2)}`)

  return {
    title: title.replace(/_/g, ' '),
    category: category.replace(/_/g, ' '),
    date,
    ext
  }
}

/**
 * 生成文件名：{标题}-{分类}-{yyyy-MM-dd HHmm}
 * 注意：文件名不能包含 :, *, ?, ", <, >, |, /, \\ 等字符
 */
export function generateFileName(title: string, category: string, date: string, format: ContentFormat): string {
  const d = new Date(date)
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`
  const safeTitle = title.replace(/[<>:"/\\|?*]+/g, '_').trim() || 'untitled'
  const safeCategory = category.replace(/[<>:"/\\|?*]+/g, '_').trim() || 'uncategorized'
  const ext = format === 'markdown' ? 'md' : 'html'
  return `${safeTitle}-${safeCategory}-${dateStr}.${ext}`
}

/**
 * 生成文章 ID
 */
export function generateArticleId(): string {
  return `post-${Date.now()}`
}

/**
 * 生成文章摘要
 */
export function generateExcerpt(content: string, maxLength: number = 200): string {
  // 移除 HTML 标签
  const text = content
    .replace(/<[^>]*>/g, '')
    // 移除 Markdown 语法
    .replace(/[#*_~`[\]()!]/g, '')
    .trim()

  if (text.length <= maxLength) return text

  // 截断并添加省略号
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * 从内容中提取图片 URL
 */
export function extractImagesFromContent(content: string): string[] {
  const images: string[] = []

  // 匹配 Markdown 图片 ![alt](url)
  const markdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let match
  while ((match = markdownRegex.exec(content)) !== null) {
    images.push(match[2])
  }

  // 匹配 HTML img 标签
  const htmlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  while ((match = htmlRegex.exec(content)) !== null) {
    images.push(match[1])
  }

  return [...new Set(images)] // 去重
}
