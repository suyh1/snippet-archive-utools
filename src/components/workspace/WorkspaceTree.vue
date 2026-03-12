<script setup lang="ts">
import { ref } from 'vue'
import { TreeItem, TreeRoot } from 'reka-ui'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspaceStore = useWorkspaceStore()
const draggedNodeId = ref<string | null>(null)
const openMenuPath = ref<string | null>(null)

function handleCreateFile() {
  workspaceStore.createFile()
}

function handleCreateFolder() {
  workspaceStore.createFolder()
}

function handleDeleteCurrentFile() {
  if (workspaceStore.currentFile) {
    workspaceStore.deleteFile(workspaceStore.currentFile.id)
  }
}

function handleDragStart(nodeId: string) {
  draggedNodeId.value = nodeId
}

function handleDrop(targetFolderPath: string | null) {
  if (!draggedNodeId.value) return
  workspaceStore.moveNode(draggedNodeId.value, targetFolderPath)
  draggedNodeId.value = null
}

function toggleNodeMenu(path: string) {
  openMenuPath.value = openMenuPath.value === path ? null : path
}

function handleCreateFileInFolder(path: string) {
  workspaceStore.selectFolder(path)
  workspaceStore.createFile()
  openMenuPath.value = null
}

function handleCreateFolderInFolder(path: string) {
  workspaceStore.selectFolder(path)
  workspaceStore.createFolder()
  openMenuPath.value = null
}
</script>

<template>
  <TreeRoot
    data-section="workspace-tree"
    class="workspace-tree glass-panel"
    :items="workspaceStore.treeItems"
    :get-key="(node) => node.id"
    :get-children="(node) => node.children"
    :model-value="workspaceStore.currentTreeItem ?? undefined"
    :expanded="workspaceStore.expandedFolderPaths"
    @update:model-value="(node) => node?.fileId && workspaceStore.selectFile(node.fileId)"
    @update:expanded="workspaceStore.setExpandedFolders"
  >
    <template #default="{ flattenItems }">
      <div class="workspace-tree__header">
        <span class="section-kicker">Files</span>
        <div class="workspace-tree__actions">
          <button type="button" class="action-button" data-action="create-file" @click="handleCreateFile">
            新建
          </button>
          <button type="button" class="action-button" data-action="create-folder" @click="handleCreateFolder">
            文件夹
          </button>
          <button
            type="button"
            class="action-button"
            data-action="delete-current-file"
            :disabled="!workspaceStore.currentFile"
            @click="handleDeleteCurrentFile"
          >
            删除
          </button>
        </div>
      </div>

      <TreeItem
        v-for="item in flattenItems"
        :key="item._id"
        :value="item.value"
        :level="item.level"
        v-slot="{ isExpanded, isSelected, handleSelect, handleToggle }"
      >
        <div
          role="button"
          tabindex="0"
          class="tree-node"
          :data-active="isSelected"
          :data-file-id="item.value.kind === 'file' ? item.value.fileId : undefined"
          :data-folder-path="item.value.kind === 'folder' ? item.value.path : undefined"
          :draggable="item.value.kind === 'file' || item.value.kind === 'folder'"
          :style="{ paddingLeft: `${item.level * 14 + 12}px` }"
          @dragstart="handleDragStart(item.value.kind === 'file' ? (item.value.fileId ?? item.value.id) : item.value.fileId ?? item.value.id)"
          @dragover.prevent
          @drop.prevent="item.value.kind === 'folder' ? handleDrop(item.value.path) : undefined"
          @click="() => {
            if (item.value.kind === 'folder') {
              workspaceStore.selectFolder(item.value.path)
              handleToggle()
              return
            }
            handleSelect()
            if (item.value.fileId) {
              workspaceStore.selectFile(item.value.fileId)
            }
          }"
        >
          <span class="tree-node__marker">
            {{ item.value.kind === 'folder' ? (isExpanded ? '▾' : '▸') : '•' }}
          </span>
          <span class="tree-node__label">{{ item.value.name }}</span>
          <button
            type="button"
            class="tree-node__menu-trigger"
            :data-action="item.value.kind === 'folder' ? 'folder-menu' : 'file-menu'"
            @click.stop="toggleNodeMenu(item.value.path)"
          >
            ⋯
          </button>
        </div>
        <div
          v-if="openMenuPath === item.value.path"
          class="tree-node__menu glass-panel"
          :style="{ marginLeft: `${item.level * 14 + 34}px` }"
        >
          <template v-if="item.value.kind === 'folder'">
            <button type="button" class="menu-item" @click="handleCreateFileInFolder(item.value.path)">新建文件</button>
            <button type="button" class="menu-item" @click="handleCreateFolderInFolder(item.value.path)">新建子文件夹</button>
          </template>
          <template v-else>
            <button type="button" class="menu-item" @click="workspaceStore.closeFile(item.value.fileId!)">关闭标签</button>
            <button type="button" class="menu-item" @click="workspaceStore.deleteFile(item.value.fileId!)">删除文件</button>
          </template>
        </div>
      </TreeItem>
    </template>
  </TreeRoot>
</template>

<style scoped>
.workspace-tree {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 26px;
}

.workspace-tree__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.workspace-tree__actions {
  display: flex;
  gap: 8px;
}

.section-kicker {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.action-button {
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  padding: 8px 12px;
  cursor: pointer;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  padding: 12px 14px;
  border-radius: 16px;
  cursor: pointer;
}

.tree-node[data-active='true'] {
  color: var(--text-primary);
  background: color-mix(in srgb, var(--bg-glass-strong) 84%, var(--primary) 12%);
  border-color: color-mix(in srgb, var(--primary) 35%, transparent);
  box-shadow: var(--glow-accent);
}

.tree-node__marker {
  width: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.tree-node__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node__menu-trigger {
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.tree-node__menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border-radius: 16px;
  margin-top: 6px;
}

.menu-item {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  text-align: left;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
}

.menu-item:hover {
  background: color-mix(in srgb, var(--bg-glass-strong) 84%, var(--primary) 10%);
  color: var(--text-primary);
}
</style>
