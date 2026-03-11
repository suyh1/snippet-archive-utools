<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useFolderStore } from '@/stores/folderStore'
import { useSnippetStore } from '@/stores/snippetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { registerShortcuts, unregisterShortcuts } from '@/utils/shortcuts'
import Sidebar from '@/components/Sidebar.vue'
import SnippetEditor from '@/components/SnippetEditor.vue'
import EmptyState from '@/components/EmptyState.vue'

const folderStore = useFolderStore()
const snippetStore = useSnippetStore()
const settingsStore = useSettingsStore()

const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const editorRef = ref<InstanceType<typeof SnippetEditor> | null>(null)

async function loadData() {
  settingsStore.loadSettings()
  await Promise.all([folderStore.init(), snippetStore.init()])
}

onMounted(() => {
  loadData()

  registerShortcuts({
    newSnippet: () => sidebarRef.value?.handleCreateSnippet(),
    newFolder: () => sidebarRef.value?.handleCreateFolder(),
    focusSearch: () => sidebarRef.value?.focusSearch(),
    duplicateSnippet: () => {
      if (folderStore.selectedType === 'snippet' && folderStore.selectedKey) {
        snippetStore.duplicateSnippet(folderStore.selectedKey)
      }
    },
    save: () => editorRef.value?.forceSave(),
    exportSnippet: () => editorRef.value?.handleExportFragment(),
    rename: () => sidebarRef.value?.startRenameForSelected(),
    deleteItem: () => {
      if (folderStore.selectedType === 'snippet' && folderStore.selectedKey) {
        editorRef.value?.handleDelete()
      }
    },
  })

  if (window.utools) {
    window.utools.onPluginEnter(() => { loadData() })
    window.utools.onPluginOut(() => { editorRef.value?.forceSave(true) })
  }
})

onUnmounted(() => {
  unregisterShortcuts()
})
</script>

<template>
  <div class="app-container">
    <Sidebar ref="sidebarRef" />
    <div class="main-content">
      <SnippetEditor v-if="folderStore.selectedType === 'snippet'" ref="editorRef" />
      <EmptyState v-else />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg-primary);
  transition: background 0.2s;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
