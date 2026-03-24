import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export interface AIConfig {
  provider: 'ollama' | 'openai' | 'anthropic' | 'deepseek'
  apiKey?: string
  baseUrl?: string
  model: string
  temperature?: number
  maxTokens?: number
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export type AIAction = 'continue' | 'polish' | 'summarize' | 'translate' | 'fix'

const DEFAULT_CONFIG: AIConfig = {
  provider: 'ollama',
  model: 'llama3.2',
  temperature: 0.7,
  maxTokens: 2048
}

const STORAGE_KEY = 'ai-config'

export function useAI() {
  const config = ref<AIConfig>({ ...DEFAULT_CONFIG })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 加载配置
  const loadConfig = () => {
    if (typeof localStorage === 'undefined') return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        config.value = { ...DEFAULT_CONFIG, ...JSON.parse(saved) }
      }
    } catch (err) {
      console.error('加载 AI 配置失败:', err)
    }
  }

  // 保存配置
  const saveConfig = () => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
    } catch (err) {
      console.error('保存 AI 配置失败:', err)
    }
  }

  // 构建提示词
  const buildPrompt = (action: AIAction, content: string, context?: string): string => {
    const prompts: Record<AIAction, string> = {
      continue: `请根据以下文章内容，继续撰写后续内容。保持相同的写作风格和语气。

原文内容：
${content}

请继续：`,

      polish: `请对以下文章进行润色和优化。改善表达，修正语法错误，使文章更加流畅和专业。保持原意不变。

原文内容：
${content}

润色后的文章：`,

      summarize: `请为以下文章生成一个简洁的摘要。摘要应该概括文章的核心内容，长度在 100-200 字之间。

原文内容：
${content}

摘要：`,

      translate: `请将以下文章翻译成英文。保持原文的语气和风格，确保翻译准确自然。

原文内容：
${content}

英文翻译：`,

      fix: `请检查以下文章的问题并修正。包括语法错误、错别字、标点符号问题等。

原文内容：
${content}

修正后的文章：`
    }

    return prompts[action] || prompts.continue
  }

  // 调用 Ollama API
  const callOllama = async (prompt: string): Promise<AIResponse> => {
    const baseUrl = config.value.baseUrl || 'http://localhost:11434'
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.value.model,
        prompt,
        stream: false,
        options: {
          temperature: config.value.temperature || 0.7
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API 错误: ${response.status}`)
    }

    const data = await response.json()
    return {
      content: data.response,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      }
    }
  }

  // 调用 OpenAI API
  const callOpenAI = async (prompt: string): Promise<AIResponse> => {
    const baseUrl = config.value.baseUrl || 'https://api.openai.com/v1'
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.value.apiKey}`
      },
      body: JSON.stringify({
        model: config.value.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: config.value.temperature || 0.7,
        max_tokens: config.value.maxTokens || 2048
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API 错误: ${error.error?.message || response.status}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    }
  }

  // 主调用函数
  const generate = async (action: AIAction, content: string, context?: string): Promise<string> => {
    loading.value = true
    error.value = null

    try {
      const prompt = buildPrompt(action, content, context)
      let response: AIResponse

      switch (config.value.provider) {
        case 'ollama':
          response = await callOllama(prompt)
          break
        case 'openai':
        case 'anthropic':
        case 'deepseek':
          response = await callOpenAI(prompt)
          break
        default:
          throw new Error(`不支持的 AI 提供商: ${config.value.provider}`)
      }

      return response.content.trim()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 调用失败'
      error.value = message
      ElMessage.error(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 初始化
  loadConfig()

  return {
    config,
    loading,
    error,
    generate,
    saveConfig,
    loadConfig
  }
}
