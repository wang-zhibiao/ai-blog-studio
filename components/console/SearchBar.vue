<template>
  <div class="search-bar flex flex-wrap items-center gap-3 p-3 bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))]">
    <!-- 搜索框 -->
    <div class="flex-1 min-w-[200px]">
      <el-input
        v-model="searchQuery"
        :placeholder="placeholder"
        clearable
        size="default"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 筛选器插槽 -->
    <div v-if="$slots.filters" class="flex items-center gap-2">
      <slot name="filters"></slot>
    </div>

    <!-- 视图切换 -->
    <div v-if="showViewToggle" class="flex items-center">
      <el-radio-group v-model="viewMode" size="small">
        <el-radio-button value="grid" @change="handleViewChange">
          <el-icon><Grid /></el-icon>
        </el-radio-button>
        <el-radio-button value="list" @change="handleViewChange">
          <el-icon><List /></el-icon>
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 操作按钮插槽 -->
    <div v-if="$slots.actions" class="flex items-center gap-2 ml-auto">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Grid, List } from '@element-plus/icons-vue'

interface Props {
  modelValue?: string
  placeholder?: string
  showViewToggle?: boolean
  viewMode?: 'grid' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索...',
  showViewToggle: false,
  viewMode: 'grid'
})

const emit = defineEmits(['update:modelValue', 'search', 'update:viewMode', 'viewChange'])

const searchQuery = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const viewMode = computed({
  get: () => props.viewMode,
  set: (val: 'grid' | 'list') => emit('update:viewMode', val)
})

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const handleViewChange = () => {
  emit('viewChange', viewMode.value)
}
</script>
