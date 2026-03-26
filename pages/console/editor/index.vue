<template>
  <div class="min-h-screen flex flex-col bg-[rgb(var(--color-background))]">
    <!-- 顶部 Header -->
    <header
      class="h-16 flex items-center justify-between px-6 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] sticky top-0 z-50">
      <div class="flex items-center gap-4">
        <NuxtLink to="/console/articles"
          class="flex items-center gap-2 text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] transition-colors">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span>返回</span>
        </NuxtLink>
        <div class="w-px h-6 bg-[rgb(var(--color-border))]" />
        <div class="text-lg font-bold text-[rgb(var(--color-text))]">
          {{ isEditing ? '编辑文章' : '新建文章' }}
        </div>
      </div>

      <div class="flex items-center gap-3">
        <el-button @click="saveDraft" :loading="saveLoading" :disabled="!isValid">
          <el-icon>
            <DocumentCopy />
          </el-icon>
          保存草稿
        </el-button>
        <el-button type="primary" @click="publish" :loading="saveLoading" :disabled="!isValid">
          <el-icon>
            <Promotion />
          </el-icon>
          {{ isEditing ? '更新且发布' : '发布' }}
        </el-button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-hidden">
      <div class="h-[calc(100vh-4rem)] max-w-7xl mx-auto px-6 py-6">
        <div class="flex flex-col lg:flex-row gap-6 h-full min-h-0">
          <!-- 右侧设置面板 -->
          <aside class="w-full lg:w-72 flex-shrink-0 order-2 lg:order-1">
            <div
              class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-5 h-full overflow-y-auto">
              <!-- 文章设置 -->
              <div class="mb-6">
                <h3
                  class="text-sm font-bold text-[rgb(var(--color-text-muted))] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <el-icon>
                    <Setting />
                  </el-icon>
                  文章设置
                </h3>

                <el-form label-position="top" size="default" :rules="rules" :model="article">
                  <!-- 内容格式 -->
                  <el-form-item label="内容格式">
                    <el-radio-group v-model="article.contentFormat" class="w-full">
                      <el-radio-button label="html">HTML</el-radio-button>
                      <el-radio-button label="markdown">Markdown</el-radio-button>
                    </el-radio-group>
                  </el-form-item>

                  <!-- 分类 - 使用 Autocomplete -->
                  <el-form-item label="分类">
                    <el-autocomplete
                      v-model="article.category"
                      :fetch-suggestions="queryCategorySuggestions"
                      placeholder="输入分类名称"
                      class="w-full"
                      clearable
                      @select="onCategorySelect"
                    />
                  </el-form-item>

                  <!-- 标签 - 使用 Autocomplete -->
                  <el-form-item label="标签">
                    <div class="flex gap-2">
                      <el-autocomplete
                        v-model="tagInput"
                        :fetch-suggestions="queryTagSuggestions"
                        placeholder="输入标签按回车添加"
                        class="flex-1"
                        clearable
                        @keyup.enter="addTag"
                        @select="onTagSelect"
                      />
                      <el-button @click="addTag" :icon="Plus" />
                    </div>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <el-tag v-for="tag in article.tags" :key="tag" closable @close="removeTag(tag)">
                        {{ tag }}
                      </el-tag>
                    </div>
                  </el-form-item>

                  <!-- 封面 -->
                  <el-form-item label="封面">
                    <div class="flex items-center gap-2">
                      <el-input v-model="article.cover" placeholder="封面图片 URL" />
                      <el-button @click="selectCover">选择</el-button>
                    </div>
                    <img v-if="article.cover" :src="article.cover" class="mt-2 w-full h-32 object-cover rounded-lg" />
                  </el-form-item>

                  <!-- 摘要 -->
                  <el-form-item label="摘要">
                    <el-input v-model="article.excerpt" type="textarea" :rows="3" placeholder="文章摘要（留空自动生成）" />
                  </el-form-item>
                </el-form>
              </div>

            </div>
          </aside>

          <!-- 编辑器区域 -->
          <div class="flex-1 min-w-0 order-1 lg:order-2 flex flex-col min-h-0">
            <!-- 标题输入 -->
            <el-form-item prop="title" class="flex-shrink-0" :rules="rules.title">
              <textarea v-model="article.title"
                class="w-full text-3xl font-extrabold text-[rgb(var(--color-text))] bg-transparent border-none p-0 resize-none outline-none"
                placeholder="文章标题..." rows="1" />
            </el-form-item>

            <!-- 编辑器 -->
            <el-form-item prop="content" class="content-editor-item flex-1 min-h-0">
              <div
                class="editor-wrapper h-full min-h-0 bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
                <ClientOnly>
                  <ArticleEditor
                    ref="editorRef"
                    v-model="article.content"
                    :format="article.contentFormat"
                    placeholder="开始编写你的文章..."
                    max-height="calc(100vh - 180px)"
                  />
                </ClientOnly>
              </div>
            </el-form-item>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, DocumentCopy, Promotion, Setting, MagicStick, Star, Brush, Document, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ArticleEditor from '~/components/editor/ArticleEditor.vue'
import { useStorage } from '~/composables/useStorage'
import { useRepoStore } from '~/stores/repo'
import { useArticleStore } from '~/stores/article'
import type { EditorArticle, Article } from '~/types/article'

// Props
const props = defineProps<{
  initialArticle?: Article | null
  isEditing?: boolean
}>()

// 路由和状态
const route = useRoute()
const router = useRouter()
const storage = useStorage()
const repoStore = useRepoStore()
const articleStore = useArticleStore()

// 计算属性：检查存储是否就绪
const isStorageReady = computed(() => {
  const repo = repoStore.currentRepo
  if (!repo) return false
  if (repo.id === 'local') {
    return storage.hasArticlesAccess?.value || false
  }
  return repo.connected
})

// 状态
const isEditMode = computed(() => props.isEditing || !!route.params.id)
const isEditing = computed(() => props.isEditing || !!props.initialArticle)
const saveLoading = ref(false)
const aiLoading = ref(false)

// 表单校验规则 - 移除分类必填
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

// 编辑器引用
const editorRef = ref<any>(null)

// 判断内容是否为空
const isContentEmpty = (html: string): boolean => {
  if (!html) return true
  // 移除所有 HTML 标签
  const text = html.replace(/<[^>]*>/g, '').trim()
  return text.length === 0
}

// 校验表单
const isValid = computed(() => {
  return article.value.title.trim() !== '' &&
         !isContentEmpty(article.value.content)
})

// 分类和标签数据源（从文章统计中获取）
const availableCategories = computed(() => {
  const categories = new Set<string>()
  articleStore.articles.forEach(a => {
    if (a.meta.category) categories.add(a.meta.category)
  })
  return Array.from(categories)
})

const availableTags = computed(() => {
  const tags = new Set<string>()
  articleStore.articles.forEach(a => {
    a.meta.tags.forEach(t => tags.add(t))
  })
  return Array.from(tags)
})

// Autocomplete 搜索函数
const queryCategorySuggestions = (queryString: string, cb: (arg: any[]) => void) => {
  const results = queryString
    ? availableCategories.value.filter(category =>
        category.toLowerCase().includes(queryString.toLowerCase())
      ).map(category => ({ value: category }))
    : availableCategories.value.map(category => ({ value: category }))
  cb(results)
}

const queryTagSuggestions = (queryString: string, cb: (arg: any[]) => void) => {
  const results = queryString
    ? availableTags.value.filter(tag =>
        tag.toLowerCase().includes(queryString.toLowerCase())
      ).map(tag => ({ value: tag }))
    : availableTags.value.map(tag => ({ value: tag }))
  cb(results)
}

const onCategorySelect = (item: Record<string, any>) => {
  article.value.category = item.value
}

const onTagSelect = (item: Record<string, any>) => {
  tagInput.value = item.value
  addTag()
}

// 编辑器文章状态
const article = ref<EditorArticle>({
  id: '',
  title: '',
  content: '',
  contentFormat: 'html',
  tags: [],
  category: '',
  date: new Date().toISOString(),
  isPublished: false,
  excerpt: '',
  cover: ''
})

// 标签输入
const tagInput = ref('')

// 添加标签
const addTag = () => {
  const value = tagInput.value.trim()
  if (value && !article.value.tags.includes(value)) {
    article.value.tags.push(value)
    tagInput.value = ''
  }
}

// 移除标签
const removeTag = (tag: string) => {
  const index = article.value.tags.indexOf(tag)
  if (index > -1) {
    article.value.tags.splice(index, 1)
  }
}

// 初始化文章
const initArticle = () => {
  if (props.initialArticle) {
    article.value = articleStore.toEditorArticle(props.initialArticle)
  } else {
    const newArticle = articleStore.createNewArticle()
    article.value = {
      id: newArticle.id,
      title: '',
      content: '',
      contentFormat: 'html',
      tags: [],
      category: '',
      date: newArticle.meta.createdAt,
      isPublished: false,
      excerpt: '',
      cover: ''
    }
  }
}

// 监听 initialArticle 变化
watch(() => props.initialArticle, () => {
  initArticle()
}, { immediate: true })

// 监听内容格式变化
watch(() => article.value.contentFormat, (newFormat, oldFormat) => {
  if (newFormat !== oldFormat && oldFormat) {
    // 格式切换提示
    ElMessage.info(`已切换到 ${newFormat.toUpperCase()} 编辑器`)
    // TODO: 如果需要，可以在这里添加 HTML <-> Markdown 的转换逻辑
  }
})

onMounted(async () => {
  // 加载文章列表以获取分类和标签
  if (storage.hasArticlesAccess?.value) {
    const articles = await storage.loadArticles()
    articleStore.articles = articles
  }

  // 如果没有通过 props 传入文章，且是编辑模式，显示提示
  if (isEditMode.value && !props.initialArticle) {
    console.warn('编辑模式下未提供文章数据')
  }
})

// 保存草稿
const saveDraft = async () => {
  // 校验
  if (!article.value.title.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }
  if (isContentEmpty(article.value.content)) {
    ElMessage.warning('请输入文章内容')
    return
  }

  saveLoading.value = true
  try {
    const articleData = articleStore.createFromEditor(article.value, props.initialArticle || undefined)
    await storage.saveArticle(articleData)
    ElMessage.success('草稿已保存')
  } catch (err) {
    console.error('保存失败:', err)
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}

// 发布文章
const publish = async () => {
  // 校验
  if (!article.value.title.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }
  if (isContentEmpty(article.value.content)) {
    ElMessage.warning('请输入文章内容')
    return
  }

  saveLoading.value = true
  try {
    article.value.isPublished = true
    const articleData = articleStore.createFromEditor(article.value, props.initialArticle || undefined)
    await storage.saveArticle(articleData)
    ElMessage.success(isEditing.value ? '文章已更新' : '文章已发布')
    router.push('/console/articles')
  } catch (err) {
    console.error('发布失败:', err)
    ElMessage.error('发布失败')
  } finally {
    saveLoading.value = false
  }
}

// 选择封面图片
const selectCover = async () => {
  // 从媒体库选择图片
  ElMessage.info('媒体库选择功能开发中...')
}

// AI 功能
const getSelectedText = (): string => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    return selection.toString().trim()
  }
  return article.value.content
}

const callAI = async (action: string, label: string) => {
  if (aiLoading.value) return
  ElMessage.info(`${label}功能开发中...`)
}

const aiWrite = () => callAI('continue', 'AI 续写')
const aiPolish = () => callAI('polish', '智能润色')
const aiSummary = () => callAI('summarize', '生成摘要')
</script>

<style scoped>
/* 修复 el-form-item 高度问题 */
:deep(.content-editor-item) {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  margin-bottom: 0;
}

:deep(.content-editor-item .el-form-item__content) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

:deep(.content-editor-item .editor-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
