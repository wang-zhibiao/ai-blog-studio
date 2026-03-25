<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center text-white font-bold text-base">
        {{ userInitial }}
      </div>
      <span class="text-[rgb(var(--color-text))] font-medium hidden sm:block">
        {{ userName }}
      </span>
      <span class="text-[rgb(var(--color-text-muted))]">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </span>
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
          <FaIcon :icon="repo.icon" class="text-xl" />
          <span class="flex-1">{{ repo.name }}</span>
          <span v-if="repo.active" class="text-xs text-[rgb(var(--color-primary))]">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span v-if="repo.connected" class="text-xs text-green-500">已连接</span>
        </el-dropdown-item>
        <el-dropdown-item divided command="settings" class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .22 2.43l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.22 2.43l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.22-2.43l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .22-2.43l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
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
