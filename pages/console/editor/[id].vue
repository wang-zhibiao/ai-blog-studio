<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-[rgb(var(--color-background))]">
    <div class="text-center">
      <el-icon class="animate-spin text-4xl text-[rgb(var(--color-primary))] mb-4">
        <Loading />
      </el-icon>
      <p class="text-[rgb(var(--color-text-muted))]">加载文章中...</p>
    </div>
  </div>
  <EditorPage v-else :initial-article="article" :is-editing="true" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import EditorPage from './index.vue'
import { useStorage } from '~/composables/useStorage'
import { useRepoStore } from '~/stores/repo'
import type { Article } from '~/types/article'

const route = useRoute()
const router = useRouter()
const storage = useStorage()
const repoStore = useRepoStore()

// 计算属性：检查存储是否就绪
const isStorageReady = computed(() => {
  const repo = repoStore.currentRepo
  if (!repo) return false
  if (repo.id === 'local') {
    return storage.hasArticlesAccess?.value || false
  }
  return repo.connected
})

const loading = ref(true)
const article = ref<Article | null>(null)

onMounted(async () => {
  const articleId = route.params.id as string

  if (!articleId) {
    ElMessage.error('文章 ID 不能为空')
    router.push('/console/articles')
    return
  }

  // 检查存储是否就绪
  if (!isStorageReady.value) {
    ElMessage.warning('请先配置存储')
    router.push('/console/settings')
    return
  }

  try {
    loading.value = true

    // 从存储加载文章
    const articles = await storage.loadArticles()
    const foundArticle = articles.find(a => a.id === articleId)

    if (!foundArticle) {
      throw new Error('文章不存在')
    }

    article.value = foundArticle
  } catch (err) {
    console.error('加载文章失败:', err)
    ElMessage.error(err instanceof Error ? err.message : '加载文章失败')
    router.push('/console/articles')
  } finally {
    loading.value = false
  }
})
</script>
