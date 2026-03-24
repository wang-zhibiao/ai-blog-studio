<template>
  <div class="markdown-editor-wrapper h-full flex flex-col">
    <ClientOnly class="flex-1 min-h-0">
      <MdEditor
        v-if="mounted"
        v-model="content"
        :theme="theme"
        :placeholder="placeholder"
        editor-id="md-editor"
        class="h-full"
        @onChange="onChange"
      />
      <template #fallback>
        <div class="editor-loading">
          <span>编辑器加载中...</span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

interface Props {
  modelValue: string
  placeholder?: string
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '开始写作...',
  maxHeight: 'calc(100vh - 200px)'
})

const emit = defineEmits(['update:modelValue'])

// 编辑器样式
const editorStyle = computed(() => ({
  maxHeight: props.maxHeight
}))

// 组件挂载状态
const mounted = ref(false)

// 内容
const content = ref(props.modelValue)

// 主题 - 根据系统主题设置
const theme = computed<'light' | 'dark'>(() => {
  if (typeof window === 'undefined') return 'light'
  // 检查系统主题或 html 元素的 dark 类
  const isDark = document.documentElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return isDark ? 'dark' : 'light'
})



// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== content.value) {
    content.value = newVal
  }
})

// 内容变化时触发 - 使用 MdEditor 的 onChange 事件类型
const onChange = (val: string) => {
  emit('update:modelValue', val)
}

// 组件挂载
onMounted(() => {
  mounted.value = true
})

// 暴露方法给父组件
defineExpose({
  isContentEmpty: () => {
    return !content.value || content.value.trim().length === 0
  }
})
</script>

<style scoped>
.markdown-editor-wrapper {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.editor-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgb(var(--color-text-muted));
}

/* 覆盖 md-editor-v3 的样式以适配当前主题 */
.markdown-editor-wrapper :deep(.md-editor) {
  height: 100% !important;
  border-radius: 0;
  border: none;
  background-color: rgb(var(--color-surface));
  display: flex !important;
  flex-direction: column !important;
}

.markdown-editor-wrapper :deep(.md-editor-content) {
  flex: 1 !important;
  min-height: 0 !important;
  background-color: rgb(var(--color-surface));
}

.markdown-editor-wrapper :deep(.md-editor-input-wrapper) {
  height: 100% !important;
  background-color: rgb(var(--color-surface));
}

.markdown-editor-wrapper :deep(.md-editor-toolbar) {
  border-bottom-color: rgb(var(--color-border));
  background-color: rgb(var(--color-surface));
  flex-shrink: 0;
}

.markdown-editor-wrapper :deep(.md-editor-toolbar-item) {
  color: rgb(var(--color-text));
}

.markdown-editor-wrapper :deep(.md-editor-textarea) {
  background-color: rgb(var(--color-surface)) !important;
  color: rgb(var(--color-text)) !important;
}

.markdown-editor-wrapper :deep(.md-editor-textarea::placeholder) {
  color: rgb(var(--color-text-muted));
}
</style>
