<script setup lang="ts">
import { computed } from 'vue'
import { TreeItem, TreeRoot } from 'reka-ui'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspaceStore = useWorkspaceStore()

const files = computed(() => workspaceStore.currentWorkspace?.files ?? [])

function handleFileSelect(fileId: string) {
  workspaceStore.selectFile(fileId)
}

function handleCreateFile() {
  workspaceStore.createFile()
}

function handleDeleteCurrentFile() {
  if (workspaceStore.currentFile) {
    workspaceStore.deleteFile(workspaceStore.currentFile.id)
  }
}
</script>

<template>
  <TreeRoot
    data-section="workspace-tree"
    class="workspace-tree glass-panel"
    :items="files"
    :get-key="(file) => file.id"
    :get-children="() => undefined"
    :model-value="workspaceStore.currentFile ?? undefined"
    @update:model-value="(file) => file && handleFileSelect(file.id)"
  >
    <template #default="{ flattenItems }">
      <div class="workspace-tree__header">
        <span class="section-kicker">Files</span>
        <div class="workspace-tree__actions">
          <button type="button" class="action-button" data-action="create-file" @click="handleCreateFile">
            新建
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
        v-slot="{ isSelected, handleSelect }"
      >
        <button
          type="button"
          class="tree-node"
          :data-active="isSelected"
          :data-file-id="item.value.id"
          @click="() => {
            handleSelect()
            handleFileSelect(item.value.id)
          }"
        >
          {{ item.value.name }}
        </button>
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
</style>
