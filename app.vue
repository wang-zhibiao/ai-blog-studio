<template>
  <ErrorBoundary>
    <NuxtPage />
  </ErrorBoundary>
</template>

<script setup lang="ts">
import ErrorBoundary from '~/components/common/ErrorBoundary.vue'
import { useStorageStore } from '~/stores/storage'

onMounted(() => {
  // 主题初始化现在由 plugins/theme.client.ts 插件处理
  // Pinia persist 会自动恢复持久化状态

  const storageStore = useStorageStore()
  storageStore.init()
})
</script>
