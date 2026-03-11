import type { DbDoc, Folder, Snippet } from '@/types'

const FOLDER_PREFIX = 'folder/'
const SNIPPET_PREFIX = 'snippet/'

/** 通用 db 操作 */
function putDoc<T>(id: string, data: T, rev?: string): DbDoc<T> | null {
  const doc: any = { _id: id, data }
  if (rev) doc._rev = rev
  const result = window.utools.db.put(doc)
  if (result.error) {
    console.error('db put error:', result)
    return null
  }
  return { _id: id, _rev: result.rev, data }
}

function getDoc<T>(id: string): DbDoc<T> | null {
  const doc = window.utools.db.get(id)
  if (!doc) return null
  return { _id: doc._id, _rev: doc._rev, data: doc.data as T }
}

function removeDoc(id: string): boolean {
  const doc = window.utools.db.get(id)
  if (!doc) return false
  const result = window.utools.db.remove(doc)
  return !result.error
}

function allDocs<T>(prefix: string): DbDoc<T>[] {
  return window.utools.db.allDocs(prefix).map((doc: any) => ({
    _id: doc._id,
    _rev: doc._rev,
    data: doc.data as T,
  }))
}

/** 文件夹操作 */
export const folderDb = {
  getAll(): DbDoc<Folder>[] {
    return allDocs<Folder>(FOLDER_PREFIX)
  },
  get(id: string): DbDoc<Folder> | null {
    return getDoc<Folder>(FOLDER_PREFIX + id)
  },
  put(folder: Folder, rev?: string): DbDoc<Folder> | null {
    return putDoc(FOLDER_PREFIX + folder.id, folder, rev)
  },
  remove(id: string): boolean {
    return removeDoc(FOLDER_PREFIX + id)
  },
}

/** 代码片段操作 */
export const snippetDb = {
  getAll(): DbDoc<Snippet>[] {
    return allDocs<Snippet>(SNIPPET_PREFIX)
  },
  get(id: string): DbDoc<Snippet> | null {
    return getDoc<Snippet>(SNIPPET_PREFIX + id)
  },
  put(snippet: Snippet, rev?: string): DbDoc<Snippet> | null {
    return putDoc(SNIPPET_PREFIX + snippet.id, snippet, rev)
  },
  remove(id: string): boolean {
    return removeDoc(SNIPPET_PREFIX + id)
  },
}
