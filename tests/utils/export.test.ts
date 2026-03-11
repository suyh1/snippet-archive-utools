import { describe, expect, it } from 'vitest'
import { normalizeImportedArchive } from '@/utils/export'

describe('normalizeImportedArchive', () => {
  it('remaps conflicting ids while preserving folder hierarchy and fragment data', () => {
    const normalized = normalizeImportedArchive(
      {
        version: 2,
        exportedAt: '2026-03-11T00:00:00.000Z',
        folders: [
          { id: 'folder-root', name: 'Root', parentId: null, order: 0, createdAt: 1, updatedAt: 1 },
          { id: 'folder-child', name: 'Child', parentId: 'folder-root', order: 0, createdAt: 2, updatedAt: 2 },
        ],
        snippets: [
          {
            id: 'snippet-1',
            title: 'Example',
            description: 'desc',
            tags: ['tag'],
            folderId: 'folder-child',
            starred: true,
            order: 0,
            createdAt: 3,
            updatedAt: 4,
            activeFragmentId: 'fragment-1',
            fragments: [
              { id: 'fragment-1', title: 'main.ts', code: 'console.log(1)', language: 'typescript' },
            ],
          },
        ],
      },
      {
        existingFolderIds: new Set(['folder-root']),
        existingSnippetIds: new Set(['snippet-1']),
        generateId: (() => {
          let count = 0
          return () => `generated-${++count}`
        })(),
      },
    )

    expect(normalized.folders).toEqual([
      { id: 'generated-1', name: 'Root', parentId: null, order: 0, createdAt: 1, updatedAt: 1 },
      { id: 'generated-2', name: 'Child', parentId: 'generated-1', order: 0, createdAt: 2, updatedAt: 2 },
    ])
    expect(normalized.snippets).toEqual([
      {
        id: 'generated-3',
        title: 'Example',
        description: 'desc',
        tags: ['tag'],
        folderId: 'generated-2',
        starred: true,
        order: 0,
        createdAt: 3,
        updatedAt: 4,
        activeFragmentId: 'generated-4',
        fragments: [
          { id: 'generated-4', title: 'main.ts', code: 'console.log(1)', language: 'typescript' },
        ],
      },
    ])
  })

  it('fills missing fragment data with safe defaults', () => {
    const normalized = normalizeImportedArchive(
      {
        version: 1,
        exportedAt: '2026-03-11T00:00:00.000Z',
        folders: [],
        snippets: [
          {
            id: 'snippet-1',
            title: 'Legacy',
            description: '',
            tags: [],
            folderId: null,
            starred: false,
            order: 0,
            createdAt: 1,
            updatedAt: 1,
            fragments: [],
            activeFragmentId: 'missing',
          },
        ],
      },
      {
        existingFolderIds: new Set(),
        existingSnippetIds: new Set(),
        generateId: (() => {
          let count = 10
          return () => `generated-${++count}`
        })(),
      },
    )

    expect(normalized.snippets[0].fragments).toHaveLength(1)
    expect(normalized.snippets[0].fragments[0]).toMatchObject({
      id: 'generated-11',
      title: '代码片段',
      code: '',
      language: 'plaintext',
    })
    expect(normalized.snippets[0].activeFragmentId).toBe('generated-11')
  })
})
