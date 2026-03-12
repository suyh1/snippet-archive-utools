import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import CommandPalette from '@/components/app/CommandPalette.vue'
import { useAppStore } from '@/stores/appStore'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'

describe('CommandPalette', () => {
  it('filters workspaces and opens the selected workspace', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    const workspaceDataStore = useWorkspaceDataStore(pinia)
    workspaceDataStore.init()

    const wrapper = mount(CommandPalette, {
      props: { open: true },
      attachTo: document.body,
      global: { plugins: [pinia] },
    })

    const input = document.body.querySelector('[data-command-input]') as HTMLInputElement | null
    expect(input).not.toBeNull()

    input!.value = 'snippet'
    input!.dispatchEvent(new Event('input'))
    await nextTick()

    expect(document.body.textContent).toContain('Snippet Recipes')

    const action = document.body.querySelector('[data-command-workspace="workspace-snippets"]') as HTMLButtonElement | null
    expect(action).not.toBeNull()
    action!.click()
    await nextTick()

    expect(appStore.currentView).toBe('workspace')
    expect(appStore.activeWorkspaceId).toBe('workspace-snippets')
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })
})
