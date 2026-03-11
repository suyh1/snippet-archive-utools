import { describe, expect, it } from 'vitest'
import { applyTheme, isThemeDark } from '@/utils/themes'

describe('themes', () => {
  it('applies dark or light mode to the document', () => {
    applyTheme('one-dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    applyTheme('clouds')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('treats unknown themes as dark by default', () => {
    expect(isThemeDark('unknown-theme')).toBe(true)
  })
})
