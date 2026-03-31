import type { Article, ArticleId } from './types'
import type { ArticleModel } from './model'

export interface ArticleRepository {
  findAll(): Promise<ArticleModel[]>
  findById(id: ArticleId): Promise<ArticleModel | null>
  save(article: ArticleModel): Promise<ArticleModel>
  delete(id: ArticleId): Promise<void>
}
