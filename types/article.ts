export interface Article {
  id: string
  title: string
  content: string
  format: 'markdown' | 'html'
  excerpt?: string
  tags: string[]
  category?: string
  date: string
  updatedAt?: string
  isPublished: boolean
  views?: number
}

export interface ArticleFrontMatter {
  title: string
  date?: string
  tags?: string[]
  category?: string
  published?: boolean
}
