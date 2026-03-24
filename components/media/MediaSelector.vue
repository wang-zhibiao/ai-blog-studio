<template>
  <el-dialog
    v-model="visible"
    title="选择图片"
    width="800px"
    :close-on-click-modal="false"
  >
    <div v-if="loading" class="flex justify-center py-10">
      <el-icon class="animate-spin text-2xl"><Loading /></el-icon>
    </div>

    <div v-else-if="files.length === 0" class="text-center py-10">
      <el-empty description="暂无图片" />
    </div>

    <div v-else class="grid grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-2">
      <div
        v-for="file in imageFiles"
        :key="file.id"
        class="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all"
        :class="selectedId === file.id ? 'border-[rgb(var(--color-primary))]' : 'border-transparent hover:border-gray-300'"
        @click="selectFile(file)"
      >
        <img :src="file.url" class="w-full h-full object-cover" />
        <div v-if="selectedId === file.id" class="absolute inset-0 bg-[rgb(var(--color-primary))] bg-opacity-20 flex items-center justify-center">
          <el-icon class="text-2xl text-white"><Check /></el-icon>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <el-upload
          action=""
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleUpload"
          accept="image/*"
        >
          <el-button type="primary" plain>
            <el-icon><Upload /></el-icon>
            上传图片
          </el-button>
        </el-upload>
        <div class="flex gap-2">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="confirm" :disabled="!selectedId">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Loading, Check, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'

interface MediaFile {
  id: string
  name: string
  url: string
  type: string
}

const props = defineProps<{
  modelValue: boolean
  files: MediaFile[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select': [file: MediaFile]
  'upload': [file: File]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedId = ref<string | null>(null)
const selectedFile = ref<MediaFile | null>(null)

const imageFiles = computed(() => {
  return props.files.filter(f => f.type === 'image')
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedId.value = null
    selectedFile.value = null
  }
})

const selectFile = (file: MediaFile) => {
  selectedId.value = file.id
  selectedFile.value = file
}

const confirm = () => {
  if (selectedFile.value) {
    emit('select', selectedFile.value)
    visible.value = false
  }
}

const handleUpload = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    emit('upload', uploadFile.raw)
  }
}
</script>
