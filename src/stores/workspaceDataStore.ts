import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { DbDoc } from '@/types'
import type { Workspace, WorkspaceFile } from '@/types/workspace'
import { workspaceDb } from '@/utils/db'
import { createBlankWorkspace, createWorkspaceSeed } from '@/lib/workspace-seed'

function getParentPath(path: string): string | null {
  const segments = path.split('/').filter(Boolean)
  if (segments.length <= 1) return null
  return `/${segments.slice(0, -1).join('/')}`
}

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

  function createFile(workspaceId: string, parentPath = '/src'): WorkspaceFile | null {
    const workspace = getWorkspace(workspaceId)
    if (!workspace) return null

    const siblingFiles = workspace.files.filter((file) => file.kind === 'file' && getParentPath(file.path) === parentPath)
    let suffix = 1
    let name = `untitled-${suffix}.ts`
    while (siblingFiles.some((file) => file.name === name)) {
      suffix += 1
      name = `untitled-${suffix}.ts`
    }

    const order = workspace.files.length
    const file: WorkspaceFile = {
      id: uuidv4(),
      workspaceId,
      name,
      path: `${parentPath}/${name}`.replace(/\/+/g, '/'),
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

  function createFolder(workspaceId: string, parentPath = '/src'): WorkspaceFile | null {
    const workspace = getWorkspace(workspaceId)
    if (!workspace) return null

    const existingFolderNames = workspace.files
      .filter((file) => file.kind === 'folder' && getParentPath(file.path) === parentPath)
      .map((file) => file.name)

    let suffix = 1
    let name = `new-folder-${suffix}`
    while (existingFolderNames.includes(name)) {
      suffix += 1
      name = `new-folder-${suffix}`
    }

    const folder: WorkspaceFile = {
      id: uuidv4(),
      workspaceId,
      name,
      path: `${parentPath}/${name}`.replace(/\/+/g, '/'),
      language: 'plaintext',
      content: '',
      kind: 'folder',
      order: workspace.files.length,
    }

    saveWorkspace({
      ...workspace,
      updatedAt: Date.now(),
      files: [...workspace.files, folder],
    })

    return folder
  }

  function renameFolder(workspaceId: string, folderPath: string, nextName: string): Workspace | null {
    const workspace = getWorkspace(workspaceId)
    if (!workspace) return null

    const normalizedName = nextName.trim()
    if (!normalizedName) return workspace

    const parentPath = getParentPath(folderPath)
    const nextPath = `${parentPath ?? ''}/${normalizedName}`.replace(/\/+/g, '/')

    return saveWorkspace({
      ...workspace,
      updatedAt: Date.now(),
      files: workspace.files.map((file) => {
        if (file.path === folderPath) {
          return {
            ...file,
            name: normalizedName,
            path: nextPath,
          }
        }

        if (file.path.startsWith(`${folderPath}/`)) {
          return {
            ...file,
            path: file.path.replace(folderPath, nextPath),
          }
        }

        return file
      }),
    })
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

  function moveNode(workspaceId: string, nodeId: string, targetFolderPath: string | null): Workspace | null {
    const workspace = getWorkspace(workspaceId)
    if (!workspace) return null

    const node = workspace.files.find((file) => file.id === nodeId)
    if (!node) return workspace

    const normalizedTarget = targetFolderPath ?? ''
    const nextBasePath = `${normalizedTarget}/${node.name}`.replace(/\/+/g, '/')

    if (node.kind === 'folder') {
      if (normalizedTarget && normalizedTarget.startsWith(node.path)) {
        return workspace
      }

      return saveWorkspace({
        ...workspace,
        updatedAt: Date.now(),
        files: workspace.files.map((file, index) => {
          if (file.id === node.id) {
            return {
              ...file,
              path: nextBasePath || `/${node.name}`,
              order: index,
            }
          }

          if (file.path.startsWith(`${node.path}/`)) {
            return {
              ...file,
              path: file.path.replace(node.path, nextBasePath || `/${node.name}`),
              order: index,
            }
          }

          return { ...file, order: index }
        }),
      })
    }

    return saveWorkspace({
      ...workspace,
      updatedAt: Date.now(),
      files: workspace.files.map((file, index) => (
        file.id === node.id
          ? {
              ...file,
              path: nextBasePath || `/${node.name}`,
              order: index,
            }
          : { ...file, order: index }
      )),
    })
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
    createFolder,
    updateWorkspace,
    updateFileContent,
    renameFile,
    renameFolder,
    deleteFile,
    moveNode,
    importWorkspaces,
    deleteWorkspace,
    getWorkspace,
  }
})
