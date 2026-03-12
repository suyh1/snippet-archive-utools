import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import SettingsSheet from '@/components/app/SettingsSheet.vue'
import { useSettingsStore } from '@/stores/settingsStore'

const { exportWorkspacesToJSON } = vi.hoisted(() => ({
  exportWorkspacesToJSON: vi.fn(),
}))

vi.mock('@/utils/export', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/export')>()
  return {
    ...actual,
    exportWorkspacesToJSON,
  }
})

describe('SettingsSheet', () => {
  it('updates theme and font size from controls', async () => {
    const pinia = createPinia()
    mount(SettingsSheet, {
      props: { open: true },
      attachTo: document.body,
      global: { plugins: [pinia] },
    })

    const settingsStore = useSettingsStore()

    const themeSelect = document.body.querySelector('[data-setting="theme"]') as HTMLSelectElement | null
    const fontInput = document.body.querySelector('[data-setting="font-size"]') as HTMLInputElement | null

    expect(themeSelect).not.toBeNull()
    expect(fontInput).not.toBeNull()

    themeSelect!.value = 'clouds'
    themeSelect!.dispatchEvent(new Event('change'))
    fontInput!.value = '18'
    fontInput!.dispatchEvent(new Event('input'))

    expect(settingsStore.settings.theme).toBe('clouds')
    expect(settingsStore.settings.fontSize).toBe(18)
  })

  it('exports all workspaces from the settings actions', async () => {
    const pinia = createPinia()
    mount(SettingsSheet, {
      props: { open: true },
      attachTo: document.body,
      global: { plugins: [pinia] },
    })

    const exportButton = document.body.querySelector('[data-action="export-workspaces"]') as HTMLButtonElement | null
    expect(exportButton).not.toBeNull()
    exportButton!.click()

    expect(exportWorkspacesToJSON).toHaveBeenCalledTimes(1)
  })
})
