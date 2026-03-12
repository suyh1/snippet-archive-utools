import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { Snippet, Fragment, DbDoc, SortMode } from '@/types'
import { snippetDb } from '@/utils/db'
import { insertAtIndex, reindexItemsInDisplayOrder, sortByOrder } from '@/utils/order'

function createDefaultFragment(): Fragment {
  return {
    id: uuidv4(),
    title: '代码片段',
    code: '',
    language: 'plaintext',
  }
}

function ensureValidSnippet(snippet: Snippet): Snippet {
  const fragments = Array.isArray(snippet.fragments) && snippet.fragments.length > 0
    ? snippet.fragments
    : [createDefaultFragment()]
  const activeFragmentId = fragments.some((fragment) => fragment.id === snippet.activeFragmentId)
    ? snippet.activeFragmentId
    : fragments[0].id

  return {
    ...snippet,
    description: snippet.description ?? '',
    tags: Array.isArray(snippet.tags) ? snippet.tags : [],
    folderId: snippet.folderId ?? null,
    starred: Boolean(snippet.starred),
    fragments,
    activeFragmentId,
  }
}

export const useSnippetStore = defineStore('snippet', () => {
  const snippetDocs = ref<Map<string, DbDoc<Snippet>>>(new Map())
  const searchQuery = ref('')

  const snippets = computed<Snippet[]>(() =>
    Array.from(snippetDocs.value.values()).map((doc) => doc.data),
  )

  function snippetsInFolder(folderId: string | null): Snippet[] {
    return sortByOrder(snippets.value.filter((snippet) => snippet.folderId === folderId))
  }

  const filteredSnippets = computed<Snippet[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return snippets.value
    return snippets.value.filter((snippet) => {
      if (snippet.title.toLowerCase().includes(q)) return true
      if (snippet.description.toLowerCase().includes(q)) return true
      if (snippet.tags.some((tag) => tag.toLowerCase().includes(q))) return true
      if (snippet.fragments.some((fragment) => fragment.code.toLowerCase().includes(q))) return true
      if (snippet.fragments.some((fragment) => fragment.title.toLowerCase().includes(q))) return true
      return false
    })
  })

  const filteredSnippetIds = computed<Set<string>>(() =>
    new Set(filteredSnippets.value.map((snippet) => snippet.id)),
  )

  function sortedSnippets(list: Snippet[], mode: SortMode): Snippet[] {
    const sorted = [...list]
    switch (mode) {
      case 'updatedAt':
        return sorted.sort((left, right) => right.updatedAt - left.updatedAt)
      case 'createdAt':
        return sorted.sort((left, right) => right.createdAt - left.createdAt)
      case 'name':
        return sorted.sort((left, right) => left.title.localeCompare(right.title))
      default:
        return sorted
    }
  }

  function persistSnippet(snippet: Snippet): Snippet | null {
    const existing = snippetDocs.value.get(snippet.id)
    const doc = snippetDb.put(snippet, existing?._rev)
    if (!doc) return null
    snippetDocs.value.set(snippet.id, doc)
    return doc.data
  }

  function persistOrderedSnippets(orderedSnippets: Snippet[]): Snippet[] {
    const normalized = reindexItemsInDisplayOrder(orderedSnippets)
    normalized.forEach((snippet) => {
      persistSnippet(snippet)
    })
    return normalized
  }

  function normalizeFolderOrders(folderId: string | null): Snippet[] {
    return persistOrderedSnippets(snippetsInFolder(folderId))
  }

  function loadSnippets() {
    const docs = snippetDb.getAll()
    const map = new Map<string, DbDoc<Snippet>>()
    for (const doc of docs) {
      map.set(doc.data.id, { ...doc, data: ensureValidSnippet(doc.data) })
    }
    snippetDocs.value = map
  }

  function createSnippet(
    partial: Partial<Pick<Snippet, 'title' | 'description' | 'tags' | 'folderId'>>,
  ): Snippet | null {
    const now = Date.now()
    const folderId = partial.folderId ?? null
    const defaultFragment = createDefaultFragment()
    const snippet: Snippet = {
      id: uuidv4(),
      title: partial.title ?? '未命名片段',
      fragments: [defaultFragment],
      activeFragmentId: defaultFragment.id,
      description: partial.description ?? '',
      tags: partial.tags ?? [],
      folderId,
      starred: false,
      order: snippetsInFolder(folderId).length,
      createdAt: now,
      updatedAt: now,
    }

    return persistSnippet(snippet)
  }

  function updateSnippet(id: string, changes: Partial<Snippet>): Snippet | null {
    const existing = snippetDocs.value.get(id)
    if (!existing) return null

    return persistSnippet(ensureValidSnippet({
      ...existing.data,
      ...changes,
      id,
      updatedAt: Date.now(),
    }))
  }

  function addFragment(snippetId: string): Fragment | null {
    const snippet = getSnippet(snippetId)
    if (!snippet) return null

    const fragment: Fragment = {
      id: uuidv4(),
      title: `片段 ${snippet.fragments.length + 1}`,
      code: '',
      language: 'plaintext',
    }

    updateSnippet(snippetId, {
      fragments: [...snippet.fragments, fragment],
      activeFragmentId: fragment.id,
    })
    return fragment
  }

  function removeFragment(snippetId: string, fragmentId: string): boolean {
    const snippet = getSnippet(snippetId)
    if (!snippet || snippet.fragments.length <= 1) return false
    if (!snippet.fragments.some((fragment) => fragment.id === fragmentId)) return false

    const fragments = snippet.fragments.filter((fragment) => fragment.id !== fragmentId)
    const activeFragmentId = snippet.activeFragmentId === fragmentId
      ? fragments[0].id
      : snippet.activeFragmentId

    updateSnippet(snippetId, {
      fragments,
      activeFragmentId,
    })
    return true
  }

  function updateFragment(
    snippetId: string,
    fragmentId: string,
    changes: Partial<Pick<Fragment, 'title' | 'code' | 'language'>>,
  ): boolean {
    const snippet = getSnippet(snippetId)
    if (!snippet) return false
    if (!snippet.fragments.some((fragment) => fragment.id === fragmentId)) return false

    const fragments = snippet.fragments.map((fragment) => (
      fragment.id === fragmentId ? { ...fragment, ...changes } : fragment
    ))

    updateSnippet(snippetId, { fragments })
    return true
  }

  function setActiveFragment(snippetId: string, fragmentId: string) {
    const snippet = getSnippet(snippetId)
    if (!snippet || !snippet.fragments.some((fragment) => fragment.id === fragmentId)) return
    updateSnippet(snippetId, { activeFragmentId: fragmentId })
  }

  function toggleStar(snippetId: string): boolean {
    const snippet = getSnippet(snippetId)
    if (!snippet) return false
    updateSnippet(snippetId, { starred: !snippet.starred })
    return true
  }

  function duplicateSnippet(snippetId: string): Snippet | null {
    const original = getSnippet(snippetId)
    if (!original) return null

    const now = Date.now()
    const fragmentIdMap = new Map<string, string>()
    const fragments = original.fragments.map((fragment) => {
      const id = uuidv4()
      fragmentIdMap.set(fragment.id, id)
      return {
        ...fragment,
        id,
      }
    })

    const duplicated: Snippet = {
      ...original,
      id: uuidv4(),
      title: `${original.title} (副本)`,
      fragments,
      activeFragmentId: fragmentIdMap.get(original.activeFragmentId) ?? fragments[0].id,
      starred: false,
      createdAt: now,
      updatedAt: now,
      order: original.order + 1,
    }

    const siblings = snippetsInFolder(original.folderId)
    const insertIndex = siblings.findIndex((snippet) => snippet.id === original.id) + 1
    const ordered = insertAtIndex(siblings, duplicated, insertIndex)
    persistOrderedSnippets(ordered)

    return getSnippet(duplicated.id) ?? duplicated
  }

  function deleteSnippet(id: string): boolean {
    const snippet = getSnippet(id)
    const success = snippetDb.remove(id)
    if (!success) return false

    snippetDocs.value.delete(id)
    if (snippet) {
      normalizeFolderOrders(snippet.folderId)
    }
    return true
  }

  function deleteSnippetsByFolderIds(folderIds: string[]): string[] {
    const idSet = new Set(folderIds)
    const deletedIds: string[] = []

    for (const [id, doc] of Array.from(snippetDocs.value.entries())) {
      if (doc.data.folderId && idSet.has(doc.data.folderId)) {
        snippetDb.remove(id)
        snippetDocs.value.delete(id)
        deletedIds.push(id)
      }
    }

    return deletedIds
  }

  function moveSnippet(
    snippetId: string,
    newFolderId: string | null,
    targetIndex?: number,
  ): Snippet | null {
    const snippet = getSnippet(snippetId)
    if (!snippet) return null

    const sourceFolderId = snippet.folderId
    const nextSnippet: Snippet = {
      ...snippet,
      folderId: newFolderId,
      updatedAt: Date.now(),
    }

    if (sourceFolderId === newFolderId) {
      const siblings = snippetsInFolder(sourceFolderId).filter((item) => item.id !== snippetId)
      const ordered = insertAtIndex(siblings, nextSnippet, targetIndex ?? siblings.length)
      persistOrderedSnippets(ordered)
      return getSnippet(snippetId) ?? nextSnippet
    }

    const sourceSiblings = snippetsInFolder(sourceFolderId).filter((item) => item.id !== snippetId)
    const targetSiblings = snippetsInFolder(newFolderId)
    persistOrderedSnippets(insertAtIndex(targetSiblings, nextSnippet, targetIndex ?? targetSiblings.length))
    persistOrderedSnippets(sourceSiblings)

    return getSnippet(snippetId) ?? nextSnippet
  }

  function upsertSnippets(snippetsToImport: Snippet[]) {
    snippetsToImport.forEach((snippet) => {
      persistSnippet(ensureValidSnippet(snippet))
    })
  }

  function getSnippet(id: string): Snippet | undefined {
    return snippetDocs.value.get(id)?.data
  }

  function init() {
    loadSnippets()
  }

  return {
    snippetDocs,
    searchQuery,
    snippets,
    filteredSnippets,
    filteredSnippetIds,
    init,
    loadSnippets,
    snippetsInFolder,
    sortedSnippets,
    createSnippet,
    updateSnippet,
    addFragment,
    removeFragment,
    updateFragment,
    setActiveFragment,
    toggleStar,
    duplicateSnippet,
    deleteSnippet,
    deleteSnippetsByFolderIds,
    moveSnippet,
    upsertSnippets,
    getSnippet,
  }
})
