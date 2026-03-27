import type { Article, ArticleMeta, CreateArticleParams, UpdateArticleParams, ArticleId, ContentFormat } from './types'
import { generateFileName, generateArticleId } from '../../utils/filename'

export class ArticleModel {
  readonly id: ArticleId
  readonly title: string
  readonly content: string
  readonly meta: ArticleMeta

  private constructor(props: Article) {
    this.id = props.id
    this.title = props.title
    this.content = props.content
    this.meta = props.meta
  }

  static create(params: CreateArticleParams): ArticleModel {
    const id = params.id ?? generateArticleId()
    const now = new Date().toISOString()
    const contentFormat = params.contentFormat ?? 'markdown'

    return new ArticleModel({
      id,
      title: params.title,
      content: params.content,
      meta: {
        id,
        fileName: generateFileName(params.title, params.category, now, contentFormat),
        createdAt: now,
        updatedAt: now,
        publishedAt: null,
        status: 'draft',
        contentFormat,
        category: params.category,
        tags: params.tags ?? [],
        views: 0,
        pinned: false,
        order: 0
      }
    })
  }

  static fromJSON(data: Article): ArticleModel {
    return new ArticleModel(data)
  }

  publish(): ArticleModel {
    return new ArticleModel({
      ...this,
      meta: {
        ...this.meta,
        status: 'published',
        publishedAt: this.meta.publishedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
  }

  unpublish(): ArticleModel {
    return new ArticleModel({
      ...this,
      meta: {
        ...this.meta,
        status: 'draft',
        updatedAt: new Date().toISOString()
      }
    })
  }

  updateContent(content: string): ArticleModel {
    return new ArticleModel({
      ...this,
      content,
      meta: {
        ...this.meta,
        updatedAt: new Date().toISOString()
      }
    })
  }

  updateMeta(meta: Partial<Omit<ArticleMeta, 'id' | 'createdAt'>>): ArticleModel {
    const now = new Date().toISOString()
    return new ArticleModel({
      ...this,
      meta: {
        ...this.meta,
        ...meta,
        updatedAt: now
      }
    })
  }

  toJSON(): Article {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      meta: this.meta
    }
  }
}
