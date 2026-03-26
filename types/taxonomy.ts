/**
 * 分类和标签相关类型定义
 */

// 分类
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  order: number
  parentId?: string
  articleCount: number
  createdAt: string
  updatedAt: string
}

// 标签
export interface Tag {
  id: string
  name: string
  slug: string
  color?: string
  articleCount: number
  createdAt: string
  updatedAt: string
}
