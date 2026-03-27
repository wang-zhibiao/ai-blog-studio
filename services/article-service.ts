import type { ArticleRepository } from '../core/article'
import type { ArticleModel } from '../core/article'
import type { ArticleId, CreateArticleParams, UpdateArticleParams } from '../core/article'
import { ArticleModel as _ArticleModel } from '../core/article/model'
import { generateFileName } from '../utils/filename'

export class ArticleApplicationService {
  constructor(private articleRepository: ArticleRepository) {}

  async getAllArticles(): Promise<ArticleModel[]> {
    return await this.articleRepository.findAll()
  }

  async getArticleById(id: string): Promise<ArticleModel | null> {
    return await this.articleRepository.findById(id as ArticleId)
  }

  async createArticle(params: CreateArticleParams): Promise<ArticleModel> {
    const article = _ArticleModel.create(params)
    return await this.articleRepository.save(article)
  }

  async updateArticle(params: UpdateArticleParams): Promise<ArticleModel> {
    const article = await this.articleRepository.findById(params.id)
    if (!article) {
      throw new Error('Article not found')
    }

    let updated = article

    if (params.title !== undefined) {
      updated = updated.updateMeta({
        fileName: generateFileName(params.title, article.meta.category, article.meta.createdAt, article.meta.contentFormat)
      })
    }

    if (params.content !== undefined) {
      updated = updated.updateContent(params.content)
    }

    if (params.category !== undefined || params.tags !== undefined || params.status !== undefined) {
      updated = updated.updateMeta({
        category: params.category,
        tags: params.tags,
        status: params.status
      })
    }

    if (params.status === 'published' && article.meta.status === 'draft') {
      updated = updated.publish()
    } else if (params.status === 'draft' && article.meta.status === 'published') {
      updated = updated.unpublish()
    }

    return await this.articleRepository.save(updated)
  }

  async publishArticle(id: string): Promise<ArticleModel> {
    const article = await this.articleRepository.findById(id as ArticleId)
    if (!article) {
      throw new Error('Article not found')
    }
    const published = article.publish()
    return await this.articleRepository.save(published)
  }

  async unpublishArticle(id: string): Promise<ArticleModel> {
    const article = await this.articleRepository.findById(id as ArticleId)
    if (!article) {
      throw new Error('Article not found')
    }
    const unpublished = article.unpublish()
    return await this.articleRepository.save(unpublished)
  }

  async deleteArticle(id: string): Promise<void> {
    await this.articleRepository.delete(id as ArticleId)
  }
}
