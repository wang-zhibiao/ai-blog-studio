<template>
  <div class="min-h-screen flex flex-col bg-[rgb(var(--color-background))]">
    <!-- 顶部 Header -->
    <header class="h-16 flex items-center justify-between px-6 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] sticky top-0 z-50">
      <div class="flex items-center gap-8">
        <!-- Logo -->
        <NuxtLink to="/console" class="flex items-center gap-2 text-lg font-bold text-[rgb(var(--color-text))] hover:opacity-80 transition-opacity">
          <span class="text-2xl">✨</span>
          <span class="bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] bg-clip-text text-transparent">
            AI Blog Studio
          </span>
        </NuxtLink>

        <!-- 导航菜单 -->
        <HeaderNav />
      </div>

      <div class="flex items-center gap-4">
        <!-- 用户下拉 -->
        <UserDropdown />
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-auto">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import HeaderNav from '~/components/console/HeaderNav.vue'
import UserDropdown from '~/components/console/UserDropdown.vue'
import RepoSwitcher from '~/components/console/RepoSwitcher.vue'
</script>
