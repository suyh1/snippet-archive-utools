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

import { useSnippetStore } from '@/stores/snippetStore'

function orders(store: ReturnType<typeof useSnippetStore>, folderId: string | null = null) {
  return store.snippetsInFolder(folderId).map((snippet) => ({ title: snippet.title, order: snippet.order }))
}

describe('snippet store ordering', () => {
  beforeEach(() => {
    folderDocs.clear()
    snippetDocs.clear()
    revCounter = 0
    setActivePinia(createPinia())
  })

  it('reindexes siblings after duplicating a snippet', () => {
    const store = useSnippetStore()
    store.createSnippet({ title: 'A' })
    const middle = store.createSnippet({ title: 'B' })!
    store.createSnippet({ title: 'C' })

    store.duplicateSnippet(middle.id)

    expect(orders(store)).toEqual([
      { title: 'A', order: 0 },
      { title: 'B', order: 1 },
      { title: 'B (副本)', order: 2 },
      { title: 'C', order: 3 },
    ])
  })

  it('compacts remaining orders after deleting a snippet', () => {
    const store = useSnippetStore()
    store.createSnippet({ title: 'A' })
    const middle = store.createSnippet({ title: 'B' })!
    store.createSnippet({ title: 'C' })

    store.deleteSnippet(middle.id)

    expect(orders(store)).toEqual([
      { title: 'A', order: 0 },
      { title: 'C', order: 1 },
    ])
  })

  it('compacts the source folder when moving a snippet to another folder', () => {
    const store = useSnippetStore()
    const moved = store.createSnippet({ title: 'A', folderId: 'source' })!
    store.createSnippet({ title: 'B', folderId: 'source' })
    store.createSnippet({ title: 'C', folderId: 'target' })

    store.moveSnippet(moved.id, 'target')

    expect(orders(store, 'source')).toEqual([{ title: 'B', order: 0 }])
    expect(orders(store, 'target')).toEqual([
      { title: 'C', order: 0 },
      { title: 'A', order: 1 },
    ])
  })
})
