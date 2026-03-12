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

import { useAppStore } from '@/stores/appStore'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

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
    {
      id: 'auth-service',
      workspaceId: 'workspace-auth',
      name: 'refresh-token.ts',
      path: '/src/refresh-token.ts',
      language: 'typescript',
      content: 'export const refresh = true',
      kind: 'file',
      order: 1,
    },
  ],
}

describe('workspace file operations', () => {
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

  it('creates a new file and selects it in the workspace store', () => {
    const appStore = useAppStore()
    const workspaceDataStore = useWorkspaceDataStore()
    workspaceDataStore.init()
    appStore.openWorkspace('workspace-auth')

    const workspaceStore = useWorkspaceStore()
    const created = workspaceStore.createFile()

    expect(created?.name).toBe('untitled-3.ts')
    expect(workspaceStore.currentFile?.id).toBe(created?.id)
    expect(workspaceDataStore.getWorkspace('workspace-auth')?.files).toHaveLength(3)
  })

  it('renames the current file and keeps its directory in path', () => {
    const appStore = useAppStore()
    const workspaceDataStore = useWorkspaceDataStore()
    workspaceDataStore.init()
    appStore.openWorkspace('workspace-auth')

    const workspaceStore = useWorkspaceStore()
    workspaceStore.selectFile('auth-service')
    workspaceStore.renameFile('auth-service', 'token-refresh.ts')

    expect(workspaceStore.currentFile?.name).toBe('token-refresh.ts')
    expect(workspaceStore.currentFile?.path).toBe('/src/token-refresh.ts')
  })

  it('deletes a file and falls back to another open file', () => {
    const appStore = useAppStore()
    const workspaceDataStore = useWorkspaceDataStore()
    workspaceDataStore.init()
    appStore.openWorkspace('workspace-auth')

    const workspaceStore = useWorkspaceStore()
    workspaceStore.selectFile('auth-service')
    const deleted = workspaceStore.deleteFile('auth-service')

    expect(deleted).toBe(true)
    expect(workspaceStore.currentFile?.id).toBe('auth-index')
    expect(workspaceDataStore.getWorkspace('workspace-auth')?.files).toHaveLength(1)
  })
})
