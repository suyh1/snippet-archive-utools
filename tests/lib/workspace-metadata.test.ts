import { describe, expect, it } from 'vitest'
import { summarizeWorkspace } from '@/lib/workspace-metadata'
import type { Workspace } from '@/types/workspace'

const workspace: Workspace = {
  id: 'workspace-auth',
  title: 'Auth Toolkit',
  description: 'workspace',
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
      content: '',
      kind: 'file',
      order: 1,
    },
    {
      id: 'file-session',
      workspaceId: 'workspace-auth',
      name: 'session.ts',
      path: '/src/core/session.ts',
      language: 'typescript',
      content: '',
      kind: 'file',
      order: 2,
    },
    {
      id: 'file-notes',
      workspaceId: 'workspace-auth',
      name: 'notes.md',
      path: '/notes.md',
      language: 'markdown',
      content: '',
      kind: 'file',
      order: 3,
    },
  ],
}

describe('summarizeWorkspace', () => {
  it('computes file/folder counts and dominant languages', () => {
    const summary = summarizeWorkspace(workspace)

    expect(summary.fileCount).toBe(3)
    expect(summary.folderCount).toBe(1)
    expect(summary.languages).toEqual([
      { language: 'typescript', count: 2 },
      { language: 'markdown', count: 1 },
    ])
    expect(summary.primaryLanguage).toBe('typescript')
  })
})
