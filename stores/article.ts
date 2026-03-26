import { defineStore } from 'pinia'
import type { Article, EditorArticle } from '~/types/article'
import { generateArticleId, generateExcerpt } from '~/types/article'

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [] as Article[],
    loading: false,
    currentArticle: null as Article | null,
    saveLoading: false
  }),

  getters: {
    publishedArticles: (state) =>
      state.articles.filter(a => a.meta.status === 'published'),

    draftArticles: (state) =>
      state.articles.filter(a => a.meta.status === 'draft'),

    pinnedArticles: (state) =>
      state.articles.filter(a => a.meta.pinned),

    stats: (state) => ({
      total: state.articles.length,
      published: state.articles.filter(a => a.meta.status === 'published').length,
      drafts: state.articles.filter(a => a.meta.status === 'draft').length,
      categories: [...new Set(state.articles.map(a => a.meta.category).filter(Boolean))].length,
      tags: [...new Set(state.articles.flatMap(a => a.meta.tags))].length
    })
  },

  actions: {
    // 创建新文章模板
    createNewArticle(): Article {
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
    },

    // 从 EditorArticle 创建 Article
    createFromEditor(editorArticle: EditorArticle, existingArticle?: Article): Article {
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
        const newArticle = this.createNewArticle()

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
    },

    // 将 Article 转换为 EditorArticle
    toEditorArticle(article: Article): EditorArticle {
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
    },

    // 设置当前文章
    setCurrentArticle(article: Article | null) {
      this.currentArticle = article
    },

    // 从 id 查找文章
    getArticleById(id: string) {
      return this.articles.find(a => a.id === id)
    },

    // 按分类获取文章
    getArticlesByCategory(category: string) {
      return this.articles.filter(a => a.meta.category === category)
    },

    // 按标签获取文章
    getArticlesByTag(tag: string) {
      return this.articles.filter(a => a.meta.tags.includes(tag))
    }
  },

  persist: false
})
