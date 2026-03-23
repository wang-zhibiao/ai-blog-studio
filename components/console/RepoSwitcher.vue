<template>
  <el-select v-model="selectedRepo" @change="handleRepoChange" class="w-[160px]">
    <el-option
      v-for="repo in repoStore.repos"
      :key="repo.id"
      :value="repo.id"
      :label="repo.name"
    >
      <div class="flex items-center gap-2">
        <span>{{ repo.icon }}</span>
        <span class="flex-1">{{ repo.name }}</span>
        <span v-if="repo.connected" class="text-xs text-green-500">●</span>
        <span v-else class="text-xs text-gray-400">○</span>
      </div>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRepoStore, type RepoType } from '~/stores/repo'

const repoStore = useRepoStore()

const selectedRepo = computed<RepoType>({
  get: () => repoStore.currentRepo.id,
  set: (val) => repoStore.setActiveRepo(val)
})

const handleRepoChange = (repoId: RepoType) => {
  const repo = repoStore.getRepo(repoId)
  if (repo) {
    ElMessage.success(`已切换到 ${repo.name}`)
  }
}
</script>
