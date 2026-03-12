import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Workspace } from '@/types/workspace'

const workspaceDocs = new Map<string, any>()
let revCounter = 0

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

vi.mock('@/utils/db', () => ({
  workspaceDb: {
    getAll: () => Array.from(workspaceDocs.values()).map(clone),
    get: (id: string) => clone(workspaceDocs.get(`workspace/${id}`) ?? null),
    put: (workspace: Workspace, rev?: string) => {
      const doc = { _id: `workspace/${workspace.id}`, _rev: rev ?? `rev-${++revCounter}`, data: clone(workspace) }
      workspaceDocs.set(doc._id, doc)
      return clone(doc)
    },
    remove: (id: string) => workspaceDocs.delete(`workspace/${id}`),
  },
}))

import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'

const storedWorkspace: Workspace = {
  id: 'workspace-auth',
  title: 'Auth Toolkit',
  description: 'stored workspace',
  tags: ['auth'],
  starred: true,
  createdAt: 1,
  updatedAt: 2,
  files: [
    {
      id: 'folder-core',
      workspaceId: 'workspace-auth',
      name: 'core',
      path: '/src/core',
      language: 'plaintext',
      content: '',
      kind: 'folder',
      order: 0,
    },
    {
      id: 'file-auth',
      workspaceId: 'workspace-auth',
      name: 'auth.ts',
      path: '/src/auth.ts',
      language: 'typescript',
      content: 'export const auth = true',
      kind: 'file',
      order: 1,
    },
    {
      id: 'file-core',
      workspaceId: 'workspace-auth',
      name: 'session.ts',
      path: '/src/core/session.ts',
      language: 'typescript',
      content: 'export const session = true',
      kind: 'file',
      order: 2,
    },
  ],
}

describe('workspace move operations', () => {
  beforeEach(() => {
    workspaceDocs.clear()
    revCounter = 0
    workspaceDocs.set('workspace/workspace-auth', {
      _id: 'workspace/workspace-auth',
      _rev: 'rev-1',
      data: clone(storedWorkspace),
    })
    setActivePinia(createPinia())
  })

  it('moves a file into a target folder', () => {
    const store = useWorkspaceDataStore()
    store.init()

    store.moveNode('workspace-auth', 'file-auth', '/src/core')

    expect(store.getWorkspace('workspace-auth')?.files.find((file) => file.id === 'file-auth')?.path)
      .toBe('/src/core/auth.ts')
  })

  it('moves a folder and rewrites descendant paths', () => {
    const store = useWorkspaceDataStore()
    store.init()

    store.moveNode('workspace-auth', 'folder-core', null)

    const workspace = store.getWorkspace('workspace-auth')
    expect(workspace?.files.find((file) => file.id === 'folder-core')?.path).toBe('/core')
    expect(workspace?.files.find((file) => file.id === 'file-core')?.path).toBe('/core/session.ts')
  })
})
