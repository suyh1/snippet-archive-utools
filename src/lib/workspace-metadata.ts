import type { Workspace } from '@/types/workspace'

export interface WorkspaceLanguageStat {
  language: string
  count: number
}

export interface WorkspaceSummary {
  fileCount: number
  folderCount: number
  languages: WorkspaceLanguageStat[]
  primaryLanguage: string | null
}

export function summarizeWorkspace(workspace: Workspace): WorkspaceSummary {
  const fileCount = workspace.files.filter((file) => file.kind === 'file').length
  const folderCount = workspace.files.filter((file) => file.kind === 'folder').length
  const languageCounts = new Map<string, number>()

  workspace.files.forEach((file) => {
    if (file.kind !== 'file' || file.language === 'plaintext') return
    languageCounts.set(file.language, (languageCounts.get(file.language) ?? 0) + 1)
  })

  const languages = [...languageCounts.entries()]
    .map(([language, count]) => ({ language, count }))
    .sort((left, right) => right.count - left.count || left.language.localeCompare(right.language))

  return {
    fileCount,
    folderCount,
    languages,
    primaryLanguage: languages[0]?.language ?? null,
  }
}
