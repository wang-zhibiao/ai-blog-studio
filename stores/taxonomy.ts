import { defineStore } from 'pinia'

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

export const useTaxonomyStore = defineStore('taxonomy', {
  state: () => ({
    categories: [] as Category[],
    tags: [] as Tag[],
    loading: false
  }),

  getters: {
    rootCategories: (state) => {
      return state.categories.filter(c => !c.parentId).sort((a, b) => a.order - b.order)
    },

    popularTags: (state) => {
      return [...state.tags].sort((a, b) => b.articleCount - a.articleCount).slice(0, 20)
    },

    getCategoryChildren: (state) => (parentId: string) => {
      return state.categories.filter(c => c.parentId === parentId).sort((a, b) => a.order - b.order)
    },

    getCategoryPath: (state) => (categoryId: string): Category[] => {
      const path: Category[] = []
      let current = state.categories.find(c => c.id === categoryId)
      while (current) {
        path.unshift(current)
        current = current.parentId ? state.categories.find(c => c.id === current!.parentId) : undefined
      }
      return path
    }
  },

  actions: {
    // 生成分类/标签的配色
    generateColor(name: string): string {
      const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
      ]
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      return colors[Math.abs(hash) % colors.length]
    },

    generateSlug(name: string): string {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || `item-${Date.now()}`
    },

    // 分类操作
    createCategory(data: Partial<Category>): Category {
      const now = new Date().toISOString()
      const name = data.name || '未命名分类'
      const category: Category = {
        id: `cat-${Date.now()}`,
        name,
        slug: this.generateSlug(name),
        description: data.description || '',
        color: data.color || this.generateColor(name),
        icon: data.icon || '',
        order: data.order ?? this.categories.length,
        parentId: data.parentId,
        articleCount: 0,
        createdAt: now,
        updatedAt: now
      }
      this.categories.push(category)
      return category
    },

    updateCategory(id: string, data: Partial<Category>): Category | null {
      const index = this.categories.findIndex(c => c.id === id)
      if (index === -1) return null

      const category = this.categories[index]
      if (data.name && data.name !== category.name) {
        data.slug = this.generateSlug(data.name)
      }

      this.categories[index] = {
        ...category,
        ...data,
        updatedAt: new Date().toISOString()
      }
      return this.categories[index]
    },

    deleteCategory(id: string): boolean {
      const index = this.categories.findIndex(c => c.id === id)
      if (index === -1) return false

      // 检查是否有子分类
      const hasChildren = this.categories.some(c => c.parentId === id)
      if (hasChildren) {
        throw new Error('该分类下有子分类，无法删除')
      }

      // 检查是否有文章
      if (this.categories[index].articleCount > 0) {
        throw new Error('该分类下有文章，无法删除')
      }

      this.categories.splice(index, 1)
      return true
    },

    // 标签操作
    createTag(name: string): Tag {
      const existing = this.tags.find(t => t.name.toLowerCase() === name.toLowerCase())
      if (existing) return existing

      const now = new Date().toISOString()
      const tag: Tag = {
        id: `tag-${Date.now()}`,
        name,
        slug: this.generateSlug(name),
        color: this.generateColor(name),
        articleCount: 0,
        createdAt: now,
        updatedAt: now
      }
      this.tags.push(tag)
      return tag
    },

    updateTag(id: string, data: Partial<Tag>): Tag | null {
      const index = this.tags.findIndex(t => t.id === id)
      if (index === -1) return null

      const tag = this.tags[index]
      if (data.name && data.name !== tag.name) {
        data.slug = this.generateSlug(data.name)
      }

      this.tags[index] = {
        ...tag,
        ...data,
        updatedAt: new Date().toISOString()
      }
      return this.tags[index]
    },

    deleteTag(id: string): boolean {
      const index = this.tags.findIndex(t => t.id === id)
      if (index === -1) return false

      if (this.tags[index].articleCount > 0) {
        throw new Error('该标签下有文章，无法删除')
      }

      this.tags.splice(index, 1)
      return true
    },

    // 统计更新
    updateCategoryArticleCount(categoryId: string, delta: number) {
      const category = this.categories.find(c => c.id === categoryId)
      if (category) {
        category.articleCount = Math.max(0, category.articleCount + delta)
        category.updatedAt = new Date().toISOString()
      }
    },

    updateTagArticleCount(tagIds: string[], delta: number) {
      tagIds.forEach(id => {
        const tag = this.tags.find(t => t.id === id)
        if (tag) {
          tag.articleCount = Math.max(0, tag.articleCount + delta)
          tag.updatedAt = new Date().toISOString()
        }
      })
    },

    // 持久化到 localStorage
    saveToStorage() {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('taxonomy-data', JSON.stringify({
        categories: this.categories,
        tags: this.tags
      }))
    },

    loadFromStorage() {
      if (typeof localStorage === 'undefined') return
      try {
        const saved = localStorage.getItem('taxonomy-data')
        if (saved) {
          const data = JSON.parse(saved)
          this.categories = data.categories || []
          this.tags = data.tags || []
        }
      } catch (e) {
        console.error('加载分类数据失败:', e)
      }
    }
  },

  persist: true
})
