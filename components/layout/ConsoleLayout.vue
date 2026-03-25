<template>
  <div class="min-h-screen flex flex-col bg-[rgb(var(--color-background))]">
    <!-- 顶部 Header -->
    <header class="h-16 flex items-center justify-between px-6 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] sticky top-0 z-50">
      <div class="flex items-center gap-8">
        <!-- Logo -->
        <NuxtLink to="/console" class="flex items-center gap-2 text-lg font-bold text-[rgb(var(--color-text))] hover:opacity-80 transition-opacity cursor-pointer">
          <span class="text-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-[rgb(var(--color-primary))]"><path d="M12 3c-1.5 0-2.7.4-3.6 1.1-.9.7-1.4 1.7-1.4 2.9 0 1.2.4 2.1 1.1 2.8.3.3.7.6 1.2.8l-1.1 4.3c-.1.5.3.9.8.9h5.4c.5 0 .9-.4.8-.9l-1.1-4.3c.5-.2.9-.5 1.2-.8.7-.7 1.1-1.6 1.1-2.8 0-1.2-.5-2.2-1.4-2.9-.9-.7-2.1-1.1-3.6-1.1z"/><path d="M6 17v2"/><path d="M18 17v2"/></svg>
          </span>
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
