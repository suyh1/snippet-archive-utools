import type { Workspace } from '@/types/workspace'

export function createWorkspaceSeed(now = Date.now()): Workspace[] {
  return [
    {
      id: 'workspace-auth',
      title: 'Auth Toolkit',
      description: '一个用于登录流程与 Token 刷新的工作区',
      tags: ['auth', 'api', 'typescript'],
      starred: true,
      createdAt: now - 1000 * 60 * 60 * 72,
      updatedAt: now - 1000 * 60 * 45,
      lastOpenedAt: now - 1000 * 60 * 12,
      files: [
        {
          id: 'auth-index',
          workspaceId: 'workspace-auth',
          name: 'auth.ts',
          path: '/src/auth.ts',
          language: 'typescript',
          content: 'export const createAuthClient = () => null',
          kind: 'file',
          order: 0,
        },
        {
          id: 'auth-service',
          workspaceId: 'workspace-auth',
          name: 'refresh-token.ts',
          path: '/src/refresh-token.ts',
          language: 'typescript',
          content: 'export async function refreshToken() {}',
          kind: 'file',
          order: 1,
        },
      ],
    },
    {
      id: 'workspace-snippets',
      title: 'Snippet Recipes',
      description: '常用命令、脚本和格式化片段的集合',
      tags: ['shell', 'automation', 'templates'],
      starred: false,
      createdAt: now - 1000 * 60 * 60 * 168,
      updatedAt: now - 1000 * 60 * 60 * 3,
      lastOpenedAt: now - 1000 * 60 * 60 * 9,
      files: [
        {
          id: 'recipe-shell',
          workspaceId: 'workspace-snippets',
          name: 'deploy.sh',
          path: '/scripts/deploy.sh',
          language: 'shell',
          content: 'echo deploying',
          kind: 'file',
          order: 0,
        },
        {
          id: 'recipe-readme',
          workspaceId: 'workspace-snippets',
          name: 'README.md',
          path: '/README.md',
          language: 'markdown',
          content: '# Snippet Recipes',
          kind: 'file',
          order: 1,
        },
      ],
    },
  ]
}

export function createBlankWorkspace(id: string, now = Date.now()): Workspace {
  return {
    id,
    title: 'Untitled Workspace',
    description: '新的工作区，等待你填入描述与文件。',
    tags: [],
    starred: false,
    createdAt: now,
    updatedAt: now,
    files: [
      {
        id: `${id}-file-1`,
        workspaceId: id,
        name: 'index.ts',
        path: '/index.ts',
        language: 'typescript',
        content: '',
        kind: 'file',
        order: 0,
      },
    ],
  }
}
