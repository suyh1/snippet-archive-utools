import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { DbDoc } from '@/types'
import type { Workspace, WorkspaceFile } from '@/types/workspace'
import { workspaceDb } from '@/utils/db'
import { createBlankWorkspace, createWorkspaceSeed } from '@/lib/workspace-seed'

function toDocMap(workspaces: Workspace[]): Map<string, DbDoc<Workspace>> {
  const map = new Map<string, DbDoc<Workspace>>()
  for (const workspace of workspaces) {
    map.set(workspace.id, {
      _id: `workspace/${workspace.id}`,
      data: workspace,
    })
  }
  return map
}

export const useWorkspaceDataStore = defineStore('workspace-data', () => {
  const workspaceDocs = ref<Map<string, DbDoc<Workspace>>>(toDocMap(createWorkspaceSeed()))

  const workspaces = computed<Workspace[]>(() =>
    Array.from(workspaceDocs.value.values()).map((doc) => doc.data),
  )

  function loadWorkspaces() {
    const docs = workspaceDb.getAll()
    if (docs.length === 0) return

    const map = new Map<string, DbDoc<Workspace>>()
    for (const doc of docs) {
      map.set(doc.data.id, doc)
    }
    workspaceDocs.value = map
  }

  function saveWorkspace(workspace: Workspace): Workspace | null {
    const existing = workspaceDocs.value.get(workspace.id)
    const doc = workspaceDb.put(workspace, existing?._rev)
    if (!doc) {
      workspaceDocs.value.set(workspace.id, {
        _id: `workspace/${workspace.id}`,
        _rev: existing?._rev,
        data: workspace,
      })
      return workspace
    }
    workspaceDocs.value.set(workspace.id, doc)
    return doc.data
  }

  function createWorkspace(): Workspace | null {
    const workspace = createBlankWorkspace(uuidv4())
    return saveWorkspace(workspace)
  }

  function updateWorkspace(id: string, changes: Partial<Workspace>): Workspace | null {
    const existing = workspaceDocs.value.get(id)
    if (!existing) return null

    return saveWorkspace({
      ...existing.data,
      ...changes,
      id,
      updatedAt: Date.now(),
    })
  }

  function updateFileContent(workspaceId: string, fileId: string, content: string): Workspace | null {
    const workspace = getWorkspace(workspaceId)
    if (!workspace) return null

    return saveWorkspace({
      ...workspace,
      updatedAt: Date.now(),
      files: workspace.files.map((file) => (
        file.id === fileId ? { ...file, content } : file
      )),
    })
  }

  function createFile(workspaceId: string): WorkspaceFile | null {
    const workspace = getWorkspace(workspaceId)
    if (!workspace) return null

    const order = workspace.files.length
    const name = `untitled-${order + 1}.ts`
    const file: WorkspaceFile = {
      id: uuidv4(),
      workspaceId,
      name,
      path: `/src/${name}`,
      language: 'typescript',
      content: '',
      kind: 'file',
      order,
    }

    saveWorkspace({
      ...workspace,
      updatedAt: Date.now(),
      files: [...workspace.files, file],
    })

    return file
  }

  function renameFile(workspaceId: string, fileId: string, nextName: string): Workspace | null {
    const workspace = getWorkspace(workspaceId)
    if (!workspace) return null

    const normalizedName = nextName.trim()
    if (!normalizedName) return workspace

    return saveWorkspace({
      ...workspace,
      updatedAt: Date.now(),
      files: workspace.files.map((file) => {
        if (file.id !== fileId) return file
        const segments = file.path.split('/')
        segments[segments.length - 1] = normalizedName
        return {
          ...file,
          name: normalizedName,
          path: segments.join('/'),
        }
      }),
    })
  }

  function deleteFile(workspaceId: string, fileId: string): boolean {
    const workspace = getWorkspace(workspaceId)
    if (!workspace || workspace.files.length <= 1) return false

    saveWorkspace({
      ...workspace,
      updatedAt: Date.now(),
      files: workspace.files
        .filter((file) => file.id !== fileId)
        .map((file, index) => ({ ...file, order: index })),
    })

    return true
  }

  function importWorkspaces(workspacesToImport: Workspace[]) {
    workspacesToImport.forEach((workspace) => {
      saveWorkspace(workspace)
    })
  }

  function deleteWorkspace(id: string): boolean {
    const removed = workspaceDb.remove(id)
    workspaceDocs.value.delete(id)
    return removed || !workspaceDb.get(id)
  }

  function getWorkspace(id: string): Workspace | undefined {
    return workspaceDocs.value.get(id)?.data
  }

  function init() {
    loadWorkspaces()
  }

  return {
    workspaceDocs,
    workspaces,
    init,
    loadWorkspaces,
    saveWorkspace,
    createWorkspace,
    createFile,
    updateWorkspace,
    updateFileContent,
    renameFile,
    deleteFile,
    importWorkspaces,
    deleteWorkspace,
    getWorkspace,
  }
})
