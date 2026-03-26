import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import type { AIConfig, AIProvider } from '~/types'

export type { AIConfig, AIProvider } from '~/types'

const DEFAULT_CONFIG: AIConfig = {
  provider: 'ollama',
  model: 'llama3.2',
  temperature: 0.7,
  maxTokens: 2048
}

export const useAIStore = defineStore('ai', {
  state: () => ({
    config: { ...DEFAULT_CONFIG } as AIConfig
  }),

  getters: {
    isConfigured: (state): boolean => {
      if (state.config.provider === 'ollama') {
        return !!state.config.model
      }
      return !!state.config.apiKey && !!state.config.model
    }
  },

  actions: {
    updateConfig(config: Partial<AIConfig>) {
      this.config = { ...this.config, ...config }
    },

    resetConfig() {
      this.config = { ...DEFAULT_CONFIG }
    },

    setProvider(provider: AIConfig['provider']) {
      this.config.provider = provider
      // 切换 provider 时重置模型
      switch (provider) {
        case 'ollama':
          this.config.model = 'llama3.2'
          break
        case 'openai':
          this.config.model = 'gpt-4o'
          break
        case 'anthropic':
          this.config.model = 'claude-3-sonnet'
          break
        case 'deepseek':
          this.config.model = 'deepseek-chat'
          break
      }
    }
  },

  persist: true
})

// 初始化跨标签页同步（仅在客户端）
if (typeof window !== 'undefined') {
  import('~/composables/useCrossTabSync').then(({ useCrossTabSync }) => {
    useCrossTabSync(useAIStore, {
      channel: 'ai_sync',
      pick: ['config'],
      strategy: 'merge',
      debug: import.meta.dev
    })
  })
}
