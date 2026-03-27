import type { AIConfig, ChatCompletionParams, ChatCompletionResponse, AIProvider as AIProviderType } from './types'

export interface AIProviderInstance {
  generateCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse>
  isConfigured(): boolean
}

export interface AIRepository {
  getProvider(config: AIConfig): AIProviderInstance
}
