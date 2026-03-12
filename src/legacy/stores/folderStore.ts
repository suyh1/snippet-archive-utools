import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { Folder, Snippet, TreeNode, DbDoc, FilterMode, SortMode } from '@/types'
import { folderDb } from '@/utils/db'
import { insertAtIndex, reindexItemsInDisplayOrder, sortByOrder } from '@/utils/order'
import { useSnippetStore } from './snippetStore'

function ensureValidFolder(folder: Folder): Folder {
  return {
    ...folder,
    parentId: folder.parentId ?? null,
  }
}

export const useFolderStore = defineStore('folder', () => {
  const folderDocs = ref<Map<string, DbDoc<Folder>>>(new Map())
  const expandedKeys = ref<string[]>([])
  const selectedKey = ref<string | null>(null)
  const selectedType = ref<'folder' | 'snippet' | null>(null)
  const filterMode = ref<FilterMode>('all')
  const sortMode = ref<SortMode>('updatedAt')

  const folders = computed<Folder[]>(() =>
    Array.from(folderDocs.value.values()).map((doc) => doc.data),
  )

  function foldersInParent(parentId: string | null): Folder[] {
    return sortByOrder(folders.value.filter((folder) => folder.parentId === parentId))
  }

  function persistFolder(folder: Folder): Folder | null {
    const existing = folderDocs.value.get(folder.id)
    const doc = folderDb.put(folder, existing?._rev)
    if (!doc) return null
    folderDocs.value.set(folder.id, doc)
    return doc.data
  }

  function persistOrderedFolders(orderedFolders: Folder[]): Folder[] {
    const normalized = reindexItemsInDisplayOrder(orderedFolders)
    normalized.forEach((folder) => {
      persistFolder(folder)
    })
    return normalized
  }

  function normalizeFolderOrders(parentId: string | null): Folder[] {
    return persistOrderedFolders(foldersInParent(parentId))
  }

  function getChildFolderIds(folderId: string): string[] {
    const result: string[] = [folderId]
    const children = folders.value.filter((folder) => folder.parentId === folderId)
    for (const child of children) {
      result.push(...getChildFolderIds(child.id))
    }
    return result
  }

  const folderTree = computed<TreeNode[]>(() => {
    const snippetStore = useSnippetStore()
    return buildChildren(null, snippetStore)
  })

  function shouldIncludeSnippet(
    snippet: Snippet,
    snippetStore: ReturnType<typeof useSnippetStore>,
  ): boolean {
    if (snippetStore.searchQuery.trim() && !snippetStore.filteredSnippetIds.has(snippet.id)) {
      return false
    }
    if (filterMode.value === 'starred' && !snippet.starred) return false
    if (filterMode.value !== 'all' && filterMode.value !== 'starred') {
      if (!snippet.fragments.some((fragment) => fragment.language === filterMode.value)) return false
    }
    return true
  }

  function buildChildren(
    parentId: string | null,
    snippetStore: ReturnType<typeof useSnippetStore>,
  ): TreeNode[] {
    const childFolders = foldersInParent(parentId)
    const folderNodes: TreeNode[] = []

    for (const folder of childFolders) {
      const children = buildChildren(folder.id, snippetStore)
      const hasSearch = snippetStore.searchQuery.trim().length > 0
      const hasFilter = filterMode.value !== 'all'
      if ((!hasSearch && !hasFilter) || children.length > 0) {
        folderNodes.push({
          key: folder.id,
          title: folder.name,
          type: 'folder' as const,
          children,
          data: folder,
        })
      }
    }

    let childSnippets = snippetStore.snippetsInFolder(parentId)
      .filter((snippet) => shouldIncludeSnippet(snippet, snippetStore))

    childSnippets = snippetStore.sortedSnippets(childSnippets, sortMode.value)

    const snippetNodes: TreeNode[] = childSnippets.map((snippet) => ({
      key: snippet.id,
      title: snippet.title,
      type: 'snippet' as const,
      isLeaf: true,
      starred: snippet.starred,
      data: snippet,
    }))

    return [...folderNodes, ...snippetNodes]
  }

  function buildTreeData(allSnippets: Snippet[]): TreeNode[] {
    function buildLevel(parentId: string | null): TreeNode[] {
      const folderNodes: TreeNode[] = foldersInParent(parentId).map((folder) => ({
        key: folder.id,
        title: folder.name,
        type: 'folder' as const,
        children: buildLevel(folder.id),
        data: folder,
      }))

      const childSnippets = allSnippets
        .filter((snippet) => snippet.folderId === parentId)
        .sort((left, right) => left.order - right.order)

      const snippetNodes: TreeNode[] = childSnippets.map((snippet) => ({
        key: snippet.id,
        title: snippet.title,
        type: 'snippet' as const,
        isLeaf: true,
        starred: snippet.starred,
        data: snippet,
      }))

      return [...folderNodes, ...snippetNodes]
    }

    return buildLevel(null)
  }

  function loadFolders() {
    const docs = folderDb.getAll()
    const map = new Map<string, DbDoc<Folder>>()
    for (const doc of docs) {
      map.set(doc.data.id, { ...doc, data: ensureValidFolder(doc.data) })
    }
    folderDocs.value = map
  }

  function createFolder(name: string, parentId: string | null = null): Folder | null {
    const now = Date.now()
    const folder: Folder = {
      id: uuidv4(),
      name,
      parentId,
      order: foldersInParent(parentId).length,
      createdAt: now,
      updatedAt: now,
    }

    return persistFolder(folder)
  }

  function renameFolder(id: string, newName: string): Folder | null {
    const existing = folderDocs.value.get(id)
    if (!existing) return null

    return persistFolder({
      ...existing.data,
      name: newName,
      updatedAt: Date.now(),
    })
  }

  function deleteFolder(id: string): boolean {
    const folder = getFolder(id)
    if (!folder) return false

    const allIds = getChildFolderIds(id)
    const snippetStore = useSnippetStore()
    const deletedSnippetIds = snippetStore.deleteSnippetsByFolderIds(allIds)

    for (const folderId of [...allIds].reverse()) {
      folderDb.remove(folderId)
      folderDocs.value.delete(folderId)
    }

    if (
      (selectedKey.value && allIds.includes(selectedKey.value)) ||
      (selectedKey.value && deletedSnippetIds.includes(selectedKey.value))
    ) {
      selectedKey.value = null
      selectedType.value = null
    }

    expandedKeys.value = expandedKeys.value.filter((key) => !allIds.includes(key))
    normalizeFolderOrders(folder.parentId)
    return true
  }

  function moveFolder(
    folderId: string,
    newParentId: string | null,
    targetIndex?: number,
  ): Folder | null {
    if (newParentId !== null) {
      const descendantIds = getChildFolderIds(folderId)
      if (descendantIds.includes(newParentId)) {
        console.error('Cannot move folder into its own descendant')
        return null
      }
    }

    const existing = getFolder(folderId)
    if (!existing) return null

    const sourceParentId = existing.parentId
    const movedFolder: Folder = {
      ...existing,
      parentId: newParentId,
      updatedAt: Date.now(),
    }

    if (sourceParentId === newParentId) {
      const siblings = foldersInParent(sourceParentId).filter((folder) => folder.id !== folderId)
      persistOrderedFolders(insertAtIndex(siblings, movedFolder, targetIndex ?? siblings.length))
      return getFolder(folderId) ?? movedFolder
    }

    const sourceSiblings = foldersInParent(sourceParentId).filter((folder) => folder.id !== folderId)
    const targetSiblings = foldersInParent(newParentId)
    persistOrderedFolders(insertAtIndex(targetSiblings, movedFolder, targetIndex ?? targetSiblings.length))
    persistOrderedFolders(sourceSiblings)

    return getFolder(folderId) ?? movedFolder
  }

  function reorderFolders(parentId: string | null, orderedIds: string[]) {
    const orderedFolders = orderedIds
      .map((id) => getFolder(id))
      .filter((folder): folder is Folder => Boolean(folder))
      .map((folder) => ({
        ...folder,
        parentId,
        updatedAt: Date.now(),
      }))

    persistOrderedFolders(orderedFolders)
  }

  function upsertFolders(foldersToImport: Folder[]) {
    foldersToImport.forEach((folder) => {
      persistFolder(ensureValidFolder(folder))
    })
  }

  function selectNode(key: string | null, type: 'folder' | 'snippet' | null) {
    selectedKey.value = key
    selectedType.value = type
  }

  function getFolder(id: string): Folder | undefined {
    return folderDocs.value.get(id)?.data
  }

  function init() {
    loadFolders()
  }

  return {
    folderDocs,
    expandedKeys,
    selectedKey,
    selectedType,
    filterMode,
    sortMode,
    folders,
    folderTree,
    init,
    loadFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolder,
    reorderFolders,
    upsertFolders,
    getChildFolderIds,
    buildTreeData,
    selectNode,
    getFolder,
  }
})
