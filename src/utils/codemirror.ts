import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { sql } from '@codemirror/lang-sql'
import { xml } from '@codemirror/lang-xml'
import { rust } from '@codemirror/lang-rust'
import { go } from '@codemirror/lang-go'
import { php } from '@codemirror/lang-php'
import { yaml } from '@codemirror/lang-yaml'
import { sass } from '@codemirror/lang-sass'
import { less } from '@codemirror/lang-less'
import { vue } from '@codemirror/lang-vue'
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
import { shell } from '@codemirror/legacy-modes/mode/shell'
import { ruby } from '@codemirror/legacy-modes/mode/ruby'
import { swift } from '@codemirror/legacy-modes/mode/swift'
import { lua } from '@codemirror/legacy-modes/mode/lua'
import { perl } from '@codemirror/legacy-modes/mode/perl'
import { r } from '@codemirror/legacy-modes/mode/r'
import { dockerFile as dockerfile } from '@codemirror/legacy-modes/mode/dockerfile'
import { toml } from '@codemirror/legacy-modes/mode/toml'
import { diff } from '@codemirror/legacy-modes/mode/diff'
import { powerShell } from '@codemirror/legacy-modes/mode/powershell'
import { groovy } from '@codemirror/legacy-modes/mode/groovy'
import { haskell } from '@codemirror/legacy-modes/mode/haskell'
import { clojure } from '@codemirror/legacy-modes/mode/clojure'
import { erlang } from '@codemirror/legacy-modes/mode/erlang'
import { commonLisp } from '@codemirror/legacy-modes/mode/commonlisp'
import { scheme } from '@codemirror/legacy-modes/mode/scheme'
import { nginx } from '@codemirror/legacy-modes/mode/nginx'
import { protobuf } from '@codemirror/legacy-modes/mode/protobuf'
import { properties } from '@codemirror/legacy-modes/mode/properties'
import { pascal } from '@codemirror/legacy-modes/mode/pascal'
import { fortran } from '@codemirror/legacy-modes/mode/fortran'
import { vb } from '@codemirror/legacy-modes/mode/vb'
import { coffeeScript as coffeescript } from '@codemirror/legacy-modes/mode/coffeescript'
import { julia } from '@codemirror/legacy-modes/mode/julia'
import { elm } from '@codemirror/legacy-modes/mode/elm'
import type { Extension } from '@codemirror/state'
import type { Settings } from '@/types'

export { Compartment, EditorState } from '@codemirror/state'
export { EditorView } from '@codemirror/view'

// Kotlin and C# use the clike mode
import { kotlin, cSharp, scala, dart, objectiveC } from './clike-langs'

export function getLanguageExtension(lang: string): Extension | null {
  switch (lang) {
    case 'javascript':
      return javascript({ jsx: true })
    case 'typescript':
      return javascript({ typescript: true, jsx: true })
    case 'python':
      return python()
    case 'java':
      return java()
    case 'cpp':
    case 'c':
      return cpp()
    case 'html':
      return html()
    case 'css':
      return css()
    case 'json':
      return json()
    case 'markdown':
      return markdown()
    case 'sql':
      return sql()
    case 'xml':
      return xml()
    case 'rust':
      return rust()
    case 'go':
      return go()
    case 'php':
      return php()
    case 'yaml':
      return yaml()
    case 'shell':
    case 'bash':
      return StreamLanguage.define(shell)
    case 'ruby':
      return StreamLanguage.define(ruby)
    case 'swift':
      return StreamLanguage.define(swift)
    case 'kotlin':
      return StreamLanguage.define(kotlin)
    case 'csharp':
      return StreamLanguage.define(cSharp)
    case 'scala':
      return StreamLanguage.define(scala)
    case 'dart':
      return StreamLanguage.define(dart)
    case 'objectivec':
      return StreamLanguage.define(objectiveC)
    case 'lua':
      return StreamLanguage.define(lua)
    case 'perl':
      return StreamLanguage.define(perl)
    case 'r':
      return StreamLanguage.define(r)
    case 'dockerfile':
      return StreamLanguage.define(dockerfile)
    case 'toml':
      return StreamLanguage.define(toml)
    case 'diff':
      return StreamLanguage.define(diff)
    case 'powershell':
      return StreamLanguage.define(powerShell)
    case 'groovy':
      return StreamLanguage.define(groovy)
    case 'haskell':
      return StreamLanguage.define(haskell)
    case 'clojure':
      return StreamLanguage.define(clojure)
    case 'erlang':
      return StreamLanguage.define(erlang)
    case 'lisp':
      return StreamLanguage.define(commonLisp)
    case 'scheme':
      return StreamLanguage.define(scheme)
    case 'nginx':
      return StreamLanguage.define(nginx)
    case 'protobuf':
      return StreamLanguage.define(protobuf)
    case 'properties':
    case 'ini':
      return StreamLanguage.define(properties)
    case 'pascal':
    case 'delphi':
      return StreamLanguage.define(pascal)
    case 'fortran':
      return StreamLanguage.define(fortran)
    case 'vb':
      return StreamLanguage.define(vb)
    case 'coffeescript':
      return StreamLanguage.define(coffeescript)
    case 'julia':
      return StreamLanguage.define(julia)
    case 'elm':
      return StreamLanguage.define(elm)
    case 'sass':
      return sass({ indented: true })
    case 'scss':
      return sass({ indented: false })
    case 'less':
      return less()
    case 'vue':
      return vue()
    default:
      return null
  }
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
