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
              <FaIcon :icon="item.icon" class="text-xl" />
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
                        <FaIcon icon="circle-check" class="text-green-600" />
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
                    <div class="text-3xl"><FaIcon :icon="repo.icon" class="w-8 h-8" /></div>
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
                      <el-button size="small" type="danger" @click="handleDisconnectRepo(repo.id)">
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

    <!-- GitHub 连接对话框 -->
    <el-dialog
      v-model="githubConnectDialog.visible"
      title="连接 GitHub"
      width="500px"
      :close-on-click-modal="false"
    >
      <!-- 步骤 1: 输入 Token -->
      <div v-if="githubConnectDialog.step === 'token'" class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 class="font-medium text-blue-900 dark:text-blue-300 mb-2">如何获取 GitHub Token?</h4>
          <ol class="text-sm text-blue-800 dark:text-blue-400 list-decimal list-inside space-y-1">
            <li>访问 <a href="https://github.com/settings/tokens" target="_blank" class="underline">GitHub Settings → Tokens</a></li>
            <li>点击 "Generate new token (classic)"</li>
            <li>勾选 <code>repo</code> 权限</li>
            <li>生成并复制 Token</li>
          </ol>
        </div>

        <el-form label-position="top">
          <el-form-item label="GitHub Personal Access Token">
            <el-input
              v-model="githubConnectDialog.token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              show-password
              @keyup.enter="verifyGitHubToken"
            />
          </el-form-item>
        </el-form>

        <el-alert
          v-if="githubConnectDialog.error"
          :title="githubConnectDialog.error"
          type="error"
          :closable="false"
        />
      </div>

      <!-- 步骤 2: 选择仓库 -->
      <div v-else-if="githubConnectDialog.step === 'repo'" class="space-y-4">
        <p class="text-[rgb(var(--color-text-muted))]">选择要存储文章的仓库：</p>

        <el-select
          v-model="githubConnectDialog.selectedRepo"
          placeholder="选择仓库"
          class="w-full"
          filterable
        >
          <el-option
            v-for="repo in githubConnectDialog.repos"
            :key="repo.full_name"
            :label="repo.full_name"
            :value="repo.full_name"
          >
            <div class="flex items-center justify-between">
              <span>{{ repo.full_name }}</span>
              <span v-if="repo.description" class="text-xs text-gray-400 truncate max-w-[200px]">
                {{ repo.description }}
              </span>
            </div>
          </el-option>
        </el-select>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p class="text-sm text-yellow-800 dark:text-yellow-300">
            <el-icon class="mr-1"><Warning /></el-icon>
            如果没有仓库，请先在 GitHub 上创建一个
          </p>
        </div>
      </div>

      <!-- 步骤 3: 配置路径 -->
      <div v-else-if="githubConnectDialog.step === 'path'" class="space-y-4">
        <p class="text-[rgb(var(--color-text-muted))]">配置内容存储路径：</p>

        <el-form label-position="top">
          <el-form-item label="基础路径 (可选)">
            <el-input
              v-model="githubConnectDialog.basePath"
              placeholder="例如: content 或 blog"
            />
            <template #description>
              <span class="text-xs text-gray-400">
                留空则存储在仓库根目录，文章将保存在 {basePath}/articles 目录下
              </span>
            </template>
          </el-form-item>

          <el-form-item label="分支">
            <el-input
              v-model="githubConnectDialog.branch"
              placeholder="main"
            />
          </el-form-item>
        </el-form>

        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p class="text-sm text-blue-800 dark:text-blue-300">
            <el-icon class="mr-1"><InfoFilled /></el-icon>
            配置信息将保存在浏览器本地存储中
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <div>
            <el-button
              v-if="githubConnectDialog.step !== 'token'"
              @click="githubConnectDialog.step = githubConnectDialog.step === 'repo' ? 'token' : 'repo'"
            >
              上一步
            </el-button>
          </div>
          <div class="space-x-2">
            <el-button @click="githubConnectDialog.visible = false">取消</el-button>

            <!-- 步骤 1: 验证 Token -->
            <el-button
              v-if="githubConnectDialog.step === 'token'"
              type="primary"
              :loading="githubConnectDialog.loading"
              @click="verifyGitHubToken"
            >
              验证并继续
            </el-button>

            <!-- 步骤 2: 选择仓库 -->
            <el-button
              v-else-if="githubConnectDialog.step === 'repo'"
              type="primary"
              @click="goToPathStep"
            >
              下一步
            </el-button>

            <!-- 步骤 3: 完成连接 -->
            <el-button
              v-else-if="githubConnectDialog.step === 'path'"
              type="primary"
              :loading="githubConnectDialog.loading"
              @click="completeGitHubConnect"
            >
              完成连接
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- Gitee 连接对话框 -->
    <el-dialog
      v-model="giteeConnectDialog.visible"
      title="连接 Gitee"
      width="500px"
      :close-on-click-modal="false"
    >
      <!-- 步骤 1: 输入 Token -->
      <div v-if="giteeConnectDialog.step === 'token'" class="space-y-4">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 class="font-medium text-red-900 dark:text-red-300 mb-2">如何获取 Gitee Token?</h4>
          <ol class="text-sm text-red-800 dark:text-red-400 list-decimal list-inside space-y-1">
            <li>访问 <a href="https://gitee.com/profile/personal_access_tokens" target="_blank" class="underline">Gitee 设置 → 私人令牌</a></li>
            <li>点击 "生成新令牌"</li>
            <li>勾选 <code>projects</code> 权限</li>
            <li>生成并复制 Token</li>
          </ol>
        </div>

        <el-form label-position="top">
          <el-form-item label="Gitee 私人令牌 (Personal Access Token)">
            <el-input
              v-model="giteeConnectDialog.token"
              type="password"
              placeholder="例如: xxxxxxxxxxxxxxx"
              show-password
              @keyup.enter="verifyGiteeToken"
            />
          </el-form-item>
        </el-form>

        <el-alert
          v-if="giteeConnectDialog.error"
          :title="giteeConnectDialog.error"
          type="error"
          :closable="false"
        />
      </div>

      <!-- 步骤 2: 选择仓库 -->
      <div v-else-if="giteeConnectDialog.step === 'repo'" class="space-y-4">
        <p class="text-[rgb(var(--color-text-muted))]">选择要存储文章的仓库：</p>

        <el-select
          v-model="giteeConnectDialog.selectedRepo"
          placeholder="选择仓库"
          class="w-full"
          filterable
        >
          <el-option
            v-for="repo in giteeConnectDialog.repos"
            :key="repo.full_name"
            :label="repo.full_name"
            :value="repo.full_name"
          >
            <div class="flex items-center justify-between">
              <span>{{ repo.full_name }}</span>
              <span v-if="repo.description" class="text-xs text-gray-400 truncate max-w-[200px]">
                {{ repo.description }}
              </span>
            </div>
          </el-option>
        </el-select>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p class="text-sm text-yellow-800 dark:text-yellow-300">
            <el-icon class="mr-1"><Warning /></el-icon>
            如果没有仓库，请先在 Gitee 上创建一个
          </p>
        </div>
      </div>

      <!-- 步骤 3: 配置路径 -->
      <div v-else-if="giteeConnectDialog.step === 'path'" class="space-y-4">
        <p class="text-[rgb(var(--color-text-muted))]">配置内容存储路径：</p>

        <el-form label-position="top">
          <el-form-item label="基础路径 (可选)">
            <el-input
              v-model="giteeConnectDialog.basePath"
              placeholder="例如: content 或 blog"
            />
            <template #description>
              <span class="text-xs text-gray-400">
                留空则存储在仓库根目录，文章将保存在 {basePath}/articles 目录下
              </span>
            </template>
          </el-form-item>

          <el-form-item label="分支">
            <el-input
              v-model="giteeConnectDialog.branch"
              placeholder="master"
            />
          </el-form-item>
        </el-form>

        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p class="text-sm text-blue-800 dark:text-blue-300">
            <el-icon class="mr-1"><InfoFilled /></el-icon>
            配置信息将保存在浏览器本地存储中
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <div>
            <el-button
              v-if="giteeConnectDialog.step !== 'token'"
              @click="giteeConnectDialog.step = giteeConnectDialog.step === 'repo' ? 'token' : 'repo'"
            >
              上一步
            </el-button>
          </div>
          <div class="space-x-2">
            <el-button @click="giteeConnectDialog.visible = false">取消</el-button>

            <!-- 步骤 1: 验证 Token -->
            <el-button
              v-if="giteeConnectDialog.step === 'token'"
              type="primary"
              :loading="giteeConnectDialog.loading"
              @click="verifyGiteeToken"
            >
              验证并继续
            </el-button>

            <!-- 步骤 2: 选择仓库 -->
            <el-button
              v-else-if="giteeConnectDialog.step === 'repo'"
              type="primary"
              @click="goToGiteePathStep"
            >
              下一步
            </el-button>

            <!-- 步骤 3: 完成连接 -->
            <el-button
              v-else-if="giteeConnectDialog.step === 'path'"
              type="primary"
              :loading="giteeConnectDialog.loading"
              @click="completeGiteeConnect"
            >
              完成连接
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </ConsoleLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderOpened, CircleCheck, Delete, Warning, InfoFilled } from '@element-plus/icons-vue'
import ThemeSwitcher from '~/components/ThemeSwitcher.vue'
import ConsoleLayout from '~/components/layout/ConsoleLayout.vue'
import { useLocalFS } from '~/composables/useLocalFS'
import { useFsStore } from '~/stores/fs'
import { useRepoStore, type RepoType } from '~/stores/repo'
import { useGitHubFS, type GitHubConfig } from '~/composables/useGitHubFS'

const route = useRoute()
const router = useRouter()
const activeTab = ref<'theme' | 'repos' | 'ai' | 'user'>('theme')
const localFS = useLocalFS()
const fsStore = useFsStore()
const repoStore = useRepoStore()


const navItems = [
  { id: 'theme' as const, label: '主题设置', icon: 'palette' },
  { id: 'repos' as const, label: '仓库配置', icon: 'box' },
  { id: 'ai' as const, label: 'AI 配置', icon: 'robot' },
  { id: 'user' as const, label: '个人信息', icon: 'user' }
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

// GitHub 连接对话框
const githubConnectDialog = ref({
  visible: false,
  step: 'token' as 'token' | 'repo' | 'path', // token: 输入token, repo: 选择仓库, path: 配置路径
  token: '',
  loading: false,
  error: '',
  repos: [] as Array<{ name: string; full_name: string; description: string }>,
  selectedRepo: '',
  basePath: '',
  branch: 'main'
})

// 验证 GitHub Token
const verifyGitHubToken = async () => {
  const { token } = githubConnectDialog.value
  if (!token.trim()) {
    githubConnectDialog.value.error = '请输入 GitHub Token'
    return
  }

  githubConnectDialog.value.loading = true
  githubConnectDialog.value.error = ''

  try {
    // 验证 token 并获取用户信息
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Accept': 'application/vnd.github+json'
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token 无效或已过期')
      }
      throw new Error(`验证失败: ${response.status}`)
    }

    const userData = await response.json()

    // 获取用户仓库列表
    const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Accept': 'application/vnd.github+json'
      }
    })

    if (!reposResponse.ok) {
      throw new Error('获取仓库列表失败')
    }

    const repos = await reposResponse.json()

    githubConnectDialog.value.repos = repos.map((r: any) => ({
      name: r.name,
      full_name: r.full_name,
      description: r.description || ''
    }))

    // 进入仓库选择步骤
    githubConnectDialog.value.step = 'repo'
    ElMessage.success(`验证成功，欢迎 ${userData.login}`)
  } catch (err) {
    githubConnectDialog.value.error = err instanceof Error ? err.message : '验证失败'
  } finally {
    githubConnectDialog.value.loading = false
  }
}

// 进入路径配置步骤
const goToPathStep = () => {
  if (!githubConnectDialog.value.selectedRepo) {
    ElMessage.warning('请选择仓库')
    return
  }
  githubConnectDialog.value.step = 'path'
}

// 完成 GitHub 连接
const completeGitHubConnect = async () => {
  const { token, selectedRepo, basePath, branch } = githubConnectDialog.value

  if (!selectedRepo) {
    ElMessage.warning('请选择仓库')
    return
  }

  githubConnectDialog.value.loading = true

  try {
    // 解析仓库名
    const [username, repo] = selectedRepo.split('/')

    if (!username || !repo) {
      throw new Error('仓库格式无效')
    }

    // 测试仓库访问权限
    const testResponse = await fetch(`https://api.github.com/repos/${selectedRepo}/contents`, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Accept': 'application/vnd.github+json'
      }
    })

    if (!testResponse.ok) {
      if (testResponse.status === 404) {
        throw new Error('仓库不存在或无法访问')
      }
      if (testResponse.status === 403) {
        throw new Error('没有该仓库的写入权限')
      }
      throw new Error(`访问仓库失败: ${testResponse.status}`)
    }

    // 保存配置到 localStorage
    const githubConfig = {
      token: token.trim(),
      username,
      repo,
      branch: branch || 'main',
      basePath: basePath.trim()
    }

    localStorage.setItem('githubConfig', JSON.stringify(githubConfig))

    // 更新 repoStore
    repoStore.setRepoConnected('github', true, {
      username,
      repo,
      basePath: basePath.trim(),
      branch: branch || 'main'
    })

    // 如果当前没有激活的仓库，设置为当前
    if (!repoStore.currentRepo?.connected) {
      repoStore.setActiveRepo('github')
    }

    // 关闭对话框
    githubConnectDialog.value.visible = false
    githubConnectDialog.value.step = 'token'
    githubConnectDialog.value.token = ''
    githubConnectDialog.value.selectedRepo = ''
    githubConnectDialog.value.basePath = ''
    githubConnectDialog.value.repos = []

    ElMessage.success('GitHub 连接成功')
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '连接失败')
  } finally {
    githubConnectDialog.value.loading = false
  }
}

// 打开连接对话框
// Gitee 连接对话框
const giteeConnectDialog = ref({
  visible: false,
  step: 'token' as 'token' | 'repo' | 'path',
  token: '',
  loading: false,
  error: '',
  repos: [] as Array<{ name: string; full_name: string; description: string }>,
  selectedRepo: '',
  basePath: '',
  branch: 'master'
})

// 验证 Gitee Token
const verifyGiteeToken = async () => {
  const { token } = giteeConnectDialog.value
  if (!token.trim()) {
    giteeConnectDialog.value.error = '请输入 Gitee Token'
    return
  }

  giteeConnectDialog.value.loading = true
  giteeConnectDialog.value.error = ''

  try {
    // 验证 token 并获取用户信息
    const response = await fetch('https://gitee.com/api/v5/user', {
      headers: {
        'Authorization': `Bearer ${token.trim()}`
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token 无效或已过期')
      }
      throw new Error(`验证失败: ${response.status}`)
    }

    const userData = await response.json()

    // 获取用户仓库列表
    const reposResponse = await fetch(`https://gitee.com/api/v5/users/${userData.login}/repos?sort=updated&per_page=100`, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`
      }
    })

    if (!reposResponse.ok) {
      throw new Error('获取仓库列表失败')
    }

    const repos = await reposResponse.json()

    giteeConnectDialog.value.repos = repos.map((r: any) => ({
      name: r.name,
      full_name: r.full_name,
      description: r.description || ''
    }))

    // 进入仓库选择步骤
    giteeConnectDialog.value.step = 'repo'
    ElMessage.success(`验证成功，欢迎 ${userData.login}`)
  } catch (err) {
    giteeConnectDialog.value.error = err instanceof Error ? err.message : '验证失败'
  } finally {
    giteeConnectDialog.value.loading = false
  }
}

// 进入路径配置步骤
const goToGiteePathStep = () => {
  if (!giteeConnectDialog.value.selectedRepo) {
    ElMessage.warning('请选择仓库')
    return
  }
  giteeConnectDialog.value.step = 'path'
}

// 完成 Gitee 连接
const completeGiteeConnect = async () => {
  const { token, selectedRepo, basePath, branch } = giteeConnectDialog.value

  if (!selectedRepo) {
    ElMessage.warning('请选择仓库')
    return
  }

  giteeConnectDialog.value.loading = true

  try {
    // 解析仓库名
    const [username, repo] = selectedRepo.split('/')

    if (!username || !repo) {
      throw new Error('仓库格式无效')
    }

    // 测试仓库访问权限
    const testResponse = await fetch(`https://gitee.com/api/v5/repos/${selectedRepo}/contents`, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`
      }
    })

    if (!testResponse.ok) {
      if (testResponse.status === 404) {
        throw new Error('仓库不存在或无法访问')
      }
      if (testResponse.status === 403) {
        throw new Error('没有该仓库的写入权限')
      }
      throw new Error(`访问仓库失败: ${testResponse.status}`)
    }

    // 保存配置到 localStorage
    const giteeConfig = {
      token: token.trim(),
      username,
      repo,
      branch: branch || 'master',
      basePath: basePath.trim()
    }

    localStorage.setItem('giteeConfig', JSON.stringify(giteeConfig))

    // 更新 repoStore
    repoStore.setRepoConnected('gitee', true, {
      username,
      repo,
      basePath: basePath.trim(),
      branch: branch || 'master'
    })

    // 如果当前没有激活的仓库，设置为当前
    if (!repoStore.currentRepo?.connected) {
      repoStore.setActiveRepo('gitee')
    }

    // 关闭对话框
    giteeConnectDialog.value.visible = false
    giteeConnectDialog.value.step = 'token'
    giteeConnectDialog.value.token = ''
    giteeConnectDialog.value.selectedRepo = ''
    giteeConnectDialog.value.basePath = ''
    giteeConnectDialog.value.repos = []

    ElMessage.success('Gitee 连接成功')
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '连接失败')
  } finally {
    giteeConnectDialog.value.loading = false
  }
}

// 断开连接（包装 repoStore 的方法，添加 localStorage 清理）
const handleDisconnectRepo = (repoId: RepoType) => {
  const repo = repoStore.getRepo(repoId)
  if (!repo) return

  ElMessageBox.confirm(`确定要断开 ${repo.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 清除 localStorage 中的配置
    if (repoId === 'github') {
      localStorage.removeItem('githubConfig')
    } else if (repoId === 'gitee') {
      localStorage.removeItem('giteeConfig')
    }

    repoStore.disconnectRepo(repoId)
    ElMessage.success(`${repo.name} 已断开`)
  }).catch(() => {})
}

// 打开连接对话框
const connectRepo = (repo: any) => {
  if (repo.id === 'github') {
    githubConnectDialog.value.visible = true
    githubConnectDialog.value.step = 'token'
    githubConnectDialog.value.error = ''
  } else if (repo.id === 'gitee') {
    giteeConnectDialog.value.visible = true
    giteeConnectDialog.value.step = 'token'
    giteeConnectDialog.value.error = ''
  }
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

  // 从 URL 参数初始化标签
  const tabFromQuery = route.query.tab as string
  if (tabFromQuery && ['theme', 'repos', 'ai', 'user'].includes(tabFromQuery)) {
    activeTab.value = tabFromQuery as any
  }

  // 尝试验证当前权限状态并同步到 repoStore
  if (fsStore.articlesDirHandle) {
    await fsStore.verifyArticlesAccess()
  }
})

// 监听标签变化，更新 URL
watch(activeTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } })
})
</script>
