import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAppStore } from '@/stores/appStore'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'
import {
  buildWorkspaceTree,
  findTreeNodeByFileId,
  findTreeNodeByPath,
  getDefaultExpandedFolderPaths,
  getParentPath,
} from '@/lib/workspace-tree'

export const useWorkspaceStore = defineStore('workspace', () => {
  const appStore = useAppStore()
  const workspaceDataStore = useWorkspaceDataStore()
  const selectedFileId = ref<string | null>(null)
  const selectedFolderPath = ref<string | null>(null)
  const openFileIds = ref<string[]>([])
  const expandedFolderPaths = ref<string[]>([])

  const currentWorkspace = computed(() => (
    appStore.activeWorkspaceId ? workspaceDataStore.getWorkspace(appStore.activeWorkspaceId) ?? null : null
  ))

  watch(currentWorkspace, (workspace) => {
    if (!workspace) {
      selectedFileId.value = null
      selectedFolderPath.value = null
      openFileIds.value = []
      return
    }

    const defaultFileId = workspace.files[0]?.id ?? null
    if (!selectedFileId.value || !workspace.files.some((file) => file.id === selectedFileId.value)) {
      selectedFileId.value = defaultFileId
    }

    openFileIds.value = workspace.files.map((file) => file.id)
    expandedFolderPaths.value = getDefaultExpandedFolderPaths(workspace.files)
  }, { immediate: true })

  const treeItems = computed(() => (
    currentWorkspace.value ? buildWorkspaceTree(currentWorkspace.value.files) : []
  ))

  const openFiles = computed(() => {
    if (!currentWorkspace.value) return []
    return currentWorkspace.value.files.filter((file) => openFileIds.value.includes(file.id))
  })

  const currentFile = computed(() => (
    currentWorkspace.value?.files.find((file) => file.id === selectedFileId.value)
    ?? currentWorkspace.value?.files[0]
    ?? null
  ))

  const currentTreeItem = computed(() => (
    selectedFolderPath.value
      ? findTreeNodeByPath(treeItems.value, selectedFolderPath.value)
      : findTreeNodeByFileId(treeItems.value, selectedFileId.value)
  ))

  function selectFile(fileId: string) {
    if (!currentWorkspace.value?.files.some((file) => file.id === fileId)) return
    selectedFileId.value = fileId
    selectedFolderPath.value = null
    if (!openFileIds.value.includes(fileId)) {
      openFileIds.value.push(fileId)
    }
  }

  function selectFolder(path: string) {
    selectedFolderPath.value = path
  }

  function updateFileContent(fileId: string, content: string) {
    const workspace = currentWorkspace.value
    if (!workspace) return

    workspaceDataStore.updateFileContent(workspace.id, fileId, content)
  }

  function createFile() {
    const workspace = currentWorkspace.value
    if (!workspace) return null

    const targetParentPath = selectedFolderPath.value
      ?? (currentFile.value ? getParentPath(currentFile.value.path) : null)
      ?? '/src'

    const created = workspaceDataStore.createFile(workspace.id, targetParentPath)
    if (!created) return null

    openFileIds.value = [...openFileIds.value, created.id]
    selectedFileId.value = created.id
    selectedFolderPath.value = null
    return created
  }

  function createFolder() {
    const workspace = currentWorkspace.value
    if (!workspace) return null

    const targetParentPath = selectedFolderPath.value
      ?? (currentFile.value ? getParentPath(currentFile.value.path) : null)
      ?? '/src'

    const created = workspaceDataStore.createFolder(workspace.id, targetParentPath)
    if (!created) return null

    expandedFolderPaths.value = [...new Set([...expandedFolderPaths.value, targetParentPath, created.path])]
    selectedFolderPath.value = created.path
    return created
  }

  function renameFile(fileId: string, nextName: string) {
    const workspace = currentWorkspace.value
    if (!workspace) return null
    return workspaceDataStore.renameFile(workspace.id, fileId, nextName)
  }

  function renameFolder(folderPath: string, nextName: string) {
    const workspace = currentWorkspace.value
    if (!workspace) return null

    const parentPath = getParentPath(folderPath)
    const normalizedName = nextName.trim()
    const nextPath = `${parentPath ?? ''}/${normalizedName}`.replace(/\/+/g, '/')
    const updated = workspaceDataStore.renameFolder(workspace.id, folderPath, nextName)
    if (updated && selectedFolderPath.value === folderPath) {
      selectedFolderPath.value = nextPath
    }
    expandedFolderPaths.value = expandedFolderPaths.value.map((path) => (
      path === folderPath || path.startsWith(`${folderPath}/`)
        ? path.replace(folderPath, nextPath)
        : path
    ))
    return updated
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

  function moveNode(nodeId: string, targetFolderPath: string | null) {
    const workspace = currentWorkspace.value
    if (!workspace) return null

    const moved = workspaceDataStore.moveNode(workspace.id, nodeId, targetFolderPath)
    if (!moved) return null

    if (selectedFolderPath.value && targetFolderPath !== selectedFolderPath.value) {
      const currentFolderStillExists = moved.files.some(
        (file) => file.kind === 'folder' && file.path === selectedFolderPath.value,
      )
      if (!currentFolderStillExists) {
        selectedFolderPath.value = null
      }
    }

    return moved
  }

  function setExpandedFolders(paths: string[]) {
    expandedFolderPaths.value = paths
  }

  return {
    currentWorkspace,
    currentFile,
    currentTreeItem,
    treeItems,
    openFiles,
    selectedFileId,
    selectedFolderPath,
    expandedFolderPaths,
    selectFile,
    selectFolder,
    updateFileContent,
    createFile,
    createFolder,
    renameFile,
    renameFolder,
    deleteFile,
    closeFile,
    moveNode,
    setExpandedFolders,
  }
})
