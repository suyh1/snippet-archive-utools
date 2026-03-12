<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useEditorStore } from '@/stores/editorStore'
import { exportWorkspaceToJSON } from '@/utils/export'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const appStore = useAppStore()
const workspaceStore = useWorkspaceStore()
const editorStore = useEditorStore()

const title = computed(() => workspaceStore.currentWorkspace?.title ?? 'Workspace')
const saveLabel = computed(() => (
  editorStore.currentSaveState === 'dirty' ? '未保存' : '已保存'
))

function handleCreateFile() {
  workspaceStore.createFile()
}

function handleSave() {
  if (workspaceStore.currentFile) {
    editorStore.markSaved(workspaceStore.currentFile.id)
  }
}

function handleExport() {
  if (workspaceStore.currentWorkspace) {
    exportWorkspaceToJSON(workspaceStore.currentWorkspace)
  }
}
</script>

<template>
  <header class="workspace-header glass-panel">
    <div>
      <span class="workspace-kicker">Workspace View</span>
      <h2>{{ title }}</h2>
    </div>

    <div class="workspace-actions">
      <span class="save-pill">{{ saveLabel }}</span>
      <button type="button" class="header-action" data-action="header-create-file" @click="handleCreateFile">
        新建文件
      </button>
      <button type="button" class="header-action" data-action="header-save" @click="handleSave">
        保存
      </button>
      <button type="button" class="header-action" data-action="header-export" @click="handleExport">
        导出
      </button>
      <button type="button" class="back-button" @click="appStore.goToLibrary()">
        返回资料库
      </button>
    </div>
  </header>
</template>

<style scoped>
.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 28px;
  box-shadow: var(--shadow-soft);
}

.workspace-kicker {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.workspace-header h2 {
  font-size: 28px;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.workspace-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-pill {
  border-radius: 999px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--bg-glass) 86%, transparent);
  color: var(--text-secondary);
  font-size: 12px;
}

.header-action,
.back-button {
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: var(--bg-glass);
  color: var(--text-primary);
  padding: 10px 14px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.header-action:hover,
.back-button:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--primary) 40%, transparent);
}
</style>
