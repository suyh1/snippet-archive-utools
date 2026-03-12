export interface WorkspaceFile {
  id: string
  workspaceId: string
  name: string
  path: string
  language: string
  content: string
  kind: 'file' | 'folder' | 'virtual'
  order: number
}

export interface Workspace {
  id: string
  title: string
  description: string
  tags: string[]
  starred: boolean
  files: WorkspaceFile[]
  cover?: string
  createdAt: number
  updatedAt: number
  lastOpenedAt?: number
}
