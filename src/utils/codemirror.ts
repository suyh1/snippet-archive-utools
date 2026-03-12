import {
  StreamLanguage,
  syntaxHighlighting,
  defaultHighlightStyle,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentUnit,
} from '@codemirror/language'
import { highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers, rectangularSelection, crosshairCursor, scrollPastEnd, EditorView, drawSelection, dropCursor } from '@codemirror/view'
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands'
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { searchKeymap, highlightSelectionMatches, search } from '@codemirror/search'
import { EditorState, Compartment } from '@codemirror/state'
import { showMinimap } from '@replit/codemirror-minimap'
import type { Extension } from '@codemirror/state'
import type { Settings } from '@/types'

export { Compartment, EditorState } from '@codemirror/state'
export { EditorView } from '@codemirror/view'

const languageLoaders: Record<string, () => Promise<Extension | null>> = {
  javascript: async () => (await import('@codemirror/lang-javascript')).javascript({ jsx: true }),
  typescript: async () => (await import('@codemirror/lang-javascript')).javascript({ typescript: true, jsx: true }),
  python: async () => (await import('@codemirror/lang-python')).python(),
  java: async () => (await import('@codemirror/lang-java')).java(),
  cpp: async () => (await import('@codemirror/lang-cpp')).cpp(),
  c: async () => (await import('@codemirror/lang-cpp')).cpp(),
  html: async () => (await import('@codemirror/lang-html')).html(),
  css: async () => (await import('@codemirror/lang-css')).css(),
  json: async () => (await import('@codemirror/lang-json')).json(),
  markdown: async () => (await import('@codemirror/lang-markdown')).markdown(),
  sql: async () => (await import('@codemirror/lang-sql')).sql(),
  xml: async () => (await import('@codemirror/lang-xml')).xml(),
  rust: async () => (await import('@codemirror/lang-rust')).rust(),
  go: async () => (await import('@codemirror/lang-go')).go(),
  php: async () => (await import('@codemirror/lang-php')).php(),
  yaml: async () => (await import('@codemirror/lang-yaml')).yaml(),
  shell: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/shell')).shell),
  bash: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/shell')).shell),
  ruby: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/ruby')).ruby),
  swift: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/swift')).swift),
  kotlin: async () => StreamLanguage.define((await import('./clike-langs')).kotlin),
  csharp: async () => StreamLanguage.define((await import('./clike-langs')).cSharp),
  scala: async () => StreamLanguage.define((await import('./clike-langs')).scala),
  dart: async () => StreamLanguage.define((await import('./clike-langs')).dart),
  objectivec: async () => StreamLanguage.define((await import('./clike-langs')).objectiveC),
  lua: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/lua')).lua),
  perl: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/perl')).perl),
  r: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/r')).r),
  dockerfile: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/dockerfile')).dockerFile),
  toml: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/toml')).toml),
  diff: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/diff')).diff),
  powershell: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/powershell')).powerShell),
  groovy: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/groovy')).groovy),
  haskell: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/haskell')).haskell),
  clojure: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/clojure')).clojure),
  erlang: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/erlang')).erlang),
  lisp: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/commonlisp')).commonLisp),
  scheme: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/scheme')).scheme),
  nginx: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/nginx')).nginx),
  protobuf: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/protobuf')).protobuf),
  properties: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/properties')).properties),
  ini: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/properties')).properties),
  pascal: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/pascal')).pascal),
  delphi: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/pascal')).pascal),
  fortran: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/fortran')).fortran),
  vb: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/vb')).vb),
  coffeescript: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/coffeescript')).coffeeScript),
  julia: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/julia')).julia),
  elm: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/elm')).elm),
  sass: async () => (await import('@codemirror/lang-sass')).sass({ indented: true }),
  scss: async () => (await import('@codemirror/lang-sass')).sass({ indented: false }),
  less: async () => (await import('@codemirror/lang-less')).less(),
  vue: async () => (await import('@codemirror/lang-vue')).vue(),
}

export async function loadLanguageExtension(lang: string): Promise<Extension | null> {
  const loader = languageLoaders[lang]
  return loader ? loader() : null
}

/**
 * Detect programming language from code content.
 * Returns the language value string or null if not detected.
 */
export function detectLanguage(code: string, title?: string): string | null {
  // 1. Check title for file extension
  if (title) {
    const ext = title.match(/\.(\w+)$/)?.[1]?.toLowerCase()
    if (ext) {
      const extMap: Record<string, string> = {
        js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
        ts: 'typescript', tsx: 'typescript', mts: 'typescript',
        py: 'python', pyw: 'python',
        java: 'java',
        c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp',
        go: 'go',
        rs: 'rust',
        php: 'php',
        rb: 'ruby',
        swift: 'swift',
        kt: 'kotlin', kts: 'kotlin',
        cs: 'csharp',
        scala: 'scala', sc: 'scala',
        dart: 'dart',
        m: 'objectivec', mm: 'objectivec',
        lua: 'lua',
        pl: 'perl', pm: 'perl',
        r: 'r', R: 'r',
        html: 'html', htm: 'html',
        css: 'css',
        scss: 'scss', sass: 'sass', less: 'less',
        json: 'json',
        xml: 'xml', xsl: 'xml', svg: 'xml',
        md: 'markdown', mdx: 'markdown',
        sql: 'sql',
        sh: 'shell', bash: 'shell', zsh: 'shell', fish: 'shell',
        ps1: 'powershell', psm1: 'powershell',
        yml: 'yaml', yaml: 'yaml',
        toml: 'toml',
        ini: 'ini', cfg: 'ini', conf: 'ini',
        dockerfile: 'dockerfile',
        groovy: 'groovy', gradle: 'groovy',
        hs: 'haskell',
        clj: 'clojure', cljs: 'clojure',
        erl: 'erlang',
        el: 'lisp', lisp: 'lisp', cl: 'lisp',
        scm: 'scheme',
        proto: 'protobuf',
        pas: 'pascal', pp: 'pascal',
        f90: 'fortran', f95: 'fortran', f: 'fortran',
        vb: 'vb', vbs: 'vb',
        coffee: 'coffeescript',
        jl: 'julia',
        elm: 'elm',
        vue: 'vue',
        diff: 'diff', patch: 'diff',
      }
      if (extMap[ext]) return extMap[ext]
    }

    // Check special filenames
    const basename = title.split('/').pop()?.toLowerCase() ?? ''
    if (basename === 'dockerfile' || basename.startsWith('dockerfile.')) return 'dockerfile'
    if (basename === 'makefile') return 'shell'
    if (basename === 'nginx.conf' || basename.endsWith('.nginx')) return 'nginx'
  }

  // 2. Content-based detection (check shebang and patterns)
  const trimmed = code.trimStart()

  // Shebang
  if (trimmed.startsWith('#!')) {
    const firstLine = trimmed.split('\n')[0].toLowerCase()
    if (firstLine.includes('python')) return 'python'
    if (firstLine.includes('node') || firstLine.includes('deno') || firstLine.includes('bun')) return 'javascript'
    if (firstLine.includes('ruby') || firstLine.includes('irb')) return 'ruby'
    if (firstLine.includes('bash') || firstLine.includes('/sh') || firstLine.includes('zsh')) return 'shell'
    if (firstLine.includes('perl')) return 'perl'
    if (firstLine.includes('lua')) return 'lua'
  }

  // PHP
  if (trimmed.startsWith('<?php')) return 'php'

  // HTML
  if (/^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) return 'html'

  // XML
  if (trimmed.startsWith('<?xml')) return 'xml'

  // JSON
  if (/^\s*[\[{]/.test(trimmed)) {
    try { JSON.parse(code); return 'json' } catch { /* not json */ }
  }

  // YAML (key: value pattern at start)
  if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*:(\s|$)/.test(trimmed) && !trimmed.includes('{')) return 'yaml'

  // Dockerfile
  if (/^FROM\s+\w/m.test(trimmed)) return 'dockerfile'

  // SQL
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WITH)\s/im.test(trimmed)) return 'sql'

  // Diff
  if (trimmed.startsWith('diff --git') || trimmed.startsWith('--- a/')) return 'diff'

  // Shell scripts (common patterns)
  if (/^(export|alias|source|echo|if\s+\[|for\s+\w+\s+in)\s/.test(trimmed)) return 'shell'

  // CSS
  if (/^(@import|@charset|@media|\*\s*\{|body\s*\{|html\s*\{|\.[\w-]+\s*\{|#[\w-]+\s*\{)/.test(trimmed)) return 'css'

  // Rust
  if (/^(use\s+std::|fn\s+main|pub\s+fn|impl\s|#\[derive)/.test(trimmed)) return 'rust'

  // Go
  if (/^package\s+\w+/.test(trimmed) && /\nimport\s/.test(code)) return 'go'

  // Java
  if (/^(package\s+[\w.]+;|import\s+java\.)/.test(trimmed)) return 'java'

  // Kotlin
  if (/^(package\s+[\w.]+|import\s+kotlin\.|fun\s+main)/.test(trimmed) && /\bval\b|\bvar\b/.test(code)) return 'kotlin'

  // Swift
  if (/^import\s+(Foundation|UIKit|SwiftUI)/.test(trimmed)) return 'swift'

  // C#
  if (/^using\s+System/.test(trimmed) || /^namespace\s+[\w.]+\s*\{/.test(trimmed)) return 'csharp'

  // Python (imports or def/class)
  if (/^(import\s+\w|from\s+\w+\s+import|def\s+\w|class\s+\w)/.test(trimmed)) return 'python'

  // TypeScript/JavaScript (needs to be after other languages)
  if (/^(import\s+.*from\s|export\s+(default\s+)?(function|class|const|let|interface|type)\s)/.test(trimmed)) {
    if (/\b(interface|type\s+\w+\s*=|:\s*(string|number|boolean|any)\b)/.test(code)) return 'typescript'
    return 'javascript'
  }

  // JavaScript patterns
  if (/^(const|let|var|function|class)\s/.test(trimmed)) return 'javascript'

  return null
}

/**
 * Create a full-featured editor state with all extensions.
 * Compartments are used for dynamic reconfiguration of language, theme, and settings.
 */
export function getEditorExtensions(options: {
  langCompartment: Compartment
  themeCompartment: Compartment
  fontSizeCompartment: Compartment
  wordWrapCompartment: Compartment
  minimapCompartment: Compartment
  lineNumbersCompartment: Compartment
  tabSizeCompartment: Compartment
  langExtension: Extension | null
  themeExtension: Extension
  settings: Settings
  onContentChange?: (code: string) => void
  onCursorChange?: (line: number, col: number) => void
}): Extension[] {
  const {
    langCompartment, themeCompartment, fontSizeCompartment,
    wordWrapCompartment, minimapCompartment, lineNumbersCompartment,
    tabSizeCompartment,
    langExtension, themeExtension, settings, onContentChange, onCursorChange,
  } = options

  return [
    // Line numbers (dynamic)
    lineNumbersCompartment.of(settings.showLineNumbers ? [lineNumbers(), highlightActiveLineGutter()] : []),

    // Code folding
    foldGutter(),

    // Syntax highlighting — key fix for code coloring
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),

    // Current line highlight
    highlightActiveLine(),

    // Bracket matching
    bracketMatching(),

    // Selection
    drawSelection(),
    dropCursor(),
    rectangularSelection(),
    crosshairCursor(),
    highlightSelectionMatches(),

    // Editing
    history(),
    closeBrackets(),
    autocompletion(),
    indentOnInput(),

    // Tab size (dynamic)
    tabSizeCompartment.of([
      indentUnit.of(' '.repeat(settings.tabSize)),
      EditorState.tabSize.of(settings.tabSize),
    ]),

    // Search UI (Ctrl+F / Ctrl+H)
    search({ top: true }),

    // Scroll past end
    scrollPastEnd(),

    // Minimap (dynamic)
    minimapCompartment.of(settings.showMinimap ? [
      showMinimap.compute([], () => ({
        create: () => {
          const dom = document.createElement('div')
          return { dom }
        },
        displayText: 'blocks',
        showOverlay: 'always',
      })),
    ] : []),

    // Word wrap (dynamic)
    wordWrapCompartment.of(settings.wordWrap ? [EditorView.lineWrapping] : []),

    // Font size (dynamic)
    fontSizeCompartment.of([
      EditorView.theme({
        '.cm-content': { fontSize: `${settings.fontSize}px` },
        '.cm-gutters': { fontSize: `${settings.fontSize}px` },
      }),
    ]),

    // Theme (dynamic)
    themeCompartment.of([themeExtension]),

    // Language (dynamic)
    langCompartment.of(langExtension ? [langExtension] : []),

    // Keymaps
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),

    // Editor sizing
    EditorView.theme({
      '&': { height: '100%' },
      '.cm-scroller': { overflow: 'auto' },
    }),

    // Content change + cursor position listener
    EditorView.updateListener.of((update) => {
      if (update.docChanged && onContentChange) {
        onContentChange(update.state.doc.toString())
      }
      if (onCursorChange && (update.selectionSet || update.docChanged)) {
        const pos = update.state.selection.main.head
        const line = update.state.doc.lineAt(pos)
        onCursorChange(line.number, pos - line.from + 1)
      }
    }),
  ]
}
