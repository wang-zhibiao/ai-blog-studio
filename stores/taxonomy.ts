import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

export const useTaxonomyStore = defineStore('taxonomy', () => {
  // 状态
  const categories = ref<Category[]>([])
  const tags = ref<Tag[]>([])
  const loading = ref(false)

  // 计算属性
  const rootCategories = computed(() => {
    return categories.value.filter(c => !c.parentId).sort((a, b) => a.order - b.order)
  })

  const getCategoryChildren = (parentId: string) => {
    return categories.value.filter(c => c.parentId === parentId).sort((a, b) => a.order - b.order)
  }

  const getCategoryPath = (categoryId: string): Category[] => {
    const path: Category[] = []
    let current = categories.value.find(c => c.id === categoryId)
    while (current) {
      path.unshift(current)
      current = current.parentId ? categories.value.find(c => c.id === current!.parentId) : undefined
    }
    return path
  }

  const popularTags = computed(() => {
    return [...tags.value].sort((a, b) => b.articleCount - a.articleCount).slice(0, 20)
  })

  // 生成分类/标签的配色
  const generateColor = (name: string): string => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // CRUD 操作

  // 分类操作
  const createCategory = (data: Partial<Category>): Category => {
    const now = new Date().toISOString()
    const name = data.name || '未命名分类'
    const category: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug: generateSlug(name),
      description: data.description || '',
      color: data.color || generateColor(name),
      icon: data.icon || '',
      order: data.order ?? categories.value.length,
      parentId: data.parentId,
      articleCount: 0,
      createdAt: now,
      updatedAt: now
    }
    categories.value.push(category)
    return category
  }

  const updateCategory = (id: string, data: Partial<Category>): Category | null => {
    const index = categories.value.findIndex(c => c.id === id)
    if (index === -1) return null

    const category = categories.value[index]
    if (data.name && data.name !== category.name) {
      data.slug = generateSlug(data.name)
    }

    categories.value[index] = {
      ...category,
      ...data,
      updatedAt: new Date().toISOString()
    }
    return categories.value[index]
  }

  const deleteCategory = (id: string): boolean => {
    const index = categories.value.findIndex(c => c.id === id)
    if (index === -1) return false

    // 检查是否有子分类
    const hasChildren = categories.value.some(c => c.parentId === id)
    if (hasChildren) {
      throw new Error('该分类下有子分类，无法删除')
    }

    // 检查是否有文章
    if (categories.value[index].articleCount > 0) {
      throw new Error('该分类下有文章，无法删除')
    }

    categories.value.splice(index, 1)
    return true
  }

  // 标签操作
  const createTag = (name: string): Tag => {
    const existing = tags.value.find(t => t.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing

    const now = new Date().toISOString()
    const tag: Tag = {
      id: `tag-${Date.now()}`,
      name,
      slug: generateSlug(name),
      color: generateColor(name),
      articleCount: 0,
      createdAt: now,
      updatedAt: now
    }
    tags.value.push(tag)
    return tag
  }

  const updateTag = (id: string, data: Partial<Tag>): Tag | null => {
    const index = tags.value.findIndex(t => t.id === id)
    if (index === -1) return null

    const tag = tags.value[index]
    if (data.name && data.name !== tag.name) {
      data.slug = generateSlug(data.name)
    }

    tags.value[index] = {
      ...tag,
      ...data,
      updatedAt: new Date().toISOString()
    }
    return tags.value[index]
  }

  const deleteTag = (id: string): boolean => {
    const index = tags.value.findIndex(t => t.id === id)
    if (index === -1) return false

    if (tags.value[index].articleCount > 0) {
      throw new Error('该标签下有文章，无法删除')
    }

    tags.value.splice(index, 1)
    return true
  }

  // 统计更新
  const updateCategoryArticleCount = (categoryId: string, delta: number) => {
    const category = categories.value.find(c => c.id === categoryId)
    if (category) {
      category.articleCount = Math.max(0, category.articleCount + delta)
      category.updatedAt = new Date().toISOString()
    }
  }

  const updateTagArticleCount = (tagIds: string[], delta: number) => {
    tagIds.forEach(id => {
      const tag = tags.value.find(t => t.id === id)
      if (tag) {
        tag.articleCount = Math.max(0, tag.articleCount + delta)
        tag.updatedAt = new Date().toISOString()
      }
    })
  }

  // 辅助函数
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      || `item-${Date.now()}`
  }

  // 持久化到 localStorage
  const saveToStorage = () => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem('taxonomy-data', JSON.stringify({
      categories: categories.value,
      tags: tags.value
    }))
  }

  const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return
    try {
      const saved = localStorage.getItem('taxonomy-data')
      if (saved) {
        const data = JSON.parse(saved)
        categories.value = data.categories || []
        tags.value = data.tags || []
      }
    } catch (e) {
      console.error('加载分类数据失败:', e)
    }
  }

  // 初始化
  loadFromStorage()

  return {
    // 状态
    categories,
    tags,
    loading,
    // 计算属性
    rootCategories,
    popularTags,
    // 方法
    getCategoryChildren,
    getCategoryPath,
    // 分类 CRUD
    createCategory,
    updateCategory,
    deleteCategory,
    // 标签 CRUD
    createTag,
    updateTag,
    deleteTag,
    // 统计
    updateCategoryArticleCount,
    updateTagArticleCount,
    // 持久化
    saveToStorage,
    loadFromStorage
  }
})
