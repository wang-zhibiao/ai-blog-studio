<template>
  <ConsoleLayout>
    <div class="space-y-6">
      <!-- 页面标题 -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold text-[rgb(var(--color-text))] mb-2">分类标签</h1>
          <p class="text-[rgb(var(--color-text-muted))]">管理你的文章分类和标签</p>
        </div>
        <div class="text-sm text-[rgb(var(--color-text-muted))]">
          数据来自 {{ articles.length }} 篇文章
        </div>
      </div>

      <RepoGuard>
        <!-- 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <el-icon class="animate-spin text-4xl text-[rgb(var(--color-primary))]"><Loading /></el-icon>
        </div>

        <!-- Tab 切换 -->
        <template v-else>
          <el-tabs v-model="activeTab" class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-1">
            <!-- 分类管理 -->
            <el-tab-pane label="分类管理" name="categories">
              <div class="p-4">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-4">
                    <el-input
                      v-model="categorySearch"
                      placeholder="搜索分类..."
                      class="w-64"
                      :prefix-icon="Search"
                      clearable
                    />
                  </div>
                </div>

                <div v-if="categories.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
                  <div class="text-4xl mb-3">📂</div>
                  <h3 class="text-lg font-semibold text-[rgb(var(--color-text))] mb-1">暂无分类</h3>
                  <p class="text-[rgb(var(--color-text-muted))]">在文章中添加分类后会显示在这里</p>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    v-for="category in filteredCategories"
                    :key="category.name"
                    class="bg-[rgb(var(--color-background))] rounded-xl p-4 border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))] transition-colors"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))]"
                        >
                          📁
                        </div>
                        <div>
                          <div class="font-semibold text-[rgb(var(--color-text))]">{{ category.name }}</div>
                          <div class="text-sm text-[rgb(var(--color-text-muted))]">{{ category.count }} 篇文章</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 标签管理 -->
            <el-tab-pane label="标签管理" name="tags">
              <div class="p-4">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-4">
                    <el-input
                      v-model="tagSearch"
                      placeholder="搜索标签..."
                      class="w-64"
                      :prefix-icon="Search"
                      clearable
                    />
                  </div>
                </div>

                <div v-if="tags.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
                  <div class="text-4xl mb-3">🏷️</div>
                  <h3 class="text-lg font-semibold text-[rgb(var(--color-text))] mb-1">暂无标签</h3>
                  <p class="text-[rgb(var(--color-text-muted))]">在文章中添加标签后会显示在这里</p>
                </div>

                <div v-else class="flex flex-wrap gap-3">
                  <div
                    v-for="tag in filteredTags"
                    :key="tag.name"
                    class="group relative flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-background))] rounded-full border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))] transition-colors"
                  >
                    <span class="text-[rgb(var(--color-text))]">{{ tag.name }}</span>
                    <span class="text-sm text-[rgb(var(--color-text-muted))]">({{ tag.count }})</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>
      </RepoGuard>
    </div>
  </ConsoleLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ConsoleLayout from '~/components/layout/ConsoleLayout.vue'
import RepoGuard from '~/components/console/RepoGuard.vue'
import { useLocalFS, type Article } from '~/composables/useLocalFS'

const localFS = useLocalFS()

const activeTab = ref<'categories' | 'tags'>('categories')
const categorySearch = ref('')
const tagSearch = ref('')
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

const filteredCategories = computed(() => {
  if (!categorySearch.value) return categories.value
  const q = categorySearch.value.toLowerCase()
  return categories.value.filter(c => c.name.toLowerCase().includes(q))
})

const filteredTags = computed(() => {
  if (!tagSearch.value) return tags.value
  const q = tagSearch.value.toLowerCase()
  return tags.value.filter(t => t.name.toLowerCase().includes(q))
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
</script>
