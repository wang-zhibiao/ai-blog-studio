<template>
  <div class="sun-editor-wrapper">
    <div class="editor-container" ref="editorContainerRef">
      <div ref="editorRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

interface Props {
  modelValue: string
  height?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  placeholder: '开始写作...'
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref<HTMLDivElement | null>(null)
const editorContainerRef = ref<HTMLDivElement | null>(null)
let editorInstance: any = null

onMounted(() => {
  nextTick(() => {
    initEditor()
  })
})

const initEditor = async () => {
  if (!editorRef.value) return

  try {
    // 动态导入 suneditor
    const suneditor = (await import('suneditor')).default
    const plugins = (await import('suneditor/src/plugins')).default

    // 导入样式
    await import('suneditor/dist/css/suneditor.min.css')

    editorInstance = suneditor.create(editorRef.value, {
      plugins: plugins,
      strictMode: false,
      strictHTMLValidation: false,
      value: props.modelValue,
      width: '100%',
      height: props.height,
      minHeight: '400px',
      placeholder: props.placeholder,
      mode: 'classic',
      rtl: false,
      katex: 'window.katex',
      videoFileInput: false,
      imageFileInput: false,
      audioFileInput: false,
      addTagsWhitelist: '*',
      pasteTagsWhitelist: '*',
      defaultTag: 'div',
      attributesWhitelist: { all: '*' },
      buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock', 'lineHeight'],
        ['paragraphStyle', 'blockquote'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        '/',
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list'],
        ['table', 'link', 'image', 'video', 'audio'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print'],
        ['save', 'template']
      ],
      onChange: (content: string) => {
        emit('update:modelValue', content)
      }
    } as any)
  } catch (error) {
    console.error('SunEditor 初始化失败:', error)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (editorInstance && newVal !== undefined) {
    const currentContent = editorInstance.getContents()
    if (currentContent !== newVal) {
      editorInstance.setContents(newVal)
    }
  }
})

onBeforeUnmount(() => {
  if (editorInstance) {
    try {
      editorInstance.destroy()
    } catch (e) {
      // 忽略销毁时的错误
    }
    editorInstance = null
  }
})
</script>

