import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Article, ArticleMeta } from '~/composables/useLocalFS'

export const useArticleStore = defineStore('article', () => {
  const articles = ref<Article[]>([])
  const loading = ref(false)
  const currentArticle = ref<Article | null>(null)

  const publishedArticles = computed(() =>
    articles.value.filter(a => a.meta.status === 'published')
  )
  const draftArticles = computed(() =>
    articles.value.filter(a => a.meta.status === 'draft')
  )

  // 创建新文章模板
  const createNewArticle = (): Article => {
    const now = new Date().toISOString()
    return {
      id: Date.now().toString(),
      meta: {
        title: '',
        slug: '',
        createdAt: now,
        updatedAt: now,
        publishedAt: null,
        status: 'draft',
        category: '',
        tags: [],
        excerpt: ''
      },
      content: ''
    }
  }

  // 设置当前文章
  const setCurrentArticle = (article: Article | null) => {
    currentArticle.value = article
  }

  // 从 slug 查找文章
  const getArticleBySlug = (slug: string) => {
    return articles.value.find(a => a.meta.slug === slug || a.id === slug)
  }

  return {
    articles,
    loading,
    currentArticle,
    publishedArticles,
    draftArticles,
    createNewArticle,
    setCurrentArticle,
    getArticleBySlug
  }
})
