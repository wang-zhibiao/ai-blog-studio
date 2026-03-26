<template>
  <ConsoleLayout>
    <div class="space-y-6 px-2">
      <!-- 页面标题和操作 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-[rgb(var(--color-text))] mb-2">文章管理</h1>
          <p class="text-[rgb(var(--color-text-muted))]">管理和编辑你的所有博客文章</p>
        </div>
      </div>

      <RepoGuard>
        <!-- 搜索栏 -->
        <div class="mt-6 mb-6">
          <SearchBar
            v-model="searchQuery"
            placeholder="搜索文章标题或摘要..."
            :show-view-toggle="true"
            v-model:view-mode="viewMode"
            @search="handleSearch"
          >
            <template #filters>
              <el-select v-model="filterCategory" placeholder="分类" class="min-w-[100px] w-44" clearable>
                <el-option
                  v-for="cat in allCategories"
                  :key="cat"
                  :label="cat"
                  :value="cat"
                />
              </el-select>
              <el-select v-model="filterStatus" placeholder="状态" class="min-w-[100px] w-32" clearable>
                <el-option label="已发布" value="published" />
                <el-option label="草稿" value="draft" />
              </el-select>
              <el-select v-model="filterSort" placeholder="排序" class="min-w-[100px] w-40">
                <el-option label="最新修改" value="updated" />
                <el-option label="创建时间" value="created" />
                <el-option label="标题" value="title" />
              </el-select>
            </template>
            <template #actions>
              <NuxtLink to="/console/editor">
                <el-button type="primary" :loading="loading">
                  <el-icon><Plus /></el-icon>
                  新建文章
                </el-button>
              </NuxtLink>
            </template>
          </SearchBar>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <el-icon class="animate-spin text-4xl text-[rgb(var(--color-primary))]"><Loading /></el-icon>
        </div>

        <!-- 卡片视图 -->
        <template v-else>
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div
              v-for="article in filteredArticles"
              :key="article.id"
              class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))] transition-colors group cursor-pointer"
              @click="openArticle(article.id)"
            >
              <div class="p-5 border-b border-[rgb(var(--color-border))]">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-[rgb(var(--color-text))] truncate group-hover:text-[rgb(var(--color-primary))] transition-colors">
                      {{ article.title }}
                    </h3>
                  </div>
                  <el-tag :type="article.meta.status === 'published' ? 'success' : 'info'" size="small">
                    {{ article.meta.status === 'published' ? '已发布' : '草稿' }}
                  </el-tag>
                </div>
              </div>
              <div class="p-5">
                <p class="text-[rgb(var(--color-text-muted))] text-sm line-clamp-3 mb-4">
                  {{ getArticlePlainText(article) || '暂无内容' }}
                </p>
                <div class="flex items-center gap-2 text-xs text-[rgb(var(--color-text-muted))] mb-4">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatDate(article.meta.updatedAt) }}</span>
                  <span v-if="article.meta.category" class="ml-auto px-2 py-0.5 bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))] rounded-full">
                    {{ article.meta.category }}
                  </span>
                </div>
                <div class="flex items-center justify-end gap-2 pt-3 border-t border-[rgb(var(--color-border))]">
                  <el-button link type="primary" size="small" @click.stop="openArticle(article.id)">编辑</el-button>
                  <el-button link type="danger" size="small" @click.stop="deleteArticle(article)">删除</el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden mt-6">
            <el-table :data="filteredArticles" style="width: 100%">
              <el-table-column label="标题" prop="title" min-width="250">
                <template #default="{ row }">
                  <div class="font-medium text-[rgb(var(--color-text))] cursor-pointer hover:text-[rgb(var(--color-primary))]" @click="openArticle(row.id)">
                    {{ row.title }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="分类" width="120">
                <template #default="{ row }">
                  <span v-if="row.meta.category" class="px-2 py-1 bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))] rounded-full text-xs">
                    {{ row.meta.category }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="标签" width="180">
                <template #default="{ row }">
                  <div class="flex flex-wrap gap-1">
                    <el-tag v-for="tag in row.meta.tags.slice(0, 2)" :key="tag" size="small" type="info">
                      {{ tag }}
                    </el-tag>
                    <span v-if="row.meta.tags.length > 2" class="text-xs text-[rgb(var(--color-text-muted))]">
                      +{{ row.meta.tags.length - 2 }}
                    </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.meta.status === 'published' ? 'success' : 'info'" size="small">
                    {{ row.meta.status === 'published' ? '已发布' : '草稿' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="更新时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.meta.updatedAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="openArticle(row.id)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="deleteArticle(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && filteredArticles.length === 0" class="flex flex-col items-center justify-center py-20 text-center mt-6">
            <div class="text-6xl mb-4"><FaIcon icon="file-lines" class="text-6xl text-[rgb(var(--color-text-muted))]" /></div>
            <h3 class="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">暂无文章</h3>
            <p class="text-[rgb(var(--color-text-muted))] mb-4">开始创作你的第一篇博客文章吧</p>
            <NuxtLink to="/console/editor">
              <el-button type="primary">
                <el-icon><Plus /></el-icon>
                新建文章
              </el-button>
            </NuxtLink>
          </div>
        </template>
      </RepoGuard>
    </div>
  </ConsoleLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Calendar, Loading } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import ConsoleLayout from '~/components/layout/ConsoleLayout.vue'
import SearchBar from '~/components/console/SearchBar.vue'
import RepoGuard from '~/components/console/RepoGuard.vue'
import { useStorage } from '~/composables/useStorage'
import { useRepoStore } from '~/stores/repo'
import type { Article } from '~/types/article'
import { generateExcerpt } from '~/types/article'

const router = useRouter()
const storage = useStorage()
const repoStore = useRepoStore()

// 计算属性：检查当前存储是否就绪
const isStorageReady = computed(() => {
  const repo = repoStore.currentRepo
  if (!repo) return false
  if (repo.id === 'local') {
    return storage.hasArticlesAccess?.value || false
  }
  return repo.connected
})

// 从文章内容中提取纯文本
const getArticlePlainText = (article: Article): string => {
  return generateExcerpt(article.content, 500)
}

const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const filterSort = ref('updated')
const viewMode = ref<'grid' | 'list'>('grid')
const loading = ref(false)
const articles = ref<Article[]>([])

const allCategories = computed(() => {
  const cats = new Set<string>()
  articles.value.forEach(a => {
    if (a.meta.category) cats.add(a.meta.category)
  })
  return Array.from(cats)
})

const filteredArticles = computed(() => {
  let result = [...articles.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.meta.excerpt.toLowerCase().includes(q)
    )
  }

  if (filterCategory.value) {
    result = result.filter(a => a.meta.category === filterCategory.value)
  }

  if (filterStatus.value) {
    result = result.filter(a =>
      filterStatus.value === 'published'
        ? a.meta.status === 'published'
        : a.meta.status === 'draft'
    )
  }

  // 排序
  if (filterSort.value === 'title') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  } else if (filterSort.value === 'created') {
    result.sort((a, b) =>
      new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime()
    )
  } else {
    result.sort((a, b) =>
      new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime()
    )
  }

  return result
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const handleSearch = () => {
  // 搜索已通过 computed 自动处理
}

const loadArticles = async () => {
  if (!isStorageReady.value) return

  loading.value = true
  try {
    articles.value = await storage.loadArticles()
  } catch (err) {
    console.error('加载文章失败:', err)
    ElMessage.error('加载文章失败: ' + (err instanceof Error ? err.message : '未知错误'))
  } finally {
    loading.value = false
  }
}

const openArticle = (id: string) => {
  router.push(`/console/editor/${id}`)
}

const deleteArticle = async (article: Article) => {
  ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await storage.deleteArticle(article.id)
      articles.value = articles.value.filter(a => a.id !== article.id)
      ElMessage.success('删除成功')
    } catch (err) {
      console.error('删除文章失败:', err)
      ElMessage.error('删除失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }).catch(() => {})
}

onMounted(() => {
  loadArticles()
})

// 监听权限状态变化，重新加载文章
watch(() => isStorageReady.value, (hasAccess) => {
  if (hasAccess) {
    loadArticles()
  } else {
    articles.value = []
  }
})
</script>
