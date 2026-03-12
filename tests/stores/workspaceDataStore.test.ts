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
      id: 'auth-index',
      workspaceId: 'workspace-auth',
      name: 'auth.ts',
      path: '/src/auth.ts',
      language: 'typescript',
      content: 'export const auth = true',
      kind: 'file',
      order: 0,
    },
  ],
}

describe('workspace data store', () => {
  beforeEach(() => {
    workspaceDocs.clear()
    revCounter = 0
    setActivePinia(createPinia())
  })

  it('loads workspaces from storage', () => {
    workspaceDocs.set('workspace/workspace-auth', {
      _id: 'workspace/workspace-auth',
      _rev: 'rev-1',
      data: clone(storedWorkspace),
    })

    const store = useWorkspaceDataStore()
    store.init()

    expect(store.workspaces).toEqual([storedWorkspace])
  })

  it('updates a file content and persists the workspace document', () => {
    workspaceDocs.set('workspace/workspace-auth', {
      _id: 'workspace/workspace-auth',
      _rev: 'rev-1',
      data: clone(storedWorkspace),
    })

    const store = useWorkspaceDataStore()
    store.init()
    store.updateFileContent('workspace-auth', 'auth-index', 'export const auth = false')

    expect(store.getWorkspace('workspace-auth')?.files[0]?.content).toBe('export const auth = false')
    expect(workspaceDocs.get('workspace/workspace-auth')?.data.files[0]?.content).toBe('export const auth = false')
  })

  it('deletes a workspace document', () => {
    workspaceDocs.set('workspace/workspace-auth', {
      _id: 'workspace/workspace-auth',
      _rev: 'rev-1',
      data: clone(storedWorkspace),
    })

    const store = useWorkspaceDataStore()
    store.init()
    const deleted = store.deleteWorkspace('workspace-auth')

    expect(deleted).toBe(true)
    expect(store.getWorkspace('workspace-auth')).toBeUndefined()
  })
})
