<template>
  <el-dialog
    v-model="visible"
    :title="activeTab === 'categories' ? '管理分类' : '管理标签'"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeTab" class="mb-4">
      <el-tab-pane label="分类" name="categories">
        <div class="space-y-4">
          <!-- 添加分类 -->
          <div class="flex gap-2">
            <el-input
              v-model="newCategory.name"
              placeholder="分类名称"
              @keyup.enter="addCategory"
            />
            <el-color-picker v-model="newCategory.color" size="default" />
            <el-button type="primary" @click="addCategory" :icon="Plus" />
          </div>

          <!-- 分类列表 -->
          <el-scrollbar max-height="300px">
            <div v-if="categories.length === 0" class="text-center py-8 text-gray-400">
              暂无分类
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
              >
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: cat.color || '#999' }"
                />
                <span class="flex-1">{{ cat.name }}</span>
                <span class="text-xs text-gray-400">({{ cat.articleCount }})</span>
                <el-button
                  type="danger"
                  text
                  size="small"
                  @click="deleteCategory(cat.id)"
                  :icon="Delete"
                />
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-tab-pane>

      <el-tab-pane label="标签" name="tags">
        <div class="space-y-4">
          <!-- 添加标签 -->
          <div class="flex gap-2">
            <el-input
              v-model="newTagName"
              placeholder="标签名称"
              @keyup.enter="addTag"
            />
            <el-button type="primary" @click="addTag" :icon="Plus" />
          </div>

          <!-- 标签云 -->
          <el-scrollbar max-height="300px">
            <div v-if="tags.length === 0" class="text-center py-8 text-gray-400">
              暂无标签
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <el-tag
                v-for="tag in tags"
                :key="tag.id"
                closable
                :style="{ backgroundColor: tag.color + '20', borderColor: tag.color, color: tag.color }"
                @close="deleteTag(tag.id)"
              >
                {{ tag.name }}
                <span class="text-xs ml-1 opacity-70">({{ tag.articleCount }})</span>
              </el-tag>
            </div>
          </el-scrollbar>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">import { ref, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaxonomyStore } from '~/stores/taxonomy'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const taxonomyStore = useTaxonomyStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref('categories')

// 分类相关
const newCategory = ref({
  name: '',
  color: '#3b82f6'
})

const categories = computed(() => taxonomyStore.categories)

const addCategory = () => {
  if (!newCategory.value.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  try {
    taxonomyStore.createCategory(newCategory.value)
    newCategory.value = { name: '', color: '#3b82f6' }
    ElMessage.success('分类添加成功')
  } catch (err) {
    ElMessage.error('添加失败')
  }
}

const deleteCategory = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？', '提示', {
      type: 'warning'
    })
    taxonomyStore.deleteCategory(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 标签相关
const newTagName = ref('')

const tags = computed(() => taxonomyStore.tags)

const addTag = () => {
  if (!newTagName.value.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }
  try {
    taxonomyStore.createTag(newTagName.value.trim())
    newTagName.value = ''
    ElMessage.success('标签添加成功')
  } catch (err) {
    ElMessage.error('添加失败')
  }
}

const deleteTag = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个标签吗？', '提示', {
      type: 'warning'
    })
    taxonomyStore.deleteTag(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}
</script>