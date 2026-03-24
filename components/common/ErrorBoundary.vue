<template>
  <slot v-if="!hasError" />
  <div v-else class="error-boundary min-h-screen flex items-center justify-center p-6 bg-[rgb(var(--color-background))]">
    <div class="max-w-md w-full text-center">
      <div class="text-6xl mb-4">😵</div>
      <h2 class="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">出错了</h2>
      <p class="text-[rgb(var(--color-text-muted))] mb-6">{{ errorMessage }}</p>

      <div class="space-y-3">
        <el-button type="primary" size="large" class="w-full" @click="handleRetry">
          <el-icon><RefreshRight /></el-icon>
          重试
        </el-button>

        <el-button size="large" class="w-full" @click="handleGoHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>

        <el-button v-if="showDetails" text class="w-full" @click="showErrorDetails = !showErrorDetails">
          {{ showErrorDetails ? '隐藏详情' : '查看详情' }}
        </el-button>
      </div>

      <div v-if="showErrorDetails && errorDetails" class="mt-6 p-4 bg-[rgb(var(--color-surface))] rounded-lg text-left">
        <pre class="text-xs text-[rgb(var(--color-text-muted))] overflow-auto whitespace-pre-wrap">{{ errorDetails }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshRight, HomeFilled } from '@element-plus/icons-vue'

const props = withDefaults(defineProps<{
  showDetails?: boolean
  fallback?: (error: Error) => void
}>(), {
  showDetails: true
})

const router = useRouter()

const hasError = ref(false)
const error = ref<Error | null>(null)
const showErrorDetails = ref(false)

const errorMessage = computed(() => {
  if (!error.value) return '发生未知错误'
  return error.value.message || '应用加载失败'
})

const errorDetails = computed(() => {
  if (!error.value) return ''
  return `${error.value.name}: ${error.value.message}\n\n${error.value.stack || ''}`
})

// 重置错误状态
const resetError = () => {
  hasError.value = false
  error.value = null
  showErrorDetails.value = false
}

// 处理重试
const handleRetry = () => {
  resetError()
  // 触发页面刷新
  window.location.reload()
}

// 返回首页
const handleGoHome = () => {
  resetError()
  router.push('/')
}

// 捕获错误
onErrorCaptured((err, instance, info) => {
  console.error('ErrorBoundary 捕获到错误:', err, instance, info)

  error.value = err instanceof Error ? err : new Error(String(err))
  hasError.value = true

  // 调用自定义 fallback
  if (props.fallback) {
    props.fallback(error.value)
  }

  // 阻止错误继续传播
  return false
})
</script>
