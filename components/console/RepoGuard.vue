<template>
  <div class="repo-guard">
    <slot v-if="hasAccess" />
    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <div class="text-6xl mb-4"><FaIcon icon="folder-open" class="text-6xl text-[rgb(var(--color-text-muted))]" /></div>
      <h3 class="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">需要配置仓库</h3>
      <p class="text-[rgb(var(--color-text-muted))] mb-6">请先在设置中配置本地文件夹</p>
      <NuxtLink to="/console/settings?tab=repos">
        <el-button type="primary">
          <el-icon><Setting /></el-icon>
          去配置仓库
        </el-button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { useRepoStore } from '~/stores/repo'

const repoStore = useRepoStore()
const hasAccess = computed(() => {
  const localRepo = repoStore.getRepo('local')
  return localRepo?.connected || false
})
</script>
