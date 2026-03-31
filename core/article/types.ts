export type ArticleId = string & { __brand: 'ArticleId' }

export type ArticleStatus = 'draft' | 'published'

export type ContentFormat = 'markdown' | 'html'

export interface ArticleMeta {
  id: ArticleId
  fileName: string
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  status: ArticleStatus
  contentFormat: ContentFormat
  category?: string
  tags: string[]
  excerpt?: string
  cover?: string
  views: number
  pinned: boolean
  order: number
}

export interface Article {
  id: ArticleId
  title: string
  content: string
  meta: ArticleMeta
}

export interface CreateArticleParams {
  id?: ArticleId
  title: string
  content: string
  category?: string
  tags?: string[]
  contentFormat?: ContentFormat
}

export interface UpdateArticleParams {
  id: ArticleId
  title?: string
  content?: string
  category?: string
  tags?: string[]
  status?: ArticleStatus
}
