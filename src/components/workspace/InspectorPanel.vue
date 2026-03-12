<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { exportWorkspaceToJSON } from '@/utils/export'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const appStore = useAppStore()
const workspaceStore = useWorkspaceStore()
const workspaceDataStore = useWorkspaceDataStore()

const workspace = computed(() => workspaceStore.currentWorkspace)

function updateWorkspaceField(field: 'title' | 'description', value: string) {
  if (!workspace.value) return
  workspaceDataStore.updateWorkspace(workspace.value.id, {
    [field]: value,
  })
}

function handleExportWorkspace() {
  if (!workspace.value) return
  exportWorkspaceToJSON(workspace.value)
}

function handleDeleteWorkspace() {
  if (!workspace.value) return
  workspaceDataStore.deleteWorkspace(workspace.value.id)
  appStore.closeWorkspace()
}

function updateFileName(value: string) {
  if (!workspaceStore.currentFile) return
  workspaceStore.renameFile(workspaceStore.currentFile.id, value)
}
</script>

<template>
  <aside data-section="workspace-inspector" class="inspector glass-panel">
    <span class="section-kicker">Inspector</span>
    <div class="inspector-form">
      <label class="label-block">
        <span class="label">工作区标题</span>
        <input
          :value="workspace?.title"
          data-field="workspace-title"
          type="text"
          @input="updateWorkspaceField('title', ($event.target as HTMLInputElement).value)"
        >
      </label>

      <label class="label-block">
        <span class="label">工作区描述</span>
        <textarea
          :value="workspace?.description"
          data-field="workspace-description"
          rows="4"
          @input="updateWorkspaceField('description', ($event.target as HTMLTextAreaElement).value)"
        />
      </label>
    </div>

    <div class="inspector-block">
      <span class="label">当前文件</span>
      <input
        :value="workspaceStore.currentFile?.name"
        data-field="file-name"
        type="text"
        @input="updateFileName(($event.target as HTMLInputElement).value)"
      >
      <span>{{ workspaceStore.currentFile?.path }}</span>
    </div>

    <div class="workspace-actions">
      <button type="button" class="export-button" data-action="export-workspace" @click="handleExportWorkspace">
        导出当前工作区
      </button>
      <button type="button" class="delete-button" data-action="delete-workspace" @click="handleDeleteWorkspace">
        删除工作区
      </button>
    </div>
  </aside>
</template>

<style scoped>
.inspector {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 26px;
}

.section-kicker,
.label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.inspector p,
.inspector span {
  color: var(--text-secondary);
}

.inspector-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-block input,
.label-block textarea {
  width: 100%;
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--bg-glass) 86%, transparent);
  color: var(--text-primary);
  padding: 12px 14px;
  outline: none;
}

.inspector-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inspector strong {
  color: var(--text-primary);
}

.inspector-block input {
  width: 100%;
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--bg-glass) 86%, transparent);
  color: var(--text-primary);
  padding: 10px 12px;
  outline: none;
}

.export-button {
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  background: transparent;
  color: var(--text-primary);
  padding: 12px 14px;
  cursor: pointer;
}

.workspace-actions {
  display: flex;
  gap: 10px;
}

.delete-button {
  border: 1px solid color-mix(in srgb, var(--danger-color) 36%, transparent);
  border-radius: 18px;
  background: transparent;
  color: var(--danger-color);
  padding: 12px 14px;
  cursor: pointer;
}
</style>
