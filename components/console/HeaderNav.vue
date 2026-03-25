<template>
  <nav class="header-nav">
    <NuxtLink
      v-for="item in navItems"
      :key="item.id"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.id) }"
    >
      <FaIcon :icon="item.icon" class="nav-icon" />
      <span class="nav-label">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const navItems = [
  { id: 'overview', label: '概览', icon: 'house', path: '/console' },
  { id: 'articles', label: '文章', icon: 'file-lines', path: '/console/articles' },
  { id: 'categories', label: '分类标签', icon: 'tags', path: '/console/categories' },
  { id: 'media', label: '媒体库', icon: 'image', path: '/console/media' },
  { id: 'settings', label: '设置', icon: 'gear', path: '/console/settings' }
]

const activeMenu = computed(() => {
  if (route.path === '/console') return 'overview'
  if (route.path === '/console/articles') return 'articles'
  if (route.path === '/console/categories') return 'categories'
  if (route.path === '/console/media') return 'media'
  if (route.path === '/console/settings') return 'settings'
  if (route.path.startsWith('/console/editor')) return 'articles'
  return 'overview'
})

const isActive = (id: string) => activeMenu.value === id
</script>

<style scoped>
.header-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 64px;
  background: transparent;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: rgb(var(--color-text-muted));
  transition: all 0.2s ease;
  height: 40px;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(var(--color-primary), 0.08);
  color: rgb(var(--color-text));
}

.nav-item.active {
  background: rgba(var(--color-primary), 0.15);
  color: rgb(var(--color-primary));
  font-weight: 500;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  font-size: 14px;
  line-height: 1;
}
</style>
