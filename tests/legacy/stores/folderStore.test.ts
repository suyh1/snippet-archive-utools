import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const folderDocs = new Map<string, any>()
const snippetDocs = new Map<string, any>()
let revCounter = 0

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

vi.mock('@/utils/db', () => ({
  folderDb: {
    getAll: () => Array.from(folderDocs.values()).map(clone),
    get: (id: string) => clone(folderDocs.get(id) ?? null),
    put: (folder: any, rev?: string) => {
      const doc = { _id: `folder/${folder.id}`, _rev: rev ?? `rev-${++revCounter}`, data: clone(folder) }
      folderDocs.set(doc._id, doc)
      return clone(doc)
    },
    remove: (id: string) => folderDocs.delete(`folder/${id}`),
  },
  snippetDb: {
    getAll: () => Array.from(snippetDocs.values()).map(clone),
    get: (id: string) => clone(snippetDocs.get(id) ?? null),
    put: (snippet: any, rev?: string) => {
      const doc = { _id: `snippet/${snippet.id}`, _rev: rev ?? `rev-${++revCounter}`, data: clone(snippet) }
      snippetDocs.set(doc._id, doc)
      return clone(doc)
    },
    remove: (id: string) => snippetDocs.delete(`snippet/${id}`),
  },
}))

import { useFolderStore } from '@/legacy/stores/folderStore'
import { useSnippetStore } from '@/legacy/stores/snippetStore'

describe('folder store cleanup', () => {
  beforeEach(() => {
    folderDocs.clear()
    snippetDocs.clear()
    revCounter = 0
    setActivePinia(createPinia())
  })

  it('clears snippet selection and expanded keys when deleting a folder subtree', () => {
    const folderStore = useFolderStore()
    const snippetStore = useSnippetStore()
    const root = folderStore.createFolder('Root')!
    const child = folderStore.createFolder('Child', root.id)!
    const other = folderStore.createFolder('Other')!
    const snippet = snippetStore.createSnippet({ title: 'Inside', folderId: child.id })!

    folderStore.expandedKeys = [root.id, child.id, other.id]
    folderStore.selectNode(snippet.id, 'snippet')

    folderStore.deleteFolder(root.id)

    expect(folderStore.selectedKey).toBeNull()
    expect(folderStore.selectedType).toBeNull()
    expect(folderStore.expandedKeys).toEqual([other.id])
  })

  it('compacts remaining root folder orders after moving a folder away', () => {
    const folderStore = useFolderStore()
    const rootA = folderStore.createFolder('A')!
    const rootB = folderStore.createFolder('B')!
    const rootC = folderStore.createFolder('C')!

    folderStore.moveFolder(rootB.id, rootA.id)

    expect(folderStore.folders
      .filter((folder) => folder.parentId === null)
      .sort((a, b) => a.order - b.order)
      .map((folder) => ({ name: folder.name, order: folder.order }))).toEqual([
      { name: 'A', order: 0 },
      { name: 'C', order: 1 },
    ])
    expect(folderStore.getFolder(rootB.id)).toMatchObject({ parentId: rootA.id, order: 0 })
  })
})
