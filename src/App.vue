<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useEditorStore } from '@/stores/editorStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'
import { exportWorkspaceToJSON } from '@/utils/export'
import { registerShortcuts, unregisterShortcuts } from '@/utils/shortcuts'
import AppShell from '@/components/app/AppShell.vue'

const appStore = useAppStore()
const editorStore = useEditorStore()
const settingsStore = useSettingsStore()
const workspaceStore = useWorkspaceStore()
const workspaceDataStore = useWorkspaceDataStore()

onMounted(() => {
  settingsStore.loadSettings()
  workspaceDataStore.init()

  registerShortcuts({
    newWorkspace: () => {
      const workspace = workspaceDataStore.createWorkspace()
      if (workspace) {
        appStore.openWorkspace(workspace.id)
      }
    },
    focusSearch: () => {
      document.querySelector<HTMLInputElement>('[data-library-search]')?.focus()
    },
    toggleCommandPalette: () => appStore.toggleCommandPalette(),
    toggleSettings: () => appStore.toggleSettings(),
    save: () => {
      if (workspaceStore.currentFile) {
        editorStore.markSaved(workspaceStore.currentFile.id)
      }
    },
    exportWorkspace: () => {
      if (workspaceStore.currentWorkspace) {
        exportWorkspaceToJSON(workspaceStore.currentWorkspace)
      }
    },
    rename: () => {},
    deleteItem: () => {},
  })
})

onUnmounted(() => {
  unregisterShortcuts()
})
</script>

<template>
  <AppShell />
</template>

<style scoped>
</style>
