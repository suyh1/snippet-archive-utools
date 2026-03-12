import { oneDark } from '@codemirror/theme-one-dark'
import {
  dracula,
  solarizedLight,
  coolGlow,
  amy,
  ayuLight,
  barf,
  bespin,
  birdsOfParadise,
  cobalt,
  espresso,
  noctisLilac,
  rosePineDawn,
  smoothy,
  tomorrow,
  clouds,
} from 'thememirror'
import type { Extension } from '@codemirror/state'

export interface ThemeOption {
  label: string
  value: string
  dark: boolean
}

export const DEFAULT_THEME = 'one-dark'

export const EDITOR_THEMES: ThemeOption[] = [
  { label: 'One Dark', value: 'one-dark', dark: true },
  { label: 'Dracula', value: 'dracula', dark: true },
  { label: 'Cobalt', value: 'cobalt', dark: true },
  { label: 'Cool Glow', value: 'cool-glow', dark: true },
  { label: 'Amy', value: 'amy', dark: true },
  { label: 'Barf', value: 'barf', dark: true },
  { label: 'Bespin', value: 'bespin', dark: true },
  { label: 'Birds of Paradise', value: 'birds-of-paradise', dark: true },
  { label: 'Solarized Light', value: 'solarized-light', dark: false },
  { label: 'Ayu Light', value: 'ayu-light', dark: false },
  { label: 'Clouds', value: 'clouds', dark: false },
  { label: 'Espresso', value: 'espresso', dark: false },
  { label: 'Noctis Lilac', value: 'noctis-lilac', dark: false },
  { label: 'Rose Pine Dawn', value: 'rose-pine-dawn', dark: false },
  { label: 'Smoothy', value: 'smoothy', dark: false },
  { label: 'Tomorrow', value: 'tomorrow', dark: false },
]

export function getThemeExtension(themeId: string): Extension {
  switch (themeId) {
    case 'one-dark': return oneDark
    case 'dracula': return dracula
    case 'solarized-light': return solarizedLight
    case 'cool-glow': return coolGlow
    case 'amy': return amy
    case 'ayu-light': return ayuLight
    case 'barf': return barf
    case 'bespin': return bespin
    case 'birds-of-paradise': return birdsOfParadise
    case 'cobalt': return cobalt
    case 'espresso': return espresso
    case 'noctis-lilac': return noctisLilac
    case 'rose-pine-dawn': return rosePineDawn
    case 'smoothy': return smoothy
    case 'tomorrow': return tomorrow
    case 'clouds': return clouds
    default: return oneDark
  }
}

const THEME_STORAGE_KEY = 'editor-theme'

export function isThemeDark(themeId: string): boolean {
  const theme = EDITOR_THEMES.find((item) => item.value === themeId)
  return theme?.dark ?? true
}

export function applyTheme(themeId: string) {
  if (typeof document === 'undefined') return
  const mode = isThemeDark(themeId) ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', mode)
  document.documentElement.style.colorScheme = mode
}

export function loadSavedTheme(): string {
  try {
    if (typeof window !== 'undefined' && window.utools) {
      const doc = window.utools.db.get(THEME_STORAGE_KEY)
      if (doc?.data) return doc.data as string
    }
  } catch { /* ignore */ }
  return DEFAULT_THEME
}

export function saveTheme(themeId: string) {
  try {
    if (typeof window !== 'undefined' && window.utools) {
      const existing = window.utools.db.get(THEME_STORAGE_KEY)
      if (existing) {
        window.utools.db.put({ _id: THEME_STORAGE_KEY, _rev: existing._rev, data: themeId })
      } else {
        window.utools.db.put({ _id: THEME_STORAGE_KEY, data: themeId })
      }
    }
  } catch { /* ignore */ }
  applyTheme(themeId)
}
