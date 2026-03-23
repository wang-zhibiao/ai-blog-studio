<template>
    <div class="min-h-screen flex flex-col bg-[rgb(var(--color-background))]">
      <!-- 顶部 Header -->
      <header
        class="h-16 flex items-center justify-between px-6 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] sticky top-0 z-50">
        <div class="flex items-center gap-4">
          <NuxtLink to="/console"
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
          <el-button @click="saveDraft">
            <el-icon>
              <DocumentCopy />
            </el-icon>
            保存草稿
          </el-button>
          <el-button type="primary" @click="publish">
            <el-icon>
              <Promotion />
            </el-icon>
            {{ article.isPublished ? '更新' : '发布' }}
          </el-button>
        </div>
      </header>

      <!-- 主内容区 -->
      <main class="flex-1 overflow-hidden">
        <div class="h-full max-w-7xl mx-auto px-6 py-8">
          <div class="flex flex-col lg:flex-row gap-6 h-full">
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

                  <el-form label-position="top" size="default">
                    <el-form-item label="分类">
                      <el-select v-model="article.category" placeholder="选择分类" class="w-full">
                        <el-option label="技术" value="技术" />
                        <el-option label="教程" value="教程" />
                        <el-option label="生活" value="生活" />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="标签">
                      <el-select v-model="article.tags" multiple filterable allow-create placeholder="添加标签..."
                        class="w-full">
                        <el-option label="Vue.js" value="Vue.js" />
                        <el-option label="Nuxt" value="Nuxt" />
                        <el-option label="TypeScript" value="TypeScript" />
                        <el-option label="Tailwind" value="Tailwind" />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="发布日期">
                      <el-date-picker v-model="article.date" type="date" placeholder="选择日期" class="w-full"
                        value-format="YYYY-MM-DD" />
                    </el-form-item>
                  </el-form>
                </div>

                <el-divider class="my-6" />

                <!-- AI 助手 -->
                <div>
                  <h3
                    class="text-sm font-bold text-[rgb(var(--color-text-muted))] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <el-icon>
                      <MagicStick />
                    </el-icon>
                    AI 助手
                  </h3>

                  <div class="space-y-2">
                    <el-button class="w-full justify-start" @click="aiWrite">
                      <el-icon>
                        <Star />
                      </el-icon>
                      AI 续写
                    </el-button>
                    <el-button class="w-full justify-start" @click="aiPolish">
                      <el-icon>
                        <Brush />
                      </el-icon>
                      智能润色
                    </el-button>
                    <el-button class="w-full justify-start" @click="aiSummary">
                      <el-icon>
                        <Document />
                      </el-icon>
                      生成摘要
                    </el-button>
                  </div>
                </div>
              </div>
            </aside>

            <!-- 编辑器区域 -->
            <div class="flex-1 min-w-0 order-1 lg:order-2 flex flex-col h-full">
              <!-- 标题输入 -->
              <textarea v-model="article.title"
                class="w-full text-3xl font-extrabold text-[rgb(var(--color-text))] bg-transparent border-none p-0 resize-none mb-4 outline-none"
                placeholder="文章标题..." rows="1" />

              <!-- 编辑器 -->
              <div
                class="flex-1 min-h-0 bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
                <ClientOnly>
                  <SunEditor v-model="article.content" height="100%" placeholder="开始编写你的文章..." />
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, DocumentCopy, Promotion, Setting, MagicStick, Star, Brush, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SunEditor from '~/components/editor/SunEditor.vue'

const route = useRoute()
const router = useRouter()

const isEditing = computed(() => !!route.params.id)

const article = ref({
  id: Date.now().toString(),
  title: '',
  content: '',
  tags: [] as string[],
  category: '',
  date: new Date().toISOString().split('T')[0],
  isPublished: false
})

onMounted(() => {
  if (route.params.id) {
    // 模拟加载文章数据
    article.value = {
      id: route.params.id as string,
      title: '使用 AI 辅助写作的 10 个实用技巧',
      content: '<p>这是文章内容...</p>',
      tags: ['AI', '写作'],
      category: '技术',
      date: '2026-03-20',
      isPublished: true
    }
  }
})

const saveDraft = () => {
  console.log('保存草稿:', article.value)
  ElMessage.success('草稿已保存')
}

const publish = () => {
  article.value.isPublished = true
  console.log('发布文章:', article.value)
  ElMessage.success(article.value.isPublished ? '文章已更新' : '文章已发布')
  router.push('/console')
}

const aiWrite = () => {
  ElMessage.info('AI 续写功能开发中...')
}

const aiPolish = () => {
  ElMessage.info('智能润色功能开发中...')
}

const aiSummary = () => {
  ElMessage.info('生成摘要功能开发中...')
}
</script>
