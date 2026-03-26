/**
 * 跨标签页状态同步 Composable
 *
 * 基于 BroadcastChannel API 实现多标签页间的 Pinia Store 状态同步
 * 自动降级到 storage 事件（BroadcastChannel 不支持时）
 *
 * @example
 * // 在 store 定义后使用
 * useCrossTabSync(useThemeStore, {
 *   channel: 'theme_sync',
 *   pick: ['currentColor', 'currentMode'],
 *   strategy: 'replace'
 * })
 */

import type { Store, StoreDefinition } from 'pinia'
import type { Ref } from 'vue'

// 同步策略类型
export type SyncStrategy = 'replace' | 'merge' | 'timestamp'

// 配置选项接口
export interface CrossTabSyncOptions<S extends Store = Store> {
  /** 广播频道名称（必须唯一） */
  channel: string
  /** 要同步的状态字段列表（使用 dot 路径，如 'user.name'） */
  pick: string[]
  /** 同步策略：replace(完全替换) | merge(深度合并) | timestamp(基于时间戳) */
  strategy?: SyncStrategy
  /** 自定义时间戳字段名（用于 timestamp 策略） */
  timestampField?: string
  /** 收到同步消息后触发的回调 */
  onSync?: (store: S, data: Record<string, unknown>) => void
  /** 是否启用调试日志 */
  debug?: boolean
}

// 内部消息格式
interface SyncMessage {
  type: 'SYNC_STATE'
  payload: Record<string, unknown>
  timestamp: number
  tabId: string
  channel: string
}

// 生成唯一 Tab ID
const generateTabId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`

// 获取对象路径值
const getPathValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

// 设置对象路径值（浅拷贝）
const setPathValue = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> => {
  const keys = path.split('.')
  const result = { ...obj }
  let current: Record<string, unknown> = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    current[key] = current[key] ? { ...(current[key] as Record<string, unknown>) } : {}
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return result
}

// 深度合并对象
const deepMerge = (
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> => {
  const result = { ...target }

  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      )
    } else {
      result[key] = sourceValue
    }
  }

  return result
}

// 根据策略合并数据
const applyStrategy = (
  currentState: Record<string, unknown>,
  incomingState: Record<string, unknown>,
  strategy: SyncStrategy,
  timestampField?: string
): Record<string, unknown> => {
  switch (strategy) {
    case 'merge':
      return deepMerge(currentState, incomingState)

    case 'timestamp':
      if (timestampField) {
        const currentTime = getPathValue(currentState, timestampField) as number | undefined
        const incomingTime = getPathValue(incomingState, timestampField) as number | undefined

        if (incomingTime && (!currentTime || incomingTime > currentTime)) {
          return { ...currentState, ...incomingState }
        }
        return currentState
      }
      return { ...currentState, ...incomingState }

    case 'replace':
    default:
      return { ...currentState, ...incomingState }
  }
}

// 主函数：创建跨标签页同步
export function useCrossTabSync<S extends Store>(
  storeDefinition: StoreDefinition<string, unknown, unknown, unknown>,
  options: CrossTabSyncOptions<S>
): void {
  const { channel, pick, strategy = 'replace', timestampField, onSync, debug } = options

  // 仅在客户端执行
  if (typeof window === 'undefined') return

  // 获取 Store 实例
  const store = storeDefinition() as S
  const tabId = generateTabId()

  // 创建 BroadcastChannel（如果不支持则使用 storage 事件降级）
  let broadcastChannel: BroadcastChannel | null = null
  let useStorageFallback = false

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel(channel)
      if (debug) console.log(`[CrossTabSync] BroadcastChannel created: ${channel}`)
    } else {
      useStorageFallback = true
      if (debug) console.log(`[CrossTabSync] Using storage fallback for: ${channel}`)
    }
  } catch (error) {
    useStorageFallback = true
    if (debug) console.warn(`[CrossTabSync] BroadcastChannel failed, using fallback:`, error)
  }

  // 提取需要同步的状态
  const extractSyncState = (): Record<string, unknown> => {
    const state = store.$state as Record<string, unknown>
    const extracted: Record<string, unknown> = {}

    for (const path of pick) {
      const value = getPathValue(state, path)
      if (value !== undefined) {
        setPathValue(extracted, path, value)
      }
    }

    return extracted
  }

  // 应用同步的状态到 Store
  const applySyncState = (incomingState: Record<string, unknown>): void => {
    const currentState = store.$state as Record<string, unknown>

    // 根据策略合并
    const mergedState = applyStrategy(currentState, incomingState, strategy, timestampField)

    // 只应用 pick 中指定的字段
    for (const path of pick) {
      const newValue = getPathValue(mergedState, path)
      if (newValue !== undefined) {
        const keys = path.split('.')
        let target: Record<string, unknown> = store.$state as Record<string, unknown>

        for (let i = 0; i < keys.length - 1; i++) {
          target = target[keys[i]] as Record<string, unknown>
        }

        target[keys[keys.length - 1]] = newValue
      }
    }

    // 触发回调
    if (onSync) {
      onSync(store, incomingState)
    }
  }

  // 发送同步消息
  const sendSyncMessage = (): void => {
    const message: SyncMessage = {
      type: 'SYNC_STATE',
      payload: extractSyncState(),
      timestamp: Date.now(),
      tabId,
      channel
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage(message)
    } else if (useStorageFallback) {
      // 使用 storage 事件作为降级方案
      localStorage.setItem(
        `__cross_tab_sync_${channel}__`,
        JSON.stringify(message)
      )
      // 立即删除以避免持久化
      setTimeout(() => {
        localStorage.removeItem(`__cross_tab_sync_${channel}__`)
      }, 100)
    }

    if (debug) console.log(`[CrossTabSync] Message sent from ${tabId}:`, message)
  }

  // 处理接收到的消息
  const handleMessage = (event: MessageEvent<SyncMessage> | StorageEvent): void => {
    let message: SyncMessage | null = null

    if (event instanceof MessageEvent) {
      message = event.data
    } else if (event instanceof StorageEvent) {
      if (event.key === `__cross_tab_sync_${channel}__` && event.newValue) {
        try {
          message = JSON.parse(event.newValue) as SyncMessage
        } catch {
          return
        }
      }
    }

    if (!message || message.type !== 'SYNC_STATE' || message.channel !== channel) return

    // 忽略自己发送的消息
    if (message.tabId === tabId) return

    if (debug) {
      console.log(`[CrossTabSync] Message received from ${message.tabId}:`, message)
    }

    // 应用同步的状态
    applySyncState(message.payload)
  }

  // 监听 Store 变化
  const unsubscribe = store.$subscribe(
    (mutation, state) => {
      // 检查变化是否涉及需要同步的字段
      const changedPaths = pick.filter((path) => {
        // 简单检查：如果 pick 中的路径在 mutation 中被修改
        const keys = path.split('.')
        return mutation.events
          ? Array.isArray(mutation.events)
            ? mutation.events.some(
                (e) =>
                  e.key === keys[0] ||
                  (e.path && e.path[0] === keys[0])
              )
            : mutation.events.key === keys[0] ||
              (mutation.events.path &&
                mutation.events.path[0] === keys[0])
          : true // 如果无法确定，默认同步
      })

      if (changedPaths.length > 0) {
        // 使用防抖避免频繁同步
        clearTimeout((sendSyncMessage as unknown as { _timer?: number })._timer)
        ;(sendSyncMessage as unknown as { _timer?: number })._timer = window.setTimeout(
          () => sendSyncMessage(),
          50
        )
      }
    },
    { flush: 'sync' }
  )

  // 设置消息监听
  if (broadcastChannel) {
    broadcastChannel.onmessage = handleMessage as (event: MessageEvent<SyncMessage>) => void
  } else if (useStorageFallback) {
    window.addEventListener('storage', handleMessage as (event: StorageEvent) => void)
  }

  // 页面卸载时清理
  const cleanup = (): void => {
    unsubscribe()

    if (broadcastChannel) {
      broadcastChannel.close()
      broadcastChannel = null
    }

    if (useStorageFallback) {
      window.removeEventListener('storage', handleMessage as (event: StorageEvent) => void)
    }

    if (debug) console.log(`[CrossTabSync] Cleanup completed for tab ${tabId}`)
  }

  window.addEventListener('beforeunload', cleanup)

  // 页面可见性变化时记录状态（可选的优化）
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && debug) {
      console.log(`[CrossTabSync] Tab ${tabId} became visible`)
    }
  })

  if (debug) {
    console.log(`[CrossTabSync] Initialized for store with channel: ${channel}, tab: ${tabId}`)
  }
}

// 导出类型供外部使用
export type { CrossTabSyncOptions, SyncStrategy }
