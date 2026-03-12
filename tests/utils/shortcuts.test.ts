import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { registerShortcuts, unregisterShortcuts } from '@/utils/shortcuts'

describe('workspace shortcuts', () => {
  const handlers = {
    newWorkspace: vi.fn(),
    focusSearch: vi.fn(),
    toggleCommandPalette: vi.fn(),
    toggleSettings: vi.fn(),
    save: vi.fn(),
    exportWorkspace: vi.fn(),
    rename: vi.fn(),
    deleteItem: vi.fn(),
  }

  beforeEach(() => {
    Object.values(handlers).forEach((handler) => handler.mockReset())
    registerShortcuts(handlers)
  })

  afterEach(() => {
    unregisterShortcuts()
  })

  it('opens the command palette with mod+k', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    expect(handlers.toggleCommandPalette).toHaveBeenCalledTimes(1)
  })

  it('opens settings with mod+,', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ',', ctrlKey: true }))
    expect(handlers.toggleSettings).toHaveBeenCalledTimes(1)
  })

  it('does not steal search shortcuts while typing in an input', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true }))

    expect(handlers.focusSearch).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })
})
