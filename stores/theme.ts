import { defineStore } from 'pinia'
import type { ThemeColor, ThemeMode, FullThemeColors } from '~/types'

export type { ThemeColor, ThemeMode, FullThemeColors } from '~/types'

// 深色模式配色基础
const darkBase = {
  background: '15 23 42',
  surface: '30 41 59',
  surfaceLight: '51 65 85',
  text: '248 250 252',
  textMuted: '148 163 184',
  textInverse: '15 23 42',
  border: '51 65 85',
  borderLight: '71 85 105'
}

// 浅色模式配色基础
const lightBase = {
  background: '248 250 252',
  surface: '255 255 255',
  surfaceLight: '241 245 249',
  text: '15 23 42',
  textMuted: '100 116 139',
  textInverse: '248 250 252',
  border: '226 232 240',
  borderLight: '241 245 249'
}

// 主题配色方案
const colorSchemes = {
  purple: {
    primary: '99 102 241',
    primaryDark: '79 70 229',
    secondary: '139 92 246',
    accent: '236 72 153',
    success: '16 185 129',
    warning: '245 158 11',
    error: '239 68 68',
    info: '59 130 246'
  },
  blue: {
    primary: '59 130 246',
    primaryDark: '37 99 235',
    secondary: '14 165 233',
    accent: '6 182 212',
    success: '16 185 129',
    warning: '245 158 11',
    error: '239 68 68',
    info: '99 102 241'
  },
  green: {
    primary: '16 185 129',
    primaryDark: '5 150 105',
    secondary: '20 184 166',
    accent: '34 211 209',
    success: '22 163 74',
    warning: '245 158 11',
    error: '239 68 68',
    info: '59 130 246'
  },
  orange: {
    primary: '245 158 11',
    primaryDark: '217 119 6',
    secondary: '249 115 22',
    accent: '251 146 60',
    success: '16 185 129',
    warning: '234 88 12',
    error: '239 68 68',
    info: '59 130 246'
  },
  pink: {
    primary: '236 72 153',
    primaryDark: '219 39 119',
    secondary: '244 63 94',
    accent: '190 24 93',
    success: '16 185 129',
    warning: '245 158 11',
    error: '220 38 38',
    info: '59 130 246'
  },
  cyan: {
    primary: '6 182 212',
    primaryDark: '8 145 178',
    secondary: '34 211 238',
    accent: '45 212 191',
    success: '16 185 129',
    warning: '245 158 11',
    error: '239 68 68',
    info: '99 102 241'
  },
  red: {
    primary: '239 68 68',
    primaryDark: '220 38 38',
    secondary: '248 113 113',
    accent: '252 165 165',
    success: '16 185 129',
    warning: '245 158 11',
    error: '185 28 28',
    info: '59 130 246'
  },
  indigo: {
    primary: '99 102 241',
    primaryDark: '79 70 229',
    secondary: '129 140 248',
    accent: '165 180 252',
    success: '16 185 129',
    warning: '245 158 11',
    error: '239 68 68',
    info: '59 130 246'
  }
}

// 生成完整主题配置
function buildTheme(color: ThemeColor, mode: ThemeMode): FullThemeColors {
  const base = mode === 'dark' ? darkBase : lightBase
  return {
    ...colorSchemes[color],
    ...base
  }
}

export const fullThemeSchemes: Record<ThemeColor, { dark: FullThemeColors; light: FullThemeColors }> = {
  purple: { dark: buildTheme('purple', 'dark'), light: buildTheme('purple', 'light') },
  blue: { dark: buildTheme('blue', 'dark'), light: buildTheme('blue', 'light') },
  green: { dark: buildTheme('green', 'dark'), light: buildTheme('green', 'light') },
  orange: { dark: buildTheme('orange', 'dark'), light: buildTheme('orange', 'light') },
  pink: { dark: buildTheme('pink', 'dark'), light: buildTheme('pink', 'light') },
  cyan: { dark: buildTheme('cyan', 'dark'), light: buildTheme('cyan', 'light') },
  red: { dark: buildTheme('red', 'dark'), light: buildTheme('red', 'light') },
  indigo: { dark: buildTheme('indigo', 'dark'), light: buildTheme('indigo', 'light') }
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentColor: 'purple' as ThemeColor,
    currentMode: 'dark' as ThemeMode,
    isHydrated: false  // 标记是否已完成客户端 hydrate，用于避免闪烁
  }),

  getters: {
    fullThemeSchemes: () => fullThemeSchemes
  },

  actions: {
    setThemeColor(color: ThemeColor) {
      this.currentColor = color
      this.applyTheme()
      // persist: true 自动处理持久化，无需手动操作 localStorage
    },

    setThemeMode(mode: ThemeMode) {
      this.currentMode = mode
      this.applyTheme()
      // persist: true 自动处理持久化，无需手动操作 localStorage
    },

    applyTheme() {
      const colors = fullThemeSchemes[this.currentColor][this.currentMode]
      if (typeof document !== 'undefined' && document.documentElement) {
        const root = document.documentElement
        root.style.setProperty('--color-primary', colors.primary)
        root.style.setProperty('--color-primary-dark', colors.primaryDark)
        root.style.setProperty('--color-secondary', colors.secondary)
        root.style.setProperty('--color-accent', colors.accent)
        root.style.setProperty('--color-success', colors.success)
        root.style.setProperty('--color-warning', colors.warning)
        root.style.setProperty('--color-error', colors.error)
        root.style.setProperty('--color-info', colors.info)
        root.style.setProperty('--color-background', colors.background)
        root.style.setProperty('--color-surface', colors.surface)
        root.style.setProperty('--color-surface-light', colors.surfaceLight)
        root.style.setProperty('--color-text', colors.text)
        root.style.setProperty('--color-text-muted', colors.textMuted)
        root.style.setProperty('--color-text-inverse', colors.textInverse)
        root.style.setProperty('--color-border', colors.border)
        root.style.setProperty('--color-border-light', colors.borderLight)

        // 设置 data-theme-mode 属性用于 CSS 选择器
        root.setAttribute('data-theme-mode', this.currentMode)
      }
    },

    toggleMode() {
      this.setThemeMode(this.currentMode === 'dark' ? 'light' : 'dark')
    }
  },

  persist: true
})

// 跨标签页同步初始化标记
let syncInitialized = false

// 初始化跨标签页同步
// 使用函数形式避免在 SSR 环境下执行
export function initThemeCrossTabSync(): void {
  if (typeof window === 'undefined' || syncInitialized) return

  syncInitialized = true

  // 延迟加载避免阻塞初始渲染
  const scheduleSync = typeof requestIdleCallback !== 'undefined'
    ? (cb: () => void) => requestIdleCallback(cb)
    : (cb: () => void) => setTimeout(cb, 1)

  scheduleSync(() => {
    try {
      const { useCrossTabSync } = require('~/composables/useCrossTabSync')
      useCrossTabSync(useThemeStore, {
        channel: 'theme_sync',
        pick: ['currentColor', 'currentMode'],
        strategy: 'replace',
        debug: import.meta.dev
      })

      if (import.meta.dev) {
        console.log('[ThemeStore] Cross-tab sync initialized')
      }
    } catch (error) {
      console.error('[ThemeStore] Failed to initialize cross-tab sync:', error)
    }
  })
}
