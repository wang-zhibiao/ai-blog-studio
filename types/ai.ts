/**
 * AI 相关类型定义
 */

// AI 提供商
export type AIProvider = 'ollama' | 'openai' | 'anthropic' | 'deepseek'

// AI 操作类型
export type AIAction = 'continue' | 'polish' | 'summarize' | 'translate' | 'fix'

// AI 配置
export interface AIConfig {
  provider: AIProvider
  apiKey?: string
  baseUrl?: string
  model: string
  temperature?: number
  maxTokens?: number
}

// AI 使用量统计
export interface AIUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

// AI 响应
export interface AIResponse {
  content: string
  usage?: AIUsage
}
