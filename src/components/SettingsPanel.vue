<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSnippetStore } from '@/stores/snippetStore'
import { useFolderStore } from '@/stores/folderStore'
import { exportAllToJSON, importFromJSON, normalizeImportedArchive } from '@/utils/export'
import { message } from 'ant-design-vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [val: boolean] }>()

const settingsStore = useSettingsStore()
const snippetStore = useSnippetStore()
const folderStore = useFolderStore()

const fontSize = computed({
  get: () => settingsStore.settings.fontSize,
  set: (value: number) => settingsStore.updateSettings({ fontSize: value }),
})

const tabSize = computed({
  get: () => settingsStore.settings.tabSize,
  set: (value: number) => settingsStore.updateSettings({ tabSize: value }),
})

const wordWrap = computed({
  get: () => settingsStore.settings.wordWrap,
  set: (value: boolean) => settingsStore.updateSettings({ wordWrap: value }),
})

const showMinimap = computed({
  get: () => settingsStore.settings.showMinimap,
  set: (value: boolean) => settingsStore.updateSettings({ showMinimap: value }),
})

const showLineNumbers = computed({
  get: () => settingsStore.settings.showLineNumbers,
  set: (value: boolean) => settingsStore.updateSettings({ showLineNumbers: value }),
})

function handleExport() {
  exportAllToJSON(folderStore.folders, snippetStore.snippets)
  message.success('导出成功')
}

async function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    try {
      const data = await importFromJSON(file)
      const normalized = normalizeImportedArchive(data, {
        existingFolderIds: new Set(folderStore.folders.map((folder) => folder.id)),
        existingSnippetIds: new Set(snippetStore.snippets.map((snippet) => snippet.id)),
      })

      folderStore.upsertFolders(normalized.folders)
      snippetStore.upsertSnippets(normalized.snippets)
      folderStore.loadFolders()
      snippetStore.loadSnippets()

      if (folderStore.selectedType === 'snippet' && folderStore.selectedKey && !snippetStore.getSnippet(folderStore.selectedKey)) {
        folderStore.selectNode(null, null)
      }

      message.success(`导入成功：${normalized.snippets.length} 个片段，${normalized.folders.length} 个文件夹`)
    } catch {
      message.error('导入失败：文件格式无效')
    }
  }
  input.click()
}
</script>

<template>
  <a-drawer
    title="设置"
    :open="open"
    :width="320"
    @close="emit('update:open', false)"
    class="settings-drawer"
  >
    <div class="settings-section">
      <div class="section-title">编辑器</div>

      <div class="setting-item">
        <span class="setting-label">字号</span>
        <a-slider v-model:value="fontSize" :min="12" :max="24" :step="1" style="flex:1" />
        <span class="setting-value">{{ fontSize }}px</span>
      </div>

      <div class="setting-item">
        <span class="setting-label">Tab 大小</span>
        <a-radio-group v-model:value="tabSize" size="small">
          <a-radio-button :value="2">2</a-radio-button>
          <a-radio-button :value="4">4</a-radio-button>
          <a-radio-button :value="8">8</a-radio-button>
        </a-radio-group>
      </div>

      <div class="setting-item">
        <span class="setting-label">自动换行</span>
        <a-switch v-model:checked="wordWrap" size="small" />
      </div>

      <div class="setting-item">
        <span class="setting-label">Minimap</span>
        <a-switch v-model:checked="showMinimap" size="small" />
      </div>

      <div class="setting-item">
        <span class="setting-label">行号</span>
        <a-switch v-model:checked="showLineNumbers" size="small" />
      </div>
    </div>

    <div class="settings-section">
      <div class="section-title">数据管理</div>
      <div class="data-buttons">
        <a-button block @click="handleExport">导出全部数据</a-button>
        <a-button block @click="handleImport">导入数据</a-button>
      </div>
    </div>
  </a-drawer>
</template>

<style scoped>
.settings-section {
  margin-bottom: 24px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.setting-label {
  min-width: 70px;
  font-size: 13px;
  color: var(--text-secondary);
}

.setting-value {
  min-width: 40px;
  text-align: right;
  font-size: 12px;
  color: var(--text-tertiary);
}

.data-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
