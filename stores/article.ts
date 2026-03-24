import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Article, ArticleMeta, EditorArticle, ContentFormat } from '~/types/article'
import { generateArticleId, generateExcerpt } from '~/types/article'

export const useArticleStore = defineStore('article', () => {
  // 状态
  const articles = ref<Article[]>([])
  const loading = ref(false)
  const currentArticle = ref<Article | null>(null)
  const saveLoading = ref(false)

  // 计算属性
  const publishedArticles = computed(() =>
    articles.value.filter(a => a.meta.status === 'published')
  )

  const draftArticles = computed(() =>
    articles.value.filter(a => a.meta.status === 'draft')
  )

  const pinnedArticles = computed(() =>
    articles.value.filter(a => a.meta.pinned)
  )

  // 获取文章统计
  const stats = computed(() => ({
    total: articles.value.length,
    published: publishedArticles.value.length,
    drafts: draftArticles.value.length,
    categories: [...new Set(articles.value.map(a => a.meta.category).filter(Boolean))].length,
    tags: [...new Set(articles.value.flatMap(a => a.meta.tags))].length
  }))

  // 创建新文章模板
  const createNewArticle = (): Article => {
    const now = new Date().toISOString()
    const id = generateArticleId()

    return {
      id,
      title: '',
      meta: {
        id,
        fileName: '',
        createdAt: now,
        updatedAt: now,
        publishedAt: null,
        status: 'draft',
        contentFormat: 'html',
        category: '',
        tags: [],
        excerpt: '',
        views: 0,
        pinned: false,
        order: 0
      },
      content: ''
    }
  }

  // 从 EditorArticle 创建 Article
  const createFromEditor = (editorArticle: EditorArticle, existingArticle?: Article): Article => {
    const now = new Date().toISOString()

    // 生成摘要：优先使用用户输入的，如果用户没有输入或内容有变化，则从内容重新生成
    const generateArticleExcerpt = () => {
      if (editorArticle.excerpt && editorArticle.excerpt.trim()) {
        return editorArticle.excerpt
      }
      return generateExcerpt(editorArticle.content, 200)
    }

    if (existingArticle) {
      // 更新现有文章
      const isPublishing = !existingArticle.meta.publishedAt && editorArticle.isPublished

      return {
        ...existingArticle,
        title: editorArticle.title,
        meta: {
          ...existingArticle.meta,
          updatedAt: now,
          publishedAt: isPublishing ? now : (editorArticle.isPublished ? existingArticle.meta.publishedAt : null),
          status: editorArticle.isPublished ? 'published' : 'draft',
          contentFormat: editorArticle.contentFormat,
          category: editorArticle.category,
          tags: editorArticle.tags,
          excerpt: generateArticleExcerpt(),
          cover: editorArticle.cover
        },
        content: editorArticle.content
      }
    } else {
      // 创建新文章
      const newArticle = createNewArticle()

      return {
        ...newArticle,
        title: editorArticle.title,
        meta: {
          ...newArticle.meta,
          createdAt: now,
          updatedAt: now,
          publishedAt: editorArticle.isPublished ? now : null,
          status: editorArticle.isPublished ? 'published' : 'draft',
          contentFormat: editorArticle.contentFormat,
          category: editorArticle.category,
          tags: editorArticle.tags,
          excerpt: generateArticleExcerpt(),
          cover: editorArticle.cover
        },
        content: editorArticle.content
      }
    }
  }

  // 将 Article 转换为 EditorArticle
  const toEditorArticle = (article: Article): EditorArticle => {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      contentFormat: article.meta.contentFormat || 'html',
      tags: article.meta.tags,
      category: article.meta.category,
      date: article.meta.publishedAt || article.meta.createdAt,
      isPublished: article.meta.status === 'published',
      excerpt: article.meta.excerpt,
      cover: article.meta.cover
    }
  }

  // 设置当前文章
  const setCurrentArticle = (article: Article | null) => {
    currentArticle.value = article
  }

  // 从 id 查找文章
  const getArticleById = (id: string) => {
    return articles.value.find(a => a.id === id)
  }

  // 按分类获取文章
  const getArticlesByCategory = (category: string) => {
    return articles.value.filter(a => a.meta.category === category)
  }

  // 按标签获取文章
  const getArticlesByTag = (tag: string) => {
    return articles.value.filter(a => a.meta.tags.includes(tag))
  }

  return {
    // 状态
    articles,
    loading,
    currentArticle,
    saveLoading,
    // 计算属性
    publishedArticles,
    draftArticles,
    pinnedArticles,
    stats,
    // 方法
    createNewArticle,
    createFromEditor,
    toEditorArticle,
    setCurrentArticle,
    getArticleById,
    getArticlesByCategory,
    getArticlesByTag
  }
})
