import { describe, expect, it, vi } from 'vitest'
import {
  exportWorkspaceToJSON,
  importWorkspaceArchiveFromJSON,
  normalizeWorkspaceArchive,
} from '@/utils/export'
import type { Workspace } from '@/types/workspace'

const workspaceFixture: Workspace = {
  id: 'workspace-auth',
  title: 'Auth Toolkit',
  description: 'auth flows',
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

describe('workspace export utilities', () => {
  it('normalizes imported workspace archives and remaps conflicting ids', () => {
    const normalized = normalizeWorkspaceArchive(
      {
        version: 1,
        exportedAt: '2026-03-12T00:00:00.000Z',
        workspaces: [workspaceFixture],
      },
      {
        existingWorkspaceIds: new Set(['workspace-auth']),
        generateId: (() => {
          let count = 0
          return () => `generated-${++count}`
        })(),
      },
    )

    expect(normalized.workspaces[0].id).toBe('generated-1')
    expect(normalized.workspaces[0].files[0]?.workspaceId).toBe('generated-1')
  })

  it('exports a single workspace archive through download flow', () => {
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:workspace')
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    exportWorkspaceToJSON(workspaceFixture)

    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(appendChildSpy).toHaveBeenCalledTimes(1)
    expect(removeChildSpy).toHaveBeenCalledTimes(1)

    clickSpy.mockRestore()
    createObjectUrlSpy.mockRestore()
    revokeSpy.mockRestore()
  })

  it('imports workspace archives from json files', async () => {
    const file = new File(
      [JSON.stringify({ version: 1, exportedAt: '2026-03-12T00:00:00.000Z', workspaces: [workspaceFixture] })],
      'workspace.json',
      { type: 'application/json' },
    )

    const imported = await importWorkspaceArchiveFromJSON(file)
    expect(imported.workspaces[0]?.title).toBe('Auth Toolkit')
  })
})
