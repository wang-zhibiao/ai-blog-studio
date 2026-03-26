/**
 * Nuxt Client Plugin for Theme Initialization
 *
 * This plugin runs only on the client-side and is responsible for:
 * 1. Applying the persisted theme immediately to prevent flash of unstyled content
 * 2. Marking the theme as hydrated so UI can transition smoothly
 * 3. Initializing cross-tab synchronization for theme changes
 */

import { initThemeCrossTabSync } from '~/stores/theme'

export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore()

  // Apply theme immediately to prevent flash of wrong theme
  // Pinia-persistedstate has already restored the state from localStorage
  themeStore.applyTheme()

  // Mark as hydrated to allow UI transitions
  themeStore.isHydrated = true

  // Initialize cross-tab synchronization
  initThemeCrossTabSync()

  if (import.meta.dev) {
    console.log('[ThemePlugin] Theme initialized:', {
      color: themeStore.currentColor,
      mode: themeStore.currentMode,
      isHydrated: themeStore.isHydrated
    })
  }
})
