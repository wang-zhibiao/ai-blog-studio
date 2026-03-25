<template>
  <ConsoleLayout>
    <div class="space-y-6">
      <!-- 页面标题和操作 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-[rgb(var(--color-text))] mb-2">媒体库</h1>
          <p class="text-[rgb(var(--color-text-muted))]">管理你的图片和文件，方便在编辑器中使用</p>
        </div>
        <div class="flex items-center gap-3">
          <el-button type="primary" @click="showUploadDialog = true" :disabled="!hasMediaAccess">
            <el-icon><Upload /></el-icon>
            上传文件
          </el-button>
        </div>
      </div>

      <RepoGuard>
        <!-- 搜索栏 -->
        <div class="mt-6">
          <SearchBar
          v-model="searchQuery"
          placeholder="搜索文件名..."
          :show-view-toggle="true"
          v-model:view-mode="viewMode"
          @search="handleSearch"
        >
          <template #filters>
            <el-select v-model="filterType" placeholder="文件类型" class="min-w-[100px] w-36" clearable>
              <el-option label="全部" value="all" />
              <el-option label="图片" value="image" />
              <el-option label="其他" value="other" />
            </el-select>
          </template>
        </SearchBar>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <el-icon class="animate-spin text-4xl text-[rgb(var(--color-primary))]"><Loading /></el-icon>
        </div>

        <!-- 文件列表 -->
        <template v-else>
          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
            <div
              v-for="file in filteredFiles"
              :key="file.id"
              class="group relative bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden hover:border-[rgb(var(--color-primary))] transition-colors cursor-pointer"
              @click="copyUrl(file)"
            >
              <!-- 预览区 -->
              <div class="aspect-square bg-[rgb(var(--color-background))] flex items-center justify-center overflow-hidden">
                <img v-if="file.type === 'image'" :src="file.url" :alt="file.name" class="w-full h-full object-cover" />
                <div v-else class="text-4xl">{{ getFileIcon(file.type) }}</div>
              </div>

              <!-- 悬浮操作 -->
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <el-button type="primary" size="small" circle @click.stop="copyUrl(file)">
                  <el-icon><Link /></el-icon>
                </el-button>
                <el-button type="danger" size="small" circle @click.stop="deleteFile(file)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>

              <!-- 信息区 -->
              <div class="p-3">
                <div class="text-sm font-medium text-[rgb(var(--color-text))] truncate">{{ file.name }}</div>
                <div class="text-xs text-[rgb(var(--color-text-muted))] mt-1">
                  <span>{{ formatFileSize(file.size) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden mt-6">
            <el-table :data="filteredFiles" style="width: 100%">
              <el-table-column label="预览" width="100">
                <template #default="{ row }">
                  <div class="w-12 h-12 rounded bg-[rgb(var(--color-background))] flex items-center justify-center overflow-hidden">
                    <img v-if="row.type === 'image'" :src="row.url" class="w-full h-full object-cover" />
                    <span v-else class="text-xl">{{ getFileIcon(row.type) }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="文件名" prop="name" />
              <el-table-column label="大小" width="120">
                <template #default="{ row }">
                  {{ formatFileSize(row.size) }}
                </template>
              </el-table-column>
              <el-table-column label="上传时间" width="180" prop="uploadTime" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="copyUrl(row)">复制链接</el-button>
                  <el-button link type="danger" @click="deleteFile(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredFiles.length === 0 && !loading" class="flex flex-col items-center justify-center py-20 text-center mt-6">
            <div class="text-6xl mb-4"><FaIcon icon="image" class="text-6xl text-[rgb(var(--color-text-muted))]" /></div>
            <h3 class="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">暂无文件</h3>
            <p class="text-[rgb(var(--color-text-muted))] mb-4">上传一些图片或文件开始使用吧</p>
            <el-button type="primary" @click="showUploadDialog = true" :disabled="!hasMediaAccess">
              <el-icon><Upload /></el-icon>
              上传文件
            </el-button>
          </div>
        </template>
      </RepoGuard>
    </div>

    <!-- 上传弹窗 -->
    <el-dialog v-model="showUploadDialog" title="上传文件" width="600px">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        multiple
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip text-[rgb(var(--color-text-muted))]">
            支持 jpg、png、gif、svg 等图片格式，单个文件不超过 10MB
          </div>
        </template>
      </el-upload>
      <div class="mt-4" v-if="pendingFiles.length > 0">
        <h4 class="font-medium text-[rgb(var(--color-text))] mb-2">待上传文件 ({{ pendingFiles.length }})</h4>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div v-for="(file, index) in pendingFiles" :key="index" class="flex items-center gap-3 p-2 bg-[rgb(var(--color-background))] rounded-lg">
            <div class="w-10 h-10 bg-[rgb(var(--color-surface-light))] rounded flex items-center justify-center">
              {{ getFileIcon(getFileType(file.name)) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-[rgb(var(--color-text))] truncate">{{ file.name }}</div>
              <div class="text-xs text-[rgb(var(--color-text-muted))]">{{ formatFileSize(file.size) }}</div>
            </div>
            <el-button link type="danger" size="small" @click="pendingFiles.splice(index, 1)">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showUploadDialog = false; pendingFiles = []">取消</el-button>
        <el-button type="primary" @click="uploadFiles" :loading="uploading" :disabled="pendingFiles.length === 0">
          上传 {{ pendingFiles.length }} 个文件
        </el-button>
      </template>
    </el-dialog>
  </ConsoleLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Upload, Link, Delete, UploadFilled, Close, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ConsoleLayout from '~/components/layout/ConsoleLayout.vue'
import SearchBar from '~/components/console/SearchBar.vue'
import RepoGuard from '~/components/console/RepoGuard.vue'
import { useLocalFS, type MediaFile as LocalMediaFile } from '~/composables/useLocalFS'

const localFS = useLocalFS()

const viewMode = ref<'grid' | 'list'>('grid')
const filterType = ref('all')
const searchQuery = ref('')
const showUploadDialog = ref(false)
const uploading = ref(false)
const loading = ref(false)
const pendingFiles = ref<File[]>([])
const files = ref<LocalMediaFile[]>([])

const hasMediaAccess = computed(() => localFS.hasMediaAccess.value || localFS.hasArticlesAccess.value)

const filteredFiles = computed(() => {
  let result = [...files.value]

  // 按类型筛选
  if (filterType.value !== 'all') {
    result = result.filter(f => f.type === filterType.value)
  }

  // 搜索
  if (searchQuery.value) {
    result = result.filter(f => f.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }

  return result
})

const getFileIcon = (type: string) => {
  const icons: Record<string, string> = {
    image: 'image',
    video: '🎬',
    other: 'file'
  }
  return icons[type] || 'file'
}

const getFileType = (name: string) => {
  return localFS.getFileType(name)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const copyUrl = (file: LocalMediaFile) => {
  navigator.clipboard.writeText(file.name)
  ElMessage.success('文件名已复制到剪贴板')
}

const deleteFile = async (file: LocalMediaFile) => {
  ElMessageBox.confirm(`确定要删除 ${file.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await localFS.deleteMediaFile(file.name)
      files.value = files.value.filter(f => f.id !== file.id)
      // 释放 URL
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url)
      }
      ElMessage.success('删除成功')
    } catch (err) {
      console.error('删除文件失败:', err)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleSearch = () => {
  // 搜索已通过 computed 自动处理
}

const handleFileChange = (file: any) => {
  pendingFiles.value.push(file.raw)
}

const uploadFiles = async () => {
  if (!hasMediaAccess.value) {
    ElMessage.error('请先配置媒体库目录')
    return
  }

  uploading.value = true
  try {
    for (const file of pendingFiles.value) {
      const filename = await localFS.saveImage(file)
      // 重新加载文件列表
      await loadMediaFiles()
    }
    ElMessage.success(`成功上传 ${pendingFiles.value.length} 个文件`)
    showUploadDialog.value = false
    pendingFiles.value = []
  } catch (err) {
    console.error('上传失败:', err)
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const loadMediaFiles = async () => {
  if (!localFS.hasArticlesAccess.value) return

  loading.value = true
  try {
    // 先释放旧的 blob URLs
    files.value.forEach(f => {
      if (f.url.startsWith('blob:')) {
        URL.revokeObjectURL(f.url)
      }
    })
    files.value = await localFS.loadMediaFiles()
  } catch (err) {
    console.error('加载媒体文件失败:', err)
    ElMessage.error('加载媒体文件失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMediaFiles()
})

// 监听权限状态变化，重新加载媒体文件
watch(() => localFS.hasArticlesAccess.value, (hasAccess) => {
  if (hasAccess) {
    loadMediaFiles()
  } else {
    files.value = []
  }
})

onUnmounted(() => {
  // 清理 blob URLs
  files.value.forEach(f => {
    if (f.url.startsWith('blob:')) {
      URL.revokeObjectURL(f.url)
    }
  })
})
</script>
