export type AIProvider = 'ollama' | 'openai' | 'anthropic' | 'deepseek'

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  baseUrl?: string
  model: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionParams {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatCompletionResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}
