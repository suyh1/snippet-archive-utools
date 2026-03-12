import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useWorkspaceStore } from '@/stores/workspaceStore'

export const useEditorStore = defineStore('editor', () => {
  const workspaceStore = useWorkspaceStore()
  const dirtyFileIds = ref<string[]>([])

  const currentSaveState = computed(() => {
    const fileId = workspaceStore.currentFile?.id
    if (!fileId) return 'saved'
    return dirtyFileIds.value.includes(fileId) ? 'dirty' : 'saved'
  })

  function markDirty(fileId: string) {
    if (!dirtyFileIds.value.includes(fileId)) {
      dirtyFileIds.value = [...dirtyFileIds.value, fileId]
    }
  }

  function markSaved(fileId: string) {
    dirtyFileIds.value = dirtyFileIds.value.filter((id) => id !== fileId)
  }

  function isDirty(fileId: string) {
    return dirtyFileIds.value.includes(fileId)
  }

  return {
    dirtyFileIds,
    currentSaveState,
    markDirty,
    markSaved,
    isDirty,
  }
})
