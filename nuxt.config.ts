export default defineNuxtConfig({
  compatibilityDate: '2025-03-19',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'AI Blog Studio',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI 驱动的博客工作室' }
      ]
    }
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@element-plus/nuxt'
  ],
  pinia: {
    storesDirs: ['./stores/**']
  },
  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'css',
    themes: ['dark']
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
    exposeConfig: true
  }
})
