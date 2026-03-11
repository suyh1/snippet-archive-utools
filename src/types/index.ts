/** 代码片段中的单个代码块 */
export interface Fragment {
  id: string
  title: string       // 标签页名称，如 "index.ts"
  code: string
  language: string
}

/** 文件夹 */
export interface Folder {
  id: string
  name: string
  parentId: string | null
  order: number
  createdAt: number
  updatedAt: number
}

/** 代码片段 */
export interface Snippet {
  id: string
  title: string
  fragments: Fragment[]
  activeFragmentId: string
  description: string
  tags: string[]
  folderId: string | null
  starred: boolean
  order: number
  createdAt: number
  updatedAt: number
}

/** 编辑器设置 */
export interface Settings {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  showMinimap: boolean
  showLineNumbers: boolean
  theme: string
}

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: false,
  showMinimap: true,
  showLineNumbers: true,
  theme: 'one-dark',
}

/** 过滤模式 */
export type FilterMode = 'all' | 'starred' | string

/** 排序模式 */
export type SortMode = 'updatedAt' | 'name' | 'createdAt'

/** utools db 文档 */
export interface DbDoc<T> {
  _id: string
  _rev?: string
  data: T
}

/** 树节点类型 */
export type TreeNodeType = 'folder' | 'snippet'

/** 树节点 */
export interface TreeNode {
  key: string
  title: string
  type: TreeNodeType
  isLeaf?: boolean
  children?: TreeNode[]
  starred?: boolean
  data: Folder | Snippet
}

/** 支持的编程语言 */
export const SUPPORTED_LANGUAGES = [
  // 常用语言
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C/C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Swift', value: 'swift' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Dart', value: 'dart' },
  { label: 'Scala', value: 'scala' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'PHP', value: 'php' },
  { label: 'Objective-C', value: 'objectivec' },
  // Web 技术
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'SCSS', value: 'scss' },
  { label: 'SASS', value: 'sass' },
  { label: 'Less', value: 'less' },
  { label: 'Vue', value: 'vue' },
  // 脚本语言
  { label: 'Shell/Bash', value: 'shell' },
  { label: 'PowerShell', value: 'powershell' },
  { label: 'Lua', value: 'lua' },
  { label: 'Perl', value: 'perl' },
  { label: 'R', value: 'r' },
  { label: 'Julia', value: 'julia' },
  { label: 'CoffeeScript', value: 'coffeescript' },
  { label: 'Groovy', value: 'groovy' },
  // 函数式语言
  { label: 'Haskell', value: 'haskell' },
  { label: 'Clojure', value: 'clojure' },
  { label: 'Erlang', value: 'erlang' },
  { label: 'Elm', value: 'elm' },
  { label: 'Lisp', value: 'lisp' },
  { label: 'Scheme', value: 'scheme' },
  // 数据与配置
  { label: 'JSON', value: 'json' },
  { label: 'XML', value: 'xml' },
  { label: 'YAML', value: 'yaml' },
  { label: 'TOML', value: 'toml' },
  { label: 'INI/Properties', value: 'ini' },
  { label: 'SQL', value: 'sql' },
  { label: 'Protobuf', value: 'protobuf' },
  // 文档与其他
  { label: 'Markdown', value: 'markdown' },
  { label: 'Diff/Patch', value: 'diff' },
  { label: 'Dockerfile', value: 'dockerfile' },
  { label: 'Nginx', value: 'nginx' },
  // 传统语言
  { label: 'Pascal/Delphi', value: 'pascal' },
  { label: 'Fortran', value: 'fortran' },
  { label: 'VB.NET', value: 'vb' },
  // 纯文本
  { label: '纯文本', value: 'plaintext' },
] as const

export type LanguageValue = typeof SUPPORTED_LANGUAGES[number]['value']
