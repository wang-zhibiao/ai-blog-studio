<template>
  <el-menu
    :default-active="activeMenu"
    mode="horizontal"
    :ellipsis="false"
    class="border-none bg-transparent"
    active-text-color="rgb(var(--color-primary))"
    text-color="rgb(var(--color-text-muted))"
  >
    <el-menu-item index="overview">
      <NuxtLink to="/console" class="flex items-center gap-2">
        <span>📊</span>
        <span>概览</span>
      </NuxtLink>
    </el-menu-item>
    <el-menu-item index="articles">
      <NuxtLink to="/console/articles" class="flex items-center gap-2">
        <span>📝</span>
        <span>文章</span>
      </NuxtLink>
    </el-menu-item>
    <el-menu-item index="categories">
      <NuxtLink to="/console/categories" class="flex items-center gap-2">
        <span>🏷️</span>
        <span>分类标签</span>
      </NuxtLink>
    </el-menu-item>
    <el-menu-item index="media">
      <NuxtLink to="/console/media" class="flex items-center gap-2">
        <span>🖼️</span>
        <span>媒体库</span>
      </NuxtLink>
    </el-menu-item>
    <el-menu-item index="settings">
      <NuxtLink to="/console/settings" class="flex items-center gap-2">
        <span>⚙️</span>
        <span>设置</span>
      </NuxtLink>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()

const activeMenu = computed(() => {
  if (route.path === '/console') return 'overview'
  if (route.path === '/console/articles') return 'articles'
  if (route.path === '/console/categories') return 'categories'
  if (route.path === '/console/media') return 'media'
  if (route.path === '/console/settings') return 'settings'
  if (route.path.startsWith('/console/editor')) return 'articles'
  return 'overview'
})
</script>

<style scoped>
.el-menu-item {
  border-bottom: none !important;
}
.el-menu-item a {
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  text-decoration: none;
}
</style>
