<template>
  <div class="relative">
    <!-- 触发按钮 -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgb(var(--color-surface-light))] border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))] hover:shadow-sm transition-all duration-200 cursor-pointer"
      :class="{ 'ring-2 ring-[rgb(var(--color-primary))] ring-opacity-20': isOpen }"
    >
      <!-- 当前仓库图标 -->
      <span class="flex items-center">
        <FaIcon
          v-if="currentRepo?.id === 'github'"
          :icon="['fab', 'github']"
          class="text-[#6e7681] text-base"
        />
        <FaIcon
          v-else-if="currentRepo?.id === 'gitee'"
          :icon="['fab', 'gitee']"
          class="text-[#c71d23] text-base"
        />
        <FaIcon
          v-else
          icon="folder"
          class="text-[rgb(var(--color-primary))] text-base"
        />
      </span>

      <!-- 当前仓库名称 -->
      <span class="text-sm font-medium text-[rgb(var(--color-text))]">{{ currentRepo?.name }}</span>

      <!-- 连接状态指示器 -->
      <span
        class="w-2 h-2 rounded-full"
        :class="currentRepo?.connected ? 'bg-green-500' : 'bg-gray-400'"
      ></span>

      <!-- 下拉箭头 -->
      <FaIcon
        icon="angle-down"
        class="text-[rgb(var(--color-text-muted))] text-sm transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- 下拉菜单 -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] shadow-lg shadow-black/10 z-50 overflow-hidden"
      >
        <!-- 菜单标题 -->
        <div class="px-3 py-2 border-b border-[rgb(var(--color-border))]">
          <span class="text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wide">选择仓库</span>
        </div>

        <!-- 仓库列表 -->
        <div class="py-1">
          <button
            v-for="repo in repoStore.repos"
            :key="repo.id"
            @click="selectRepo(repo.id)"
            class="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[rgb(var(--color-surface-light))] transition-colors cursor-pointer"
            :class="{ 'bg-[rgb(var(--color-primary))]/10': currentRepo?.id === repo.id }"
          >
            <!-- 仓库图标 -->
            <span class="flex items-center">
              <FaIcon
                v-if="repo.id === 'github'"
                :icon="['fab', 'github']"
                class="text-[#6e7681] text-lg"
              />
              <FaIcon
                v-else-if="repo.id === 'gitee'"
                :icon="['fab', 'gitee']"
                class="text-[#c71d23] text-lg"
              />
              <FaIcon
                v-else
                icon="folder"
                class="text-[rgb(var(--color-primary))] text-lg"
              />
            </span>

            <!-- 仓库名称 -->
            <span class="flex-1 text-sm text-[rgb(var(--color-text))] text-left">{{ repo.name }}</span>

            <!-- 选中标记 -->
            <FaIcon
              v-if="currentRepo?.id === repo.id"
              icon="check"
              class="text-[rgb(var(--color-primary))] text-sm"
            />
          </button>
        </div>
      </div>
    </Transition>

    <!-- 点击外部关闭 -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRepoStore, type RepoType } from '~/stores/repo'

const repoStore = useRepoStore()
const isOpen = ref(false)

const currentRepo = computed(() => repoStore.currentRepo)

const selectRepo = (repoId: RepoType) => {
  repoStore.setActiveRepo(repoId)
  const repo = repoStore.getRepo(repoId)
  if (repo) {
    ElMessage.success(`已切换到 ${repo.name}`)
  }
  isOpen.value = false
}
</script>
