<template>
  <ConsoleLayout>
    <div class="space-y-6">
      <!-- 页面标题 -->
      <div>
        <h1 class="text-3xl font-extrabold text-[rgb(var(--color-text))] mb-2">概览</h1>
        <p class="text-[rgb(var(--color-text-muted))]">查看你的博客数据概览</p>
      </div>

      <RepoGuard>
        <!-- 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <el-icon class="animate-spin text-4xl text-[rgb(var(--color-primary))]"><Loading /></el-icon>
        </div>

        <template v-else>
          <!-- 统计卡片 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-[rgb(var(--color-surface))] rounded-xl p-5 border border-[rgb(var(--color-border))]">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-[rgba(var(--color-primary),0.15)] flex items-center justify-center text-2xl">
                  📝
                </div>
                <div>
                  <div class="text-2xl font-bold text-[rgb(var(--color-text))]">{{ articles.length }}</div>
                  <div class="text-sm text-[rgb(var(--color-text-muted))]">总文章数</div>
                </div>
              </div>
            </div>
            <div class="bg-[rgb(var(--color-surface))] rounded-xl p-5 border border-[rgb(var(--color-border))]">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-[rgba(22,163,74,0.15)] flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div>
                  <div class="text-2xl font-bold text-[rgb(var(--color-text))]">{{ publishedCount }}</div>
                  <div class="text-sm text-[rgb(var(--color-text-muted))]">已发布</div>
                </div>
              </div>
            </div>
            <div class="bg-[rgb(var(--color-surface))] rounded-xl p-5 border border-[rgb(var(--color-border))]">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-[rgba(245,158,11,0.15)] flex items-center justify-center text-2xl">
                  📄
                </div>
                <div>
                  <div class="text-2xl font-bold text-[rgb(var(--color-text))]">{{ draftCount }}</div>
                  <div class="text-sm text-[rgb(var(--color-text-muted))]">草稿</div>
                </div>
              </div>
            </div>
            <div class="bg-[rgb(var(--color-surface))] rounded-xl p-5 border border-[rgb(var(--color-border))]">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-[rgba(236,72,153,0.15)] flex items-center justify-center text-2xl">
                  👁️
                </div>
                <div>
                  <div class="text-2xl font-bold text-[rgb(var(--color-text))]">1,234</div>
                  <div class="text-sm text-[rgb(var(--color-text-muted))]">总浏览</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分类和标签统计 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 分类统计 -->
            <div class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-[rgb(var(--color-text))]">分类统计</h2>
                <NuxtLink to="/console/categories" class="text-sm text-[rgb(var(--color-primary))] hover:underline">
                  查看全部
                </NuxtLink>
              </div>
              <div v-if="categories.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
                <div class="text-3xl mb-2">📂</div>
                <p class="text-[rgb(var(--color-text-muted))]">暂无分类</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="category in categories.slice(0, 5)"
                  :key="category.name"
                  class="flex items-center justify-between p-3 bg-[rgb(var(--color-background))] rounded-lg"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))]">
                      📁
                    </div>
                    <span class="font-medium text-[rgb(var(--color-text))]">{{ category.name }}</span>
                  </div>
                  <span class="text-sm text-[rgb(var(--color-text-muted))]">{{ category.count }} 篇</span>
                </div>
              </div>
            </div>

            <!-- 标签统计 -->
            <div class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-[rgb(var(--color-text))]">标签统计</h2>
                <NuxtLink to="/console/categories" class="text-sm text-[rgb(var(--color-primary))] hover:underline">
                  查看全部
                </NuxtLink>
              </div>
              <div v-if="tags.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
                <div class="text-3xl mb-2">🏷️</div>
                <p class="text-[rgb(var(--color-text-muted))]">暂无标签</p>
              </div>
              <div v-else class="flex flex-wrap gap-2 mb-6">
                <span
                  v-for="tag in tags.slice(0, 15)"
                  :key="tag.name"
                  class="px-3 py-1.5 bg-[rgb(var(--color-background))] rounded-full text-sm border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))]"
                >
                  {{ tag.name }}
                  <span class="text-[rgb(var(--color-text-muted))]">({{ tag.count }})</span>
                </span>
              </div>
              <div class="grid grid-cols-3 gap-4 pt-4 border-t border-[rgb(var(--color-border))]">
                <div class="text-center">
                  <div class="text-2xl font-bold text-[rgb(var(--color-primary))]">{{ tags.length }}</div>
                  <div class="text-sm text-[rgb(var(--color-text-muted))]">总标签数</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-[rgb(var(--color-primary))]">
                    {{ tags.length > 0 ? tags.sort((a, b) => b.count - a.count)[0].count : 0 }}
                  </div>
                  <div class="text-sm text-[rgb(var(--color-text-muted))]">最多使用</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-[rgb(var(--color-primary))]">
                    {{ tags.length > 0 ? Math.round(tags.reduce((sum, t) => sum + t.count, 0) / tags.length) : 0 }}
                  </div>
                  <div class="text-sm text-[rgb(var(--color-text-muted))]">平均使用</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快捷操作 -->
          <div class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-6">
            <h2 class="text-xl font-bold text-[rgb(var(--color-text))] mb-4">快捷操作</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <NuxtLink to="/console/editor" class="flex flex-col items-center gap-2 p-4 bg-[rgb(var(--color-background))] rounded-lg hover:border-[rgb(var(--color-primary))] border border-[rgb(var(--color-border))] transition-colors">
                <div class="w-10 h-10 rounded-lg bg-[rgba(var(--color-primary),0.1)] flex items-center justify-center text-xl text-[rgb(var(--color-primary))]">
                  ✏️
                </div>
                <span class="text-sm font-medium text-[rgb(var(--color-text))]">新建文章</span>
              </NuxtLink>
              <NuxtLink to="/console/articles" class="flex flex-col items-center gap-2 p-4 bg-[rgb(var(--color-background))] rounded-lg hover:border-[rgb(var(--color-primary))] border border-[rgb(var(--color-border))] transition-colors">
                <div class="w-10 h-10 rounded-lg bg-[rgba(var(--color-primary),0.1)] flex items-center justify-center text-xl text-[rgb(var(--color-primary))]">
                  📝
                </div>
                <span class="text-sm font-medium text-[rgb(var(--color-text))]">文章列表</span>
              </NuxtLink>
              <NuxtLink to="/console/media" class="flex flex-col items-center gap-2 p-4 bg-[rgb(var(--color-background))] rounded-lg hover:border-[rgb(var(--color-primary))] border border-[rgb(var(--color-border))] transition-colors">
                <div class="w-10 h-10 rounded-lg bg-[rgba(var(--color-primary),0.1)] flex items-center justify-center text-xl text-[rgb(var(--color-primary))]">
                  🖼️
                </div>
                <span class="text-sm font-medium text-[rgb(var(--color-text))]">媒体库</span>
              </NuxtLink>
              <NuxtLink to="/console/settings" class="flex flex-col items-center gap-2 p-4 bg-[rgb(var(--color-background))] rounded-lg hover:border-[rgb(var(--color-primary))] border border-[rgb(var(--color-border))] transition-colors">
                <div class="w-10 h-10 rounded-lg bg-[rgba(var(--color-primary),0.1)] flex items-center justify-center text-xl text-[rgb(var(--color-primary))]">
                  ⚙️
                </div>
                <span class="text-sm font-medium text-[rgb(var(--color-text))]">设置</span>
              </NuxtLink>
            </div>
          </div>
        </template>
      </RepoGuard>
    </div>
  </ConsoleLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ConsoleLayout from '~/components/layout/ConsoleLayout.vue'
import RepoGuard from '~/components/console/RepoGuard.vue'
import { useLocalFS, type Article } from '~/composables/useLocalFS'

const localFS = useLocalFS()

const loading = ref(false)
const articles = ref<Article[]>([])

interface Category {
  name: string
  count: number
}

interface Tag {
  name: string
  count: number
}

const publishedCount = computed(() =>
  articles.value.filter(a => a.meta.status === 'published').length
)
const draftCount = computed(() =>
  articles.value.filter(a => a.meta.status === 'draft').length
)

const categories = computed<Category[]>(() => {
  const catMap = new Map<string, number>()
  articles.value.forEach(a => {
    if (a.meta.category) {
      const cat = a.meta.category
      catMap.set(cat, (catMap.get(cat) || 0) + 1)
    }
  })
  return Array.from(catMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const tags = computed<Tag[]>(() => {
  const tagMap = new Map<string, number>()
  articles.value.forEach(a => {
    a.meta.tags.forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
    })
  })
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const loadArticles = async () => {
  if (!localFS.hasArticlesAccess.value) return

  loading.value = true
  try {
    articles.value = await localFS.loadArticles()
  } catch (err) {
    console.error('加载文章失败:', err)
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticles()
})

// 监听权限状态变化，重新加载文章
watch(() => localFS.hasArticlesAccess.value, (hasAccess) => {
  if (hasAccess) {
    loadArticles()
  } else {
    articles.value = []
  }
})
</script>
