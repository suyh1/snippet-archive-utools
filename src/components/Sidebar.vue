<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  PlusOutlined,
  FolderAddOutlined,
  SettingOutlined,
  SearchOutlined,
  StarFilled,
  CodeOutlined,
} from '@ant-design/icons-vue'
import FolderTree from './FolderTree.vue'
import SettingsPanel from './SettingsPanel.vue'
import { useFolderStore } from '@/stores/folderStore'
import { useSnippetStore } from '@/stores/snippetStore'
import { SUPPORTED_LANGUAGES } from '@/types'
import type { FilterMode, SortMode } from '@/types'

const folderStore = useFolderStore()
const snippetStore = useSnippetStore()

const folderTreeRef = ref<InstanceType<typeof FolderTree> | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const showSettings = ref(false)

// Sidebar width (resizable)
const sidebarWidth = ref(280)
const isResizing = ref(false)

// Filter & sort
const filterMode = computed({
  get: () => folderStore.filterMode,
  set: (v: FilterMode) => { folderStore.filterMode = v },
})
const sortMode = computed({
  get: () => folderStore.sortMode,
  set: (v: SortMode) => { folderStore.sortMode = v },
})

const snippetCount = computed(() => snippetStore.snippets.length)

// Sort options
const sortOptions = [
  { label: '最近修改', value: 'updatedAt' },
  { label: '名称', value: 'name' },
  { label: '创建时间', value: 'createdAt' },
]

// Language filter options
const usedLanguages = computed(() => {
  const langSet = new Set<string>()
  for (const s of snippetStore.snippets) {
    for (const f of s.fragments) {
      if (f.language !== 'plaintext') langSet.add(f.language)
    }
  }
  return SUPPORTED_LANGUAGES.filter(l => langSet.has(l.value))
})

function handleSelect(key: string, type: 'folder' | 'snippet') {
  folderStore.selectNode(key, type)
}

function handleCreateFolder() {
  folderStore.createFolder('新建文件夹', null)
}

function handleCreateSnippet() {
  const folderId = folderStore.selectedType === 'folder' ? folderStore.selectedKey : null
  const snippet = snippetStore.createSnippet({ folderId })
  if (snippet) {
    folderStore.selectNode(snippet.id, 'snippet')
  }
}

function focusSearch() {
  searchInputRef.value?.focus()
}

function startRenameForSelected() {
  folderTreeRef.value?.startRenameForSelected()
}

// Resize handling
function onResizeStart(e: MouseEvent) {
  isResizing.value = true
  const startX = e.clientX
  const startWidth = sidebarWidth.value

  function onMouseMove(e: MouseEvent) {
    const newWidth = startWidth + (e.clientX - startX)
    sidebarWidth.value = Math.max(200, Math.min(500, newWidth))
  }
  function onMouseUp() {
    isResizing.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// Expose for shortcuts
defineExpose({ focusSearch, startRenameForSelected, handleCreateSnippet, handleCreateFolder })
</script>

<template>
  <div class="sidebar" :style="{ width: sidebarWidth + 'px' }">
    <!-- Search bar -->
    <div class="sidebar-header">
      <a-input
        ref="searchInputRef"
        v-model:value="snippetStore.searchQuery"
        placeholder="搜索片段..."
        allow-clear
        size="small"
      >
        <template #prefix><SearchOutlined style="color: var(--text-tertiary)" /></template>
      </a-input>
      <a-button size="small" type="text" @click="showSettings = true">
        <template #icon><SettingOutlined /></template>
      </a-button>
    </div>

    <!-- Filter & Sort -->
    <div class="filter-row">
      <a-radio-group v-model:value="filterMode" size="small" button-style="solid">
        <a-radio-button value="all">全部</a-radio-button>
        <a-radio-button value="starred"><StarFilled /> 收藏</a-radio-button>
      </a-radio-group>
      <a-dropdown :trigger="['click']">
        <a-button size="small" type="text" title="按语言过滤">
          <template #icon><CodeOutlined /></template>
        </a-button>
        <template #overlay>
          <a-menu @click="({ key }: { key: string }) => { filterMode = key === filterMode ? 'all' : key }">
            <a-menu-item v-for="lang in usedLanguages" :key="lang.value">
              {{ lang.label }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-select
        v-model:value="sortMode"
        :options="sortOptions"
        size="small"
        style="width: 100px; margin-left: auto"
      />
    </div>

    <!-- Tree -->
    <FolderTree
      ref="folderTreeRef"
      :tree-data="folderStore.folderTree"
      :expanded-keys="folderStore.expandedKeys"
      :selected-keys="folderStore.selectedKey ? [folderStore.selectedKey] : []"
      @update:expanded-keys="folderStore.expandedKeys = $event"
      @update:selected-keys="(keys: string[]) => { if (!keys.length) folderStore.selectNode(null, null) }"
      @select="handleSelect"
    />

    <!-- Bottom bar -->
    <div class="sidebar-footer">
      <div class="footer-actions">
        <a-button size="small" type="text" @click="handleCreateFolder">
          <template #icon><FolderAddOutlined /></template>
          文件夹
        </a-button>
        <a-button size="small" type="primary" @click="handleCreateSnippet">
          <template #icon><PlusOutlined /></template>
          新建片段
        </a-button>
      </div>
      <div class="snippet-count">共 {{ snippetCount }} 个片段</div>
    </div>

    <!-- Resize handle -->
    <div class="resize-handle" @mousedown="onResizeStart" />

    <!-- Settings panel -->
    <SettingsPanel v-model:open="showSettings" />
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  position: relative;
  min-width: 200px;
  max-width: 500px;
  transition: background 0.2s;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 8px 4px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--border-color);
}
.sidebar-footer {
  flex-shrink: 0;
  padding: 8px;
  border-top: 1px solid var(--border-color);
}
.footer-actions {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}
.snippet-count {
  font-size: 11px;
  color: var(--text-tertiary);
  text-align: center;
}
.resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
}
.resize-handle:hover {
  background: var(--accent-color);
  opacity: 0.3;
}
</style>
