<template>
  <div class="article-editor-wrapper">
    <!-- HTML 编辑器 -->
    <SunEditor
      v-if="format === 'html'"
      ref="htmlEditorRef"
      v-model="localContent"
      :placeholder="placeholder"
      :max-height="maxHeight"
    />

    <!-- Markdown 编辑器 -->
    <MarkdownEditor
      v-else
      ref="markdownEditorRef"
      v-model="localContent"
      :placeholder="placeholder"
      :height="maxHeight"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import SunEditor from './SunEditor.vue'
import MarkdownEditor from './MarkdownEditor.vue'

interface Props {
  modelValue: string
  format?: 'html' | 'markdown'
  placeholder?: string
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  format: 'html',
  placeholder: '开始写作...',
  maxHeight: 'calc(100vh - 200px)'
})

const emit = defineEmits(['update:modelValue'])

// 本地内容
const localContent = ref(props.modelValue)

// 编辑器引用
const htmlEditorRef = ref<InstanceType<typeof SunEditor> | null>(null)
const markdownEditorRef = ref<InstanceType<typeof MarkdownEditor> | null>(null)

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== localContent.value) {
    localContent.value = newVal
  }
})

// 监听本地内容变化，通知父组件
watch(localContent, (newVal) => {
  emit('update:modelValue', newVal)
})

// 判断内容是否为空
const isContentEmpty = (): boolean => {
  const format = props.format

  if (format === 'html') {
    const html = localContent.value || ''
    const text = html.replace(/<[^>]*>/g, '').trim()
    return text.length === 0
  }

  // markdown
  const md = localContent.value || ''
  return md.trim().length === 0
}

// 暴露方法给父组件
defineExpose({
  isContentEmpty,
  getEditorInstance: () => {
    if (props.format === 'html' && htmlEditorRef.value) {
      return htmlEditorRef.value.getEditorInstance?.()
    }
    return null
  }
})
</script>

<style scoped>
.article-editor-wrapper {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 确保子编辑器正确撑开 */
.article-editor-wrapper :deep(*) {
  min-height: 0;
}
</style>
