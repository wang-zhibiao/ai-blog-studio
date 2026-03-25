<template>
  <el-select v-model="selectedRepo" @change="handleRepoChange" class="w-[160px]">
    <el-option
      v-for="repo in repoStore.repos"
      :key="repo.id"
      :value="repo.id"
      :label="repo.name"
    >
      <div class="flex items-center gap-2">
        <span class="flex items-center">
          <svg v-if="repo.type === 'github'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-[#6e7681]"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          <svg v-else-if="repo.type === 'gitee'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-[#c71d23]"><path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.593H9.778c-.982 0-1.778.796-1.778 1.778v5.63c0 .982.796 1.778 1.778 1.778h8.296c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.593-.593h-5.63a.593.593 0 0 1-.593-.593v-1.482c0-.327.265-.592.593-.592h6.815c.982 0 1.778-.796 1.778-1.779V6.903c0-.983-.796-1.778-1.778-1.778h-7.41z"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
        </span>
        <span class="flex-1">{{ repo.name }}</span>
        <span v-if="repo.connected" class="text-xs text-green-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
        </span>
        <span v-else class="text-xs text-gray-400 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" class="opacity-50"><circle cx="12" cy="12" r="10"/></svg>
        </span>
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
