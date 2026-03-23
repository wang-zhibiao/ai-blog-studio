import { useThemeStore } from '~/stores/theme'

export default defineNuxtPlugin(() => {
  if (process.client) {
    const themeStore = useThemeStore()
    themeStore.initTheme()
  }
})
