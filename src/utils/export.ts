import { v4 as uuidv4 } from 'uuid'
import type { Snippet, Fragment, Folder } from '@/types'
import type { Workspace, WorkspaceFile } from '@/types/workspace'

const LANG_EXT_MAP: Record<string, string> = {
  javascript: 'js', typescript: 'ts', python: 'py', java: 'java',
  cpp: 'cpp', csharp: 'cs', go: 'go', rust: 'rs', swift: 'swift',
  kotlin: 'kt', dart: 'dart', scala: 'scala', ruby: 'rb', php: 'php',
  html: 'html', css: 'css', scss: 'scss', sass: 'sass', less: 'less',
  vue: 'vue', shell: 'sh', powershell: 'ps1', lua: 'lua', perl: 'pl',
  r: 'r', julia: 'jl', coffeescript: 'coffee', groovy: 'groovy',
  haskell: 'hs', clojure: 'clj', erlang: 'erl', elm: 'elm',
  lisp: 'lisp', scheme: 'scm', json: 'json', xml: 'xml',
  yaml: 'yml', toml: 'toml', ini: 'ini', sql: 'sql',
  protobuf: 'proto', markdown: 'md', diff: 'diff',
  dockerfile: 'dockerfile', nginx: 'conf', pascal: 'pas',
  fortran: 'f90', vb: 'vb', plaintext: 'txt',
}

export interface ExportData {
  version: number
  exportedAt: string
  folders: Folder[]
  snippets: Snippet[]
}

export interface WorkspaceExportData {
  version: number
  exportedAt: string
  workspaces: Workspace[]
}

interface RawWorkspaceFile {
  id?: string
  workspaceId?: string
  name?: string
  path?: string
  language?: string
  content?: string
  kind?: 'file' | 'folder' | 'virtual'
  order?: number
}

interface RawWorkspace {
  id?: string
  title?: string
  description?: string
  tags?: unknown[]
  starred?: boolean
  files?: RawWorkspaceFile[]
  cover?: string
  createdAt?: number
  updatedAt?: number
  lastOpenedAt?: number
}

interface RawWorkspaceExportData {
  version?: number
  exportedAt?: string
  workspaces?: RawWorkspace[]
}

interface RawFragment {
  id?: string
  title?: string
  code?: string
  language?: string
}

interface RawFolder {
  id?: string
  name?: string
  parentId?: string | null
  order?: number
  createdAt?: number
  updatedAt?: number
}

interface RawSnippet {
  id?: string
  title?: string
  description?: string
  tags?: unknown[]
  folderId?: string | null
  starred?: boolean
  order?: number
  createdAt?: number
  updatedAt?: number
  activeFragmentId?: string
  fragments?: RawFragment[]
}

interface RawExportData {
  version?: number
  exportedAt?: string
  folders?: RawFolder[]
  snippets?: RawSnippet[]
}

interface NormalizeImportOptions {
  existingFolderIds: Set<string>
  existingSnippetIds: Set<string>
  generateId?: () => string
  now?: () => number
}

interface NormalizeWorkspaceImportOptions {
  existingWorkspaceIds: Set<string>
  generateId?: () => string
  now?: () => number
}

function createDefaultRawWorkspaceFile(): RawWorkspaceFile {
  return {
    name: 'index.ts',
    path: '/index.ts',
    language: 'typescript',
    content: '',
    kind: 'file',
    order: 0,
  }
}

function uniqueId(usedIds: Set<string>, generateId: () => string, preferred?: string): string {
  if (preferred && !usedIds.has(preferred)) {
    usedIds.add(preferred)
    return preferred
  }

  let nextId = generateId()
  while (usedIds.has(nextId)) {
    nextId = generateId()
  }
  usedIds.add(nextId)
  return nextId
}

function normalizeTime(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizeGroupedOrders<T extends { order: number }>(
  items: T[],
  groupKey: (item: T) => string,
): T[] {
  const grouped = new Map<string, Array<{ item: T; index: number }>>()

  items.forEach((item, index) => {
    const key = groupKey(item)
    const group = grouped.get(key) ?? []
    group.push({ item, index })
    grouped.set(key, group)
  })

  const normalized = new Map<T, T>()
  for (const group of grouped.values()) {
    group
      .sort((left, right) => left.item.order - right.item.order || left.index - right.index)
      .forEach(({ item }, order) => {
        normalized.set(item, item.order === order ? item : { ...item, order })
      })
  }

  return items.map((item) => normalized.get(item) ?? item)
}

export function normalizeImportedArchive(
  data: RawExportData,
  options: NormalizeImportOptions,
): ExportData {
  const generateId = options.generateId ?? uuidv4
  const now = options.now ?? (() => Date.now())
  const folderIdMap = new Map<string, string>()
  const usedFolderIds = new Set(options.existingFolderIds)
  const usedSnippetIds = new Set(options.existingSnippetIds)
  const importedFolders = Array.isArray(data.folders) ? data.folders : []
  const importedSnippets = Array.isArray(data.snippets) ? data.snippets : []

  const normalizedFolders = importedFolders
    .map((folder, index): Folder => {
      const sourceId = typeof folder.id === 'string' && folder.id ? folder.id : `folder-${index}`
      const id = uniqueId(usedFolderIds, generateId)
      folderIdMap.set(sourceId, id)

      return {
        id,
        name: typeof folder.name === 'string' && folder.name.trim() ? folder.name.trim() : '未命名文件夹',
        parentId: typeof folder.parentId === 'string' ? folder.parentId : null,
        order: typeof folder.order === 'number' ? folder.order : index,
        createdAt: normalizeTime(folder.createdAt, now()),
        updatedAt: normalizeTime(folder.updatedAt, now()),
      }
    })
    .map((folder) => ({
      ...folder,
      parentId: typeof folder.parentId === 'string' ? folderIdMap.get(folder.parentId) ?? null : null,
    }))

  const normalizedSnippets = importedSnippets.map((snippet, index): Snippet => {
    const sourceId = typeof snippet.id === 'string' && snippet.id ? snippet.id : `snippet-${index}`
    const id = uniqueId(usedSnippetIds, generateId, sourceId)
    const fragmentIdMap = new Map<string, string>()
    const rawFragments = Array.isArray(snippet.fragments) ? snippet.fragments : []
    const fragments = (rawFragments.length > 0 ? rawFragments : [{}]).map((fragment, fragmentIndex) => {
      const sourceFragmentId = typeof fragment.id === 'string' && fragment.id
        ? fragment.id
        : `${sourceId}-fragment-${fragmentIndex}`
      const fragmentId = generateId()
      fragmentIdMap.set(sourceFragmentId, fragmentId)

      return {
        id: fragmentId,
        title: typeof fragment.title === 'string' && fragment.title.trim() ? fragment.title.trim() : '代码片段',
        code: typeof fragment.code === 'string' ? fragment.code : '',
        language: typeof fragment.language === 'string' && fragment.language ? fragment.language : 'plaintext',
      }
    })

    const activeFragmentId = typeof snippet.activeFragmentId === 'string'
      ? fragmentIdMap.get(snippet.activeFragmentId)
      : undefined

    return {
      id,
      title: typeof snippet.title === 'string' && snippet.title.trim() ? snippet.title.trim() : '未命名片段',
      description: typeof snippet.description === 'string' ? snippet.description : '',
      tags: Array.isArray(snippet.tags)
        ? snippet.tags.filter((tag): tag is string => typeof tag === 'string')
        : [],
      folderId: typeof snippet.folderId === 'string' ? folderIdMap.get(snippet.folderId) ?? null : null,
      starred: Boolean(snippet.starred),
      order: typeof snippet.order === 'number' ? snippet.order : index,
      createdAt: normalizeTime(snippet.createdAt, now()),
      updatedAt: normalizeTime(snippet.updatedAt, now()),
      fragments,
      activeFragmentId: activeFragmentId ?? fragments[0].id,
    }
  })

  return {
    version: typeof data.version === 'number' ? data.version : 2,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : new Date().toISOString(),
    folders: normalizeGroupedOrders(normalizedFolders, (folder) => folder.parentId ?? '__root__'),
    snippets: normalizeGroupedOrders(normalizedSnippets, (snippet) => snippet.folderId ?? '__root__'),
  }
}

export function exportAllToJSON(folders: Folder[], snippets: Snippet[]) {
  const data: ExportData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    folders,
    snippets,
  }
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, `snippets-backup-${formatDate()}.json`, 'application/json')
}

export function exportWorkspacesToJSON(workspaces: Workspace[]) {
  const data: WorkspaceExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    workspaces,
  }
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, `workspace-backup-${formatDate()}.json`, 'application/json')
}

export function exportWorkspaceToJSON(workspace: Workspace) {
  exportWorkspacesToJSON([workspace])
}

export function normalizeWorkspaceArchive(
  data: RawWorkspaceExportData,
  options: NormalizeWorkspaceImportOptions,
): WorkspaceExportData {
  const generateId = options.generateId ?? uuidv4
  const now = options.now ?? (() => Date.now())
  const usedWorkspaceIds = new Set(options.existingWorkspaceIds)
  const importedWorkspaces = Array.isArray(data.workspaces) ? data.workspaces : []

  return {
    version: typeof data.version === 'number' ? data.version : 1,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : new Date().toISOString(),
    workspaces: importedWorkspaces.map((workspace, workspaceIndex) => {
      const sourceWorkspaceId = typeof workspace.id === 'string' && workspace.id
        ? workspace.id
        : `workspace-${workspaceIndex}`
      const workspaceId = uniqueId(usedWorkspaceIds, generateId, sourceWorkspaceId)

      const rawFiles: RawWorkspaceFile[] = Array.isArray(workspace.files) && workspace.files.length > 0
        ? workspace.files
        : [createDefaultRawWorkspaceFile()]

      const files: WorkspaceFile[] = rawFiles.map((file, fileIndex) => ({
        id: typeof file.id === 'string' && file.id ? file.id : generateId(),
        workspaceId,
        name: typeof file.name === 'string' && file.name.trim() ? file.name.trim() : `file-${fileIndex + 1}.txt`,
        path: typeof file.path === 'string' && file.path.trim() ? file.path : `/${typeof file.name === 'string' && file.name ? file.name : `file-${fileIndex + 1}.txt`}`,
        language: typeof file.language === 'string' && file.language ? file.language : 'plaintext',
        content: typeof file.content === 'string' ? file.content : '',
        kind: file.kind === 'folder' || file.kind === 'virtual' ? file.kind : 'file',
        order: typeof file.order === 'number' ? file.order : fileIndex,
      }))

      return {
        id: workspaceId,
        title: typeof workspace.title === 'string' && workspace.title.trim() ? workspace.title.trim() : 'Untitled Workspace',
        description: typeof workspace.description === 'string' ? workspace.description : '',
        tags: Array.isArray(workspace.tags)
          ? workspace.tags.filter((tag): tag is string => typeof tag === 'string')
          : [],
        starred: Boolean(workspace.starred),
        cover: typeof workspace.cover === 'string' ? workspace.cover : undefined,
        createdAt: normalizeTime(workspace.createdAt, now()),
        updatedAt: normalizeTime(workspace.updatedAt, now()),
        lastOpenedAt: typeof workspace.lastOpenedAt === 'number' ? workspace.lastOpenedAt : undefined,
        files: normalizeGroupedOrders(files, () => workspaceId),
      }
    }),
  }
}

export async function importWorkspaceArchiveFromJSON(file: File): Promise<WorkspaceExportData> {
  const text = await file.text()
  const data = JSON.parse(text) as RawWorkspaceExportData
  if (!Array.isArray(data.workspaces)) {
    throw new Error('无效的工作区备份文件格式')
  }

  return normalizeWorkspaceArchive(data, {
    existingWorkspaceIds: new Set(),
  })
}

export async function importWorkspaceArchiveFromJSONWithOptions(
  file: File,
  options: NormalizeWorkspaceImportOptions,
): Promise<WorkspaceExportData> {
  const text = await file.text()
  const data = JSON.parse(text) as RawWorkspaceExportData
  if (!Array.isArray(data.workspaces)) {
    throw new Error('无效的工作区备份文件格式')
  }

  return normalizeWorkspaceArchive(data, options)
}

export async function importFromJSON(file: File): Promise<ExportData> {
  const text = await file.text()
  const data = JSON.parse(text) as RawExportData
  if (!Array.isArray(data.folders) || !Array.isArray(data.snippets)) {
    throw new Error('无效的备份文件格式')
  }
  return normalizeImportedArchive(data, {
    existingFolderIds: new Set(),
    existingSnippetIds: new Set(),
  })
}

export function exportFragmentToFile(snippet: Snippet, fragment: Fragment) {
  const ext = LANG_EXT_MAP[fragment.language] ?? 'txt'
  const filename = fragment.title.includes('.') ? fragment.title : `${fragment.title}.${ext}`
  downloadFile(fragment.code, filename, 'text/plain')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
