import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAppStore } from '@/stores/appStore'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'

export const useWorkspaceStore = defineStore('workspace', () => {
  const appStore = useAppStore()
  const workspaceDataStore = useWorkspaceDataStore()
  const selectedFileId = ref<string | null>(null)
  const openFileIds = ref<string[]>([])

  const currentWorkspace = computed(() => (
    appStore.activeWorkspaceId ? workspaceDataStore.getWorkspace(appStore.activeWorkspaceId) ?? null : null
  ))

  watch(currentWorkspace, (workspace) => {
    if (!workspace) {
      selectedFileId.value = null
      openFileIds.value = []
      return
    }

    const defaultFileId = workspace.files[0]?.id ?? null
    if (!selectedFileId.value || !workspace.files.some((file) => file.id === selectedFileId.value)) {
      selectedFileId.value = defaultFileId
    }

    openFileIds.value = workspace.files.map((file) => file.id)
  }, { immediate: true })

  const openFiles = computed(() => {
    if (!currentWorkspace.value) return []
    return currentWorkspace.value.files.filter((file) => openFileIds.value.includes(file.id))
  })

  const currentFile = computed(() => (
    currentWorkspace.value?.files.find((file) => file.id === selectedFileId.value)
    ?? currentWorkspace.value?.files[0]
    ?? null
  ))

  function selectFile(fileId: string) {
    if (!currentWorkspace.value?.files.some((file) => file.id === fileId)) return
    selectedFileId.value = fileId
    if (!openFileIds.value.includes(fileId)) {
      openFileIds.value.push(fileId)
    }
  }

  function updateFileContent(fileId: string, content: string) {
    const workspace = currentWorkspace.value
    if (!workspace) return

    workspaceDataStore.updateFileContent(workspace.id, fileId, content)
  }

  function createFile() {
    const workspace = currentWorkspace.value
    if (!workspace) return null

    const created = workspaceDataStore.createFile(workspace.id)
    if (!created) return null

    openFileIds.value = [...openFileIds.value, created.id]
    selectedFileId.value = created.id
    return created
  }

  function renameFile(fileId: string, nextName: string) {
    const workspace = currentWorkspace.value
    if (!workspace) return null
    return workspaceDataStore.renameFile(workspace.id, fileId, nextName)
  }

  function deleteFile(fileId: string) {
    const workspace = currentWorkspace.value
    if (!workspace) return false

    const deleted = workspaceDataStore.deleteFile(workspace.id, fileId)
    if (!deleted) return false

    openFileIds.value = openFileIds.value.filter((id) => id !== fileId)
    if (selectedFileId.value === fileId) {
      const fallbackFile = workspaceDataStore.getWorkspace(workspace.id)?.files[0] ?? null
      selectedFileId.value = fallbackFile?.id ?? null
      if (fallbackFile && !openFileIds.value.includes(fallbackFile.id)) {
        openFileIds.value = [fallbackFile.id, ...openFileIds.value]
      }
    }

    return true
  }

  function closeFile(fileId: string) {
    if (!openFileIds.value.includes(fileId)) return

    const remainingIds = openFileIds.value.filter((id) => id !== fileId)
    openFileIds.value = remainingIds

    if (selectedFileId.value === fileId) {
      selectedFileId.value = remainingIds[remainingIds.length - 1] ?? currentWorkspace.value?.files[0]?.id ?? null
    }
  }

  return {
    currentWorkspace,
    currentFile,
    openFiles,
    selectedFileId,
    selectFile,
    updateFileContent,
    createFile,
    renameFile,
    deleteFile,
    closeFile,
  }
})
