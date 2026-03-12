<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'
import { EDITOR_THEMES } from '@/utils/themes'
import { exportWorkspacesToJSON, importWorkspaceArchiveFromJSONWithOptions } from '@/utils/export'
import { computed } from 'vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const settingsStore = useSettingsStore()
const workspaceDataStore = useWorkspaceDataStore()

const theme = computed({
  get: () => settingsStore.settings.theme,
  set: (value: string) => settingsStore.updateSettings({ theme: value }),
})

const fontSize = computed({
  get: () => settingsStore.settings.fontSize,
  set: (value: number | string) => settingsStore.updateSettings({ fontSize: Number(value) }),
})

const tabSize = computed({
  get: () => settingsStore.settings.tabSize,
  set: (value: number | string) => settingsStore.updateSettings({ tabSize: Number(value) }),
})

const wordWrap = computed({
  get: () => settingsStore.settings.wordWrap,
  set: (value: boolean) => settingsStore.updateSettings({ wordWrap: value }),
})

const showLineNumbers = computed({
  get: () => settingsStore.settings.showLineNumbers,
  set: (value: boolean) => settingsStore.updateSettings({ showLineNumbers: value }),
})

function handleExport() {
  exportWorkspacesToJSON(workspaceDataStore.workspaces)
}

async function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    const imported = await importWorkspaceArchiveFromJSONWithOptions(file, {
      existingWorkspaceIds: new Set(workspaceDataStore.workspaces.map((workspace) => workspace.id)),
    })

    workspaceDataStore.importWorkspaces(imported.workspaces)
  }
  input.click()
}
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="overlay" @click="emit('update:open', false)">
      <aside class="sheet glass-panel-strong" @click.stop data-overlay="settings">
        <div class="sheet-header">
          <div>
            <span class="eyebrow">Settings</span>
            <h2>工作台设置</h2>
          </div>

          <button type="button" class="close" @click="emit('update:open', false)">关闭</button>
        </div>

        <div class="setting">
          <label for="theme-select">当前主题</label>
          <select id="theme-select" v-model="theme" data-setting="theme">
            <option v-for="themeOption in EDITOR_THEMES" :key="themeOption.value" :value="themeOption.value">
              {{ themeOption.label }}
            </option>
          </select>
        </div>

        <div class="setting">
          <label for="font-size-input">字号</label>
          <div class="setting-inline">
            <input
              id="font-size-input"
              v-model="fontSize"
              data-setting="font-size"
              type="range"
              min="12"
              max="22"
            >
            <strong>{{ settingsStore.settings.fontSize }}px</strong>
          </div>
        </div>

        <div class="setting">
          <label for="tab-size-input">Tab 大小</label>
          <select id="tab-size-input" v-model="tabSize">
            <option :value="2">2</option>
            <option :value="4">4</option>
            <option :value="8">8</option>
          </select>
        </div>

        <div class="setting">
          <span>自动换行</span>
          <input v-model="wordWrap" type="checkbox">
        </div>

        <div class="setting">
          <span>显示行号</span>
          <input v-model="showLineNumbers" type="checkbox">
        </div>

        <div class="actions">
          <button type="button" class="action-button" data-action="export-workspaces" @click="handleExport">
            导出工作区
          </button>
          <button type="button" class="action-button" @click="handleImport">
            导入工作区
          </button>
        </div>
      </aside>
    </div>
  </teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(6, 10, 18, 0.32);
  display: flex;
  justify-content: flex-end;
  z-index: 45;
}

.sheet {
  width: min(420px, calc(100vw - 24px));
  margin: 12px;
  border-radius: 32px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sheet-header h2 {
  color: var(--text-primary);
  font-size: 24px;
}

.close {
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-primary);
  padding: 8px 12px;
  cursor: pointer;
}

.setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--bg-glass) 86%, transparent);
}

.setting span {
  color: var(--text-secondary);
}

.setting label {
  color: var(--text-secondary);
}

.setting select,
.setting input[type='range'] {
  width: 100%;
}

.setting strong {
  color: var(--text-primary);
}

.setting-inline {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
}

.actions {
  display: flex;
  gap: 10px;
}

.action-button {
  flex: 1;
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  background: transparent;
  color: var(--text-primary);
  padding: 12px 14px;
  cursor: pointer;
}
</style>
