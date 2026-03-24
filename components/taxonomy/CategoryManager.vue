<template>
  <div class="category-manager">
    <!-- 工具栏 -->
    <div class="flex justify-between items-center mb-4">
      <el-input
        v-model="searchQuery"
        placeholder="搜索分类..."
        clearable
        class="w-64"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新建分类
      </el-button>
    </div>

    <!-- 分类列表 -->
    <el-table
      v-loading="loading"
      :data="filteredCategories"
      row-key="id"
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column label="分类名称" min-width="200">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: row.color || '#999' }"
            />
            <el-icon v-if="row.icon" class="text-gray-500">
              <component :is="row.icon" />
            </el-icon>
            <span class="font-medium">{{ row.name }}</span>
            <el-tag v-if="row.articleCount > 0" size="small" type="info">
              {{ row.articleCount }} 篇
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Slug" width="180">
        <template #default="{ row }">
          <code class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {{ row.slug }}
          </code>
        </template>
      </el-table-column>

      <el-table-column label="描述" min-width="200">
        <template #default="{ row }">
          <span class="text-gray-500 text-sm line-clamp-1">
            {{ row.description || '-' }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" link @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button type="primary" link @click="openCreateDialog(row.id)">
              添加子分类
            </el-button>
            <el-popconfirm
              title="确定删除该分类吗？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="deleteCategory(row.id)"
            >
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新建分类'"
      width="600px"
    >
      <el-form :model="form" label-position="top">
        <el-form-item label="分类名称" required>
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="Slug">
          <el-input v-model="form.slug" placeholder="留空自动生成">
            <template #append>
              <el-button @click="generateSlug">自动生成</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="上级分类" v-if="!isEdit">
          <el-select v-model="form.parentId" placeholder="不选则为顶级分类" clearable>
            <el-option
              v-for="cat in availableParents"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="颜色">
          <el-color-picker v-model="form.color" show-alpha />
        </el-form-item>

        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="图标类名，如: Folder" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="分类描述"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.order" :min="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Category } from '~/stores/taxonomy'
import { useTaxonomyStore } from '~/stores/taxonomy'

const taxonomyStore = useTaxonomyStore()

// 搜索和过滤
const searchQuery = ref('')
const loading = computed(() => taxonomyStore.loading)

// 将扁平的分类列表转换为树形结构
const buildCategoryTree = (categories: Category[]): (Category & { children?: Category[] })[] => {
  const categoryMap = new Map<string, Category & { children?: Category[] }>()
  const roots: (Category & { children?: Category[] })[] = []

  // 首先创建所有节点的映射
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] })
  })

  // 然后构建树形结构
  categories.forEach(cat => {
    const node = categoryMap.get(cat.id)!
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parent = categoryMap.get(cat.parentId)!
      parent.children = parent.children || []
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

const filteredCategories = computed(() => {
  let categories = taxonomyStore.categories

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    categories = categories.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    )
  }

  return buildCategoryTree(categories)
})

// 对话框状态
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)
const parentIdForNew = ref<string | undefined>(undefined)

const form = ref({
  name: '',
  slug: '',
  parentId: undefined as string | undefined,
  color: '',
  icon: '',
  description: '',
  order: 0
})

// 可用的上级分类（排除自己及其子分类）
const availableParents = computed(() => {
  if (!isEdit.value) {
    return taxonomyStore.categories.filter(c => c.id !== parentIdForNew.value)
  }
  // 编辑模式下，排除自己和自己的子分类
  const excludeIds = new Set<string>()
  const addChildren = (parentId: string) => {
    excludeIds.add(parentId)
    taxonomyStore.categories
      .filter(c => c.parentId === parentId)
      .forEach(c => addChildren(c.id))
  }
  if (editingId.value) {
    addChildren(editingId.value)
  }
  return taxonomyStore.categories.filter(c => !excludeIds.has(c.id))
})

// 对话框操作
const openCreateDialog = (parentId?: string) => {
  isEdit.value = false
  editingId.value = null
  parentIdForNew.value = parentId
  form.value = {
    name: '',
    slug: '',
    parentId,
    color: taxonomyStore.generateColor('new'),
    icon: '',
    description: '',
    order: taxonomyStore.categories.length
  }
  dialogVisible.value = true
}

const openEditDialog = (category: Category) => {
  isEdit.value = true
  editingId.value = category.id
  form.value = {
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    color: category.color || '',
    icon: category.icon || '',
    description: category.description || '',
    order: category.order
  }
  dialogVisible.value = true
}

const generateSlug = () => {
  if (form.value.name) {
    form.value.slug = form.value.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

const saveCategory = () => {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  try {
    if (isEdit.value && editingId.value) {
      taxonomyStore.updateCategory(editingId.value, {
        name: form.value.name,
        slug: form.value.slug,
        color: form.value.color,
        icon: form.value.icon,
        description: form.value.description,
        order: form.value.order
      })
      ElMessage.success('分类已更新')
    } else {
      taxonomyStore.createCategory({
        name: form.value.name,
        slug: form.value.slug,
        parentId: form.value.parentId,
        color: form.value.color,
        icon: form.value.icon,
        description: form.value.description,
        order: form.value.order
      })
      ElMessage.success('分类已创建')
    }
    dialogVisible.value = false
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '操作失败')
  }
}

const deleteCategory = (id: string) => {
  try {
    taxonomyStore.deleteCategory(id)
    ElMessage.success('分类已删除')
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '删除失败')
  }
}

// 监听数据变化，自动保存
watch(() => taxonomyStore.categories, () => {
  taxonomyStore.saveToStorage()
}, { deep: true })
</script>

<style scoped>
.category-manager {
  @apply p-4;
}

:deep(.el-table) {
  --el-table-border-color: rgb(var(--color-border));
  --el-table-header-bg-color: rgb(var(--color-surface));
  --el-table-row-hover-bg-color: rgba(var(--color-primary), 0.05);
}
</style>
