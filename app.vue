<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { useFsStore } from '~/stores/fs'
import { useRepoStore } from '~/stores/repo'

onMounted(() => {
  const themeStore = useThemeStore()
  themeStore.initTheme()

  const repoStore = useRepoStore()
  repoStore.init()

  const fsStore = useFsStore()
  fsStore.init() // fsStore.init() 会调用 updateLocalRepoStatus() 同步状态到 repoStore
})
</script>
