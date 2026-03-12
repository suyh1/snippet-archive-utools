import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'

export type LibraryCollection = 'all' | 'starred' | 'recent'

export const useLibraryStore = defineStore('library', () => {
  const workspaceDataStore = useWorkspaceDataStore()
  const selectedWorkspaceId = ref<string>('workspace-auth')
  const searchQuery = ref('')
  const collection = ref<LibraryCollection>('all')

  const filteredWorkspaces = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return workspaceDataStore.workspaces.filter((workspace) => {
      if (collection.value === 'starred' && !workspace.starred) return false
      if (collection.value === 'recent' && !workspace.lastOpenedAt) return false

      if (!query) return true

      return (
        workspace.title.toLowerCase().includes(query) ||
        workspace.description.toLowerCase().includes(query) ||
        workspace.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
  })

  const selectedWorkspace = computed(() => (
    filteredWorkspaces.value.find((workspace) => workspace.id === selectedWorkspaceId.value)
    ?? filteredWorkspaces.value[0]
    ?? null
  ))

  function selectWorkspace(workspaceId: string) {
    selectedWorkspaceId.value = workspaceId
  }

  function setCollection(nextCollection: LibraryCollection) {
    collection.value = nextCollection
  }

  return {
    selectedWorkspaceId,
    selectedWorkspace,
    filteredWorkspaces,
    searchQuery,
    collection,
    selectWorkspace,
    setCollection,
  }
})
