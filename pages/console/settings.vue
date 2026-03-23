<template>
  <ConsoleLayout>
    <div class="space-y-6">
      <!-- 页面标题 -->
      <div>
        <h1 class="text-3xl font-extrabold text-[rgb(var(--color-text))] mb-2">设置</h1>
        <p class="text-[rgb(var(--color-text-muted))]">配置你的博客工作室</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 侧边导航 -->
        <div class="w-full lg:w-56 flex-shrink-0">
          <div class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-1">
            <button
              v-for="item in navItems"
              :key="item.id"
              @click="activeTab = item.id"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors"
              :class="activeTab === item.id
                ? 'bg-[rgba(var(--color-primary),0.15)] text-[rgb(var(--color-primary))]'
                : 'text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-light))] hover:text-[rgb(var(--color-text))]'"
            >
              <span class="text-xl">{{ item.icon }}</span>
              <span class="font-medium">{{ item.label }}</span>
            </button>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="flex-1 min-w-0 space-y-6">
          <!-- 主题设置 -->
          <div v-if="activeTab === 'theme'" class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-6">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-[rgb(var(--color-text))] mb-2">主题设置</h2>
              <p class="text-[rgb(var(--color-text-muted))]">选择你喜欢的主题颜色</p>
            </div>
            <div class="max-w-md">
              <label class="block text-sm font-medium text-[rgb(var(--color-text))] mb-4">主题颜色</label>
              <ThemeSwitcher />
            </div>
          </div>

          <!-- 仓库配置 -->
          <div v-if="activeTab === 'repos'" class="space-y-6">
            <!-- 本地存储配置 -->
            <div class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-6">
              <div class="mb-6">
                <h2 class="text-xl font-bold text-[rgb(var(--color-text))] mb-2">本地存储</h2>
                <p class="text-[rgb(var(--color-text-muted))]">配置本地文件夹用于存储文章和媒体文件</p>
              </div>

              <div class="space-y-6">
                <!-- 浏览器兼容性提示 -->
                <el-alert
                  v-if="!localFS.isSupported"
                  title="File System API 不被支持"
                  type="warning"
                  :closable="false"
                  description="请使用 Chrome、Edge 或其他支持 File System API 的现代浏览器"
                />

                <!-- 本地存储状态 -->
                <div class="space-y-4">
                  <!-- 已连接状态 -->
                  <template v-if="localRepo?.connected">
                    <div class="flex items-center justify-between p-4 bg-[rgba(22,163,74,0.1)] rounded-xl border border-green-200">
                      <div class="flex items-center gap-3">
                        <el-icon class="text-green-500 text-xl"><CircleCheck /></el-icon>
                        <div>
                          <div class="font-semibold text-[rgb(var(--color-text))]">本地存储已连接</div>
                          <div class="text-sm text-[rgb(var(--color-text-muted))]">文章和媒体库已授权</div>
                        </div>
                      </div>
                      <el-button @click="clearArticles" type="danger">
                        <el-icon><Delete /></el-icon>
                        断开
                      </el-button>
                    </div>
                  </template>

                  <!-- 未连接状态 -->
                  <template v-else>
                    <div class="space-y-4">
                      <div class="flex items-center justify-between p-4 bg-[rgb(var(--color-background))] rounded-xl border border-[rgb(var(--color-border))]">
                        <div>
                          <div class="font-semibold text-[rgb(var(--color-text))]">本地存储未连接</div>
                          <div class="text-sm text-[rgb(var(--color-text-muted))]">选择文件夹以授权访问</div>
                        </div>
                        <el-button @click="selectArticlesFolder" :disabled="!localFS.isSupported" type="primary">
                          <el-icon><FolderOpened /></el-icon>
                          选择文件夹
                        </el-button>
                      </div>
                      <p class="text-xs text-[rgb(var(--color-text-muted))]">
                        选择文件夹后，文章将保存在此目录下，媒体文件默认存储在 {文章目录}/assets
                      </p>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- 远程仓库配置 -->
            <div class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-6">
              <div class="mb-6">
                <h2 class="text-xl font-bold text-[rgb(var(--color-text))] mb-2">远程仓库</h2>
                <p class="text-[rgb(var(--color-text-muted))]">使用 GitHub 或 Gitee 存储你的文章</p>
              </div>

              <div class="space-y-3">
                <div
                  v-for="repo in remoteRepos"
                  :key="repo.id"
                  class="flex items-center justify-between p-4 bg-[rgb(var(--color-background))] rounded-xl border border-[rgb(var(--color-border))]"
                >
                  <div class="flex items-center gap-4">
                    <div class="text-3xl">{{ repo.icon }}</div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-[rgb(var(--color-text))]">{{ repo.name }}</span>
                        <span v-if="repo.active" class="px-2 py-0.5 bg-[rgba(22,163,74,0.15)] text-green-500 rounded-full text-xs font-semibold">
                          当前
                        </span>
                        <span v-if="repo.connected" class="px-2 py-0.5 bg-[rgba(22,163,74,0.15)] text-green-500 rounded-full text-xs font-semibold">
                          已连接
                        </span>
                      </div>
                      <div v-if="repo.connected && repo.username && repo.repo" class="text-sm text-[rgb(var(--color-text-muted))]">
                        {{ repo.username }} · {{ repo.repo }}
                      </div>
                      <div v-else class="text-sm text-yellow-500">
                        未连接
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <template v-if="!repo.connected">
                      <el-button type="primary" size="small" @click="connectRepo(repo)">
                        连接
                      </el-button>
                    </template>
                    <template v-else>
                      <el-button size="small" @click="repo.active || setActiveRepo(repo.id)" :disabled="repo.active">
                        {{ repo.active ? '使用中' : '设为当前' }}
                      </el-button>
                      <el-button size="small" type="danger" @click="disconnectRepo(repo.id)">
                        断开
                      </el-button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI 配置 -->
          <div v-if="activeTab === 'ai'" class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-6">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-[rgb(var(--color-text))] mb-2">AI 配置</h2>
              <p class="text-[rgb(var(--color-text-muted))]">配置 AI 写作助手</p>
            </div>

            <el-form :model="aiConfig" label-position="top" class="max-w-lg">
              <el-form-item label="AI 服务提供商">
                <el-select v-model="aiConfig.provider" class="w-full">
                  <el-option label="OpenAI (GPT)" value="openai" />
                  <el-option label="Anthropic (Claude)" value="anthropic" />
                  <el-option label="DeepSeek" value="deepseek" />
                </el-select>
              </el-form-item>
              <el-form-item label="API Key">
                <el-input
                  v-model="aiConfig.apiKey"
                  type="password"
                  placeholder="sk-..."
                  show-password
                />
              </el-form-item>
              <el-form-item label="API 端点 (可选)">
                <el-input v-model="aiConfig.baseUrl" placeholder="https://api.example.com/v1" />
              </el-form-item>
              <el-form-item label="模型">
                <el-select v-model="aiConfig.model" class="w-full">
                  <el-option label="gpt-4o" value="gpt-4o" />
                  <el-option label="gpt-3.5-turbo" value="gpt-3.5-turbo" />
                  <el-option label="claude-3-opus" value="claude-3-opus" />
                  <el-option label="claude-3-sonnet" value="claude-3-sonnet" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveAIConfig">保存配置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 个人信息 -->
          <div v-if="activeTab === 'user'" class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-6">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-[rgb(var(--color-text))] mb-2">个人信息</h2>
              <p class="text-[rgb(var(--color-text-muted))]">管理你的个人资料</p>
            </div>

            <el-form :model="userConfig" label-position="top" class="max-w-lg">
              <el-form-item label="头像">
                <div class="flex items-center gap-4">
                  <div class="w-20 h-20 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center text-white text-3xl font-bold">
                    {{ userConfig.name ? userConfig.name.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <el-button>更换头像</el-button>
                </div>
              </el-form-item>
              <el-form-item label="昵称">
                <el-input v-model="userConfig.name" placeholder="请输入昵称" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="userConfig.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="个人简介">
                <el-input
                  v-model="userConfig.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="介绍一下你自己..."
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveUserConfig">保存修改</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </ConsoleLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderOpened, CircleCheck, Delete } from '@element-plus/icons-vue'
import ThemeSwitcher from '~/components/ThemeSwitcher.vue'
import ConsoleLayout from '~/components/layout/ConsoleLayout.vue'
import { useLocalFS } from '~/composables/useLocalFS'
import { useFsStore } from '~/stores/fs'
import { useRepoStore, type RepoType } from '~/stores/repo'

const router = useRouter()
const activeTab = ref<'theme' | 'repos' | 'ai' | 'user'>('theme')
const localFS = useLocalFS()
const fsStore = useFsStore()
const repoStore = useRepoStore()

const navItems = [
  { id: 'theme' as const, label: '主题设置', icon: '🎨' },
  { id: 'repos' as const, label: '仓库配置', icon: '📦' },
  { id: 'ai' as const, label: 'AI 配置', icon: '🤖' },
  { id: 'user' as const, label: '个人信息', icon: '👤' }
]

// 获取本地仓库状态
const localRepo = computed(() => repoStore.getRepo('local'))

// 远程仓库列表（排除本地存储）
const remoteRepos = computed(() => repoStore.repos.filter(r => r.id !== 'local'))

const aiConfig = ref({
  provider: 'openai',
  apiKey: '',
  baseUrl: '',
  model: 'gpt-4o'
})

const userConfig = ref({
  name: '博客作者',
  email: 'author@example.com',
  bio: '热爱技术，喜欢分享'
})

const selectArticlesFolder = async () => {
  try {
    await localFS.selectArticlesDir()
    ElMessage.success('本地存储已授权')
  } catch (err) {
    console.error('选择文件夹失败:', err)
    if ((err as Error).name !== 'AbortError') {
      ElMessage.error('授权失败')
    }
  }
}

const clearArticles = () => {
  fsStore.clearArticlesDir()
  fsStore.clearMediaDir()
  ElMessage.info('已断开本地存储')
}

const setActiveRepo = (repoId: RepoType) => {
  repoStore.setActiveRepo(repoId)
  const repo = repoStore.getRepo(repoId)
  if (repo) {
    ElMessage.success(`已切换到 ${repo.name}`)
  }
}

const connectRepo = (repo: any) => {
  ElMessage.info(`正在连接 ${repo.name}...`)
  setTimeout(() => {
    repoStore.setRepoConnected(repo.id, true, {
      username: repo.id === 'github' ? 'github-user' : 'gitee-user',
      repo: repo.id === 'github' ? 'my-blog' : 'blog'
    })
    ElMessage.success(`${repo.name} 连接成功`)
  }, 1000)
}

const disconnectRepo = (repoId: RepoType) => {
  const repo = repoStore.getRepo(repoId)
  if (!repo) return

  ElMessageBox.confirm(`确定要断开 ${repo.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    repoStore.disconnectRepo(repoId)
    ElMessage.success(`${repo.name} 已断开`)
  }).catch(() => {})
}

const saveAIConfig = () => {
  console.log('保存 AI 配置:', aiConfig.value)
  ElMessage.success('AI 配置已保存')
}

const saveUserConfig = () => {
  console.log('保存用户配置:', userConfig.value)
  ElMessage.success('个人信息已保存')
}

onMounted(async () => {
  fsStore.init()
  repoStore.init()
  // 尝试验证当前权限状态并同步到 repoStore
  if (fsStore.articlesDirHandle) {
    await fsStore.verifyArticlesAccess()
  }
})
</script>
