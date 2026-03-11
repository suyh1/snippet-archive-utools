import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Settings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'
import { applyTheme, isThemeDark, loadSavedTheme } from '@/utils/themes'

const SETTINGS_KEY = 'app-settings'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({ ...DEFAULT_SETTINGS })

  const isDarkTheme = computed(() => isThemeDark(settings.value.theme))

  function loadSettings() {
    try {
      if (window.utools) {
        const doc = window.utools.db.get(SETTINGS_KEY)
        if (doc?.data) {
          settings.value = { ...DEFAULT_SETTINGS, ...(doc.data as Partial<Settings>) }
        } else {
          settings.value = { ...DEFAULT_SETTINGS, theme: loadSavedTheme() }
        }
      }
    } catch { /* ignore */ }
    applyTheme(settings.value.theme)
  }

  function updateSettings(partial: Partial<Settings>) {
    settings.value = { ...settings.value, ...partial }
    persistSettings()
    if ('theme' in partial) {
      applyTheme(settings.value.theme)
    }
  }

  function persistSettings() {
    try {
      if (window.utools) {
        const existing = window.utools.db.get(SETTINGS_KEY)
        if (existing) {
          window.utools.db.put({ _id: SETTINGS_KEY, _rev: existing._rev, data: settings.value })
        } else {
          window.utools.db.put({ _id: SETTINGS_KEY, data: settings.value })
        }
      }
    } catch { /* ignore */ }
  }

  return { settings, isDarkTheme, loadSettings, updateSettings }
})
