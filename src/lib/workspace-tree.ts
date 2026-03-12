import type { WorkspaceFile } from '@/types/workspace'

export interface WorkspaceTreeNode {
  id: string
  name: string
  path: string
  kind: 'file' | 'folder'
  order: number
  fileId?: string
  children?: WorkspaceTreeNode[]
}

export function getParentPath(path: string): string | null {
  const segments = path.split('/').filter(Boolean)
  if (segments.length <= 1) return null
  return `/${segments.slice(0, -1).join('/')}`
}

function getNodeName(path: string): string {
  const segments = path.split('/').filter(Boolean)
  return segments[segments.length - 1] ?? path
}

function compareNodes(left: WorkspaceTreeNode, right: WorkspaceTreeNode): number {
  if (left.kind !== right.kind) {
    return left.kind === 'folder' ? -1 : 1
  }

  if (left.order !== right.order) {
    return left.order - right.order
  }

  return left.name.localeCompare(right.name)
}

export function getDefaultExpandedFolderPaths(files: WorkspaceFile[]): string[] {
  const expanded = new Set<string>()

  files.forEach((file) => {
    const basePath = file.kind === 'folder' ? file.path : getParentPath(file.path)
    let currentPath = basePath

    while (currentPath) {
      expanded.add(currentPath)
      currentPath = getParentPath(currentPath)
    }
  })

  return [...expanded]
}

export function buildWorkspaceTree(files: WorkspaceFile[]): WorkspaceTreeNode[] {
  const nodeMap = new Map<string, WorkspaceTreeNode>()
  const roots: WorkspaceTreeNode[] = []

  function ensureFolderNode(path: string, orderHint: number): WorkspaceTreeNode {
    const existing = nodeMap.get(path)
    if (existing) {
      existing.order = Math.min(existing.order, orderHint)
      return existing
    }

    const folderNode: WorkspaceTreeNode = {
      id: path,
      name: getNodeName(path),
      path,
      kind: 'folder',
      order: orderHint,
      children: [],
    }

    nodeMap.set(path, folderNode)

    const parentPath = getParentPath(path)
    if (parentPath) {
      const parentNode = ensureFolderNode(parentPath, orderHint)
      parentNode.children ??= []
      if (!parentNode.children.some((child) => child.path === path)) {
        parentNode.children.push(folderNode)
      }
    } else {
      roots.push(folderNode)
    }

    return folderNode
  }

  files.forEach((file, index) => {
    const order = typeof file.order === 'number' ? file.order : index
    const parentPath = file.kind === 'folder' ? getParentPath(file.path) : getParentPath(file.path)

    if (parentPath) {
      ensureFolderNode(parentPath, order)
    }

    if (file.kind === 'folder') {
      const folderNode = ensureFolderNode(file.path, order)
      folderNode.fileId = file.id
      folderNode.name = file.name || getNodeName(file.path)
      return
    }

    const fileNode: WorkspaceTreeNode = {
      id: file.id,
      fileId: file.id,
      name: file.name,
      path: file.path,
      kind: 'file',
      order,
    }

    nodeMap.set(file.path, fileNode)

    if (parentPath) {
      const parentNode = ensureFolderNode(parentPath, order)
      parentNode.children ??= []
      parentNode.children.push(fileNode)
    } else {
      roots.push(fileNode)
    }
  })

  function sortTree(nodes: WorkspaceTreeNode[]): WorkspaceTreeNode[] {
    return [...nodes]
      .sort(compareNodes)
      .map((node) => ({
        ...node,
        children: node.children ? sortTree(node.children) : undefined,
      }))
  }

  return sortTree(roots)
}

export function findTreeNodeByFileId(
  nodes: WorkspaceTreeNode[],
  fileId: string | null,
): WorkspaceTreeNode | null {
  if (!fileId) return null

  for (const node of nodes) {
    if (node.fileId === fileId && node.kind === 'file') return node
    if (node.children) {
      const found = findTreeNodeByFileId(node.children, fileId)
      if (found) return found
    }
  }

  return null
}

export function findTreeNodeByPath(
  nodes: WorkspaceTreeNode[],
  path: string | null,
): WorkspaceTreeNode | null {
  if (!path) return null

  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children) {
      const found = findTreeNodeByPath(node.children, path)
      if (found) return found
    }
  }

  return null
}
