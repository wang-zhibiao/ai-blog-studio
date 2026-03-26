<template>
  <div class="theme-switcher">
    <div class="mode-switcher">
      <button
        class="mode-btn"
        :class="{ active: currentMode === 'dark' }"
        @click="setThemeMode('dark')"
        title="深色模式"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      </button>
      <button
        class="mode-btn"
        :class="{ active: currentMode === 'light' }"
        @click="setThemeMode('light')"
        title="浅色模式"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      </button>
    </div>
    <div class="color-switcher">
      <button
        v-for="color in themeColors"
        :key="color"
        class="color-btn"
        :class="{ active: currentColor === color }"
        @click="setThemeColor(color)"
        :title="getColorName(color)"
      >
        <span class="color-preview" :style="{ background: getColorPreview(color) }"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore, type ThemeColor, type ThemeMode } from '../stores/theme'

const themeStore = useThemeStore()

// 使用 storeToRefs 保持响应式
const { currentColor, currentMode, isInitialized } = storeToRefs(themeStore)

const themeColors = computed(() => Object.keys(themeStore.fullThemeSchemes) as ThemeColor[])

// 确保组件挂载时主题已初始化
// 注意：每次挂载都调用 initTheme，确保页面刷新后能正确恢复主题
onMounted(() => {
  themeStore.initTheme()
})

const getColorPreview = (color: ThemeColor) => {
  const colors = themeStore.fullThemeSchemes[color][currentMode.value]
  return `rgb(${colors.primary})`
}

const getColorName = (color: ThemeColor) => {
  const names: Record<ThemeColor, string> = {
    purple: '紫色主题',
    blue: '蓝色主题',
    green: '绿色主题',
    orange: '橙色主题',
    pink: '粉色主题',
    cyan: '青色主题',
    red: '红色主题',
    indigo: '靛蓝主题'
  }
  return names[color]
}

const setThemeColor = (color: ThemeColor) => {
  themeStore.setThemeColor(color)
}

const setThemeMode = (mode: ThemeMode) => {
  themeStore.setThemeMode(mode)
}
</script>

<style scoped>
.theme-switcher {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgb(var(--color-surface));
  border: 1px solid rgb(var(--color-border));
  border-radius: 12px;
}

.mode-switcher {
  display: flex;
  gap: 6px;
}

.mode-btn {
  flex: 1;
  height: 32px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--color-surface-light));
  font-size: 16px;
}

.mode-btn:hover {
  transform: scale(1.02);
}

.mode-btn.active {
  border-color: rgb(var(--color-primary));
  background: rgba(var(--color-primary), 0.15);
}

.color-switcher {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.color-btn {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--color-surface-light));
  padding: 3px;
}

.color-btn:hover {
  transform: scale(1.05);
}

.color-btn.active {
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 2px rgb(var(--color-surface)), 0 0 0 3px rgb(var(--color-primary));
}

.color-preview {
  width: 100%;
  height: 100%;
  border-radius: 5px;
}
</style>
