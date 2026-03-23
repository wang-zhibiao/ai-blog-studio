<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center text-white font-bold text-base">
        {{ userInitial }}
      </div>
      <span class="text-[rgb(var(--color-text))] font-medium hidden sm:block">
        {{ userName }}
      </span>
      <span class="text-[rgb(var(--color-text-muted))]">▼</span>
    </div>
    <template #dropdown>
      <el-dropdown-menu class="min-w-[220px]">
        <div class="px-4 py-3 border-b border-[rgb(var(--color-border))]">
          <div class="font-semibold text-[rgb(var(--color-text))]">{{ userName }}</div>
          <div class="text-sm text-[rgb(var(--color-text-muted))]">{{ userEmail }}</div>
        </div>
        <div class="px-2 py-1">
          <div class="text-xs text-[rgb(var(--color-text-muted))] px-2 py-1">当前仓库</div>
        </div>
        <el-dropdown-item
          v-for="repo in repoStore.repos"
          :key="repo.id"
          :command="repo.id"
          class="flex items-center gap-2"
          :class="{ 'bg-[rgba(var(--color-primary),0.1)]': repo.active }"
        >
          <span>{{ repo.icon }}</span>
          <span class="flex-1">{{ repo.name }}</span>
          <span v-if="repo.active" class="text-xs text-[rgb(var(--color-primary))]">✓</span>
          <span v-if="repo.connected" class="text-xs text-green-500">已连接</span>
        </el-dropdown-item>
        <el-dropdown-item divided command="settings" class="flex items-center gap-2">
          <span>⚙️</span>
          <span>仓库设置</span>
        </el-dropdown-item>
        <el-dropdown-item divided command="logout" class="text-red-500">
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useRepoStore, type RepoType } from '~/stores/repo'

const router = useRouter()
const repoStore = useRepoStore()

const userName = ref('博客作者')
const userEmail = ref('author@example.com')

const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessage.info('退出登录功能开发中...')
  } else if (command === 'settings') {
    router.push('/console/settings')
  } else {
    const repoId = command as RepoType
    const repo = repoStore.getRepo(repoId)
    if (repo) {
      repoStore.setActiveRepo(repoId)
      ElMessage.success(`已切换到 ${repo.name}`)
    }
  }
}
</script>
