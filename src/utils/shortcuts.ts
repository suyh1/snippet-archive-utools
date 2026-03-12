interface ShortcutHandlers {
  newWorkspace: () => void
  focusSearch: () => void
  toggleCommandPalette: () => void
  toggleSettings: () => void
  save: () => void
  exportWorkspace: () => void
  rename: () => void
  deleteItem: () => void
}

const isMac = navigator.platform.toUpperCase().includes('MAC')

function isModKey(e: KeyboardEvent): boolean {
  return isMac ? e.metaKey : e.ctrlKey
}

let handler: ((e: KeyboardEvent) => void) | null = null

export function registerShortcuts(handlers: ShortcutHandlers) {
  handler = (e: KeyboardEvent) => {
    // Don't intercept when typing in input/textarea
    const tag = (e.target as HTMLElement)?.tagName
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA'

    if (isModKey(e)) {
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault()
          handlers.newWorkspace()
          return
        case 'f':
          if (!isInput) {
            e.preventDefault()
            handlers.focusSearch()
          }
          return
        case 'k':
          if (!isInput) {
            e.preventDefault()
            handlers.toggleCommandPalette()
          }
          return
        case ',':
          e.preventDefault()
          handlers.toggleSettings()
          return
        case 's':
          e.preventDefault()
          handlers.save()
          return
        case 'e':
          if (!isInput) {
            e.preventDefault()
            handlers.exportWorkspace()
          }
          return
      }
    }

    if (!isInput) {
      switch (e.key) {
        case 'F2':
          e.preventDefault()
          handlers.rename()
          return
        case 'Delete':
        case 'Backspace':
          // Only trigger delete when not in an input field
          if (e.key === 'Delete') {
            e.preventDefault()
            handlers.deleteItem()
          }
          return
      }
    }
  }
  document.addEventListener('keydown', handler)
}

export function unregisterShortcuts() {
  if (handler) {
    document.removeEventListener('keydown', handler)
    handler = null
  }
}
