import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import { defineComponent } from 'vue'
import AppShell from '@/components/app/AppShell.vue'
import { useAppStore } from '@/stores/appStore'

vi.mock('@/components/library/LibraryLayout.vue', () => ({
  __esModule: true,
  __isTeleport: false,
  default: defineComponent({
    template: '<div data-mock="library-layout">library layout</div>',
  }),
}))

vi.mock('@/components/workspace/WorkspaceLayout.vue', () => ({
  __esModule: true,
  __isTeleport: false,
  default: defineComponent({
    template: '<div data-mock="workspace-layout">workspace layout</div>',
  }),
}))

describe('AppShell', () => {
  it('shows the library view by default and switches to workspace view from store state', async () => {
    const pinia = createPinia()
    const wrapper = mount(AppShell, {
      global: {
        plugins: [pinia],
      },
    })
    await flushPromises()

    const appStore = useAppStore()

    expect(wrapper.find('[data-view="library"]').exists()).toBe(true)
    expect(wrapper.find('[data-view="workspace"]').exists()).toBe(false)

    appStore.openWorkspace('workspace-1')
    await nextTick()

    expect(wrapper.find('[data-view="library"]').exists()).toBe(false)
    expect(wrapper.find('[data-view="workspace"]').exists()).toBe(true)
  })

  it('creates a new workspace from the topbar action and enters workspace view', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    const wrapper = mount(AppShell, {
      global: {
        plugins: [pinia],
      },
      attachTo: document.body,
    })
    await flushPromises()

    await wrapper.get('[data-action="new-workspace"]').trigger('click')
    await nextTick()
    await flushPromises()

    expect(wrapper.find('[data-view="workspace"]').exists()).toBe(true)
    expect(appStore.activeWorkspaceId).not.toBeNull()
  })
})
