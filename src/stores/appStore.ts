import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type AppViewMode = 'library' | 'workspace'

export const useAppStore = defineStore('app', () => {
  const currentView = ref<AppViewMode>('library')
  const activeWorkspaceId = ref<string | null>(null)
  const showCommandPalette = ref(false)
  const showSettings = ref(false)

  const hasActiveWorkspace = computed(() => activeWorkspaceId.value !== null)

  function openWorkspace(workspaceId: string) {
    activeWorkspaceId.value = workspaceId
    currentView.value = 'workspace'
  }

  function goToLibrary() {
    currentView.value = 'library'
  }

  function closeWorkspace() {
    activeWorkspaceId.value = null
    currentView.value = 'library'
  }

  function toggleCommandPalette(open?: boolean) {
    showCommandPalette.value = typeof open === 'boolean'
      ? open
      : !showCommandPalette.value
  }

  function toggleSettings(open?: boolean) {
    showSettings.value = typeof open === 'boolean'
      ? open
      : !showSettings.value
  }

  return {
    currentView,
    activeWorkspaceId,
    showCommandPalette,
    showSettings,
    hasActiveWorkspace,
    openWorkspace,
    goToLibrary,
    closeWorkspace,
    toggleCommandPalette,
    toggleSettings,
  }
})
