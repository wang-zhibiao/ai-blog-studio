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
import { useLocalFS } from '~/composables/useLocalFS'
import type { Article } from '~/types/article'

const route = useRoute()
const router = useRouter()
const localFS = useLocalFS()

const loading = ref(true)
const article = ref<Article | null>(null)

onMounted(async () => {
  const articleId = route.params.id as string

  if (!articleId) {
    ElMessage.error('文章 ID 不能为空')
    router.push('/console/articles')
    return
  }

  // 检查是否有权限访问本地存储
  if (!localFS.hasArticlesAccess.value) {
    ElMessage.warning('请先配置本地存储')
    router.push('/console/settings')
    return
  }

  try {
    loading.value = true

    // 获取文章目录 handle
    if (!localFS.config.value.articlesDirHandle) {
      throw new Error('文章目录未配置')
    }

    // 从文件系统加载文章
    const articles = await localFS.loadArticles()
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
