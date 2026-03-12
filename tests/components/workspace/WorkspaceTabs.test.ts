import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import WorkspaceTabs from '@/components/workspace/WorkspaceTabs.vue'
import { useAppStore } from '@/stores/appStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

describe('WorkspaceTabs', () => {
  it('renders a semantic tablist and switches files when a tab is clicked', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(WorkspaceTabs, {
      global: {
        plugins: [pinia],
      },
    })

    const workspaceStore = useWorkspaceStore()

    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)

    await wrapper.get('[data-tab-id="auth-service"]').trigger('click')
    await nextTick()

    expect(workspaceStore.currentFile?.name).toBe('refresh-token.ts')
  })

  it('closes a tab and keeps another file focused', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(WorkspaceTabs, {
      global: {
        plugins: [pinia],
      },
    })

    const workspaceStore = useWorkspaceStore()
    workspaceStore.selectFile('auth-service')
    await nextTick()

    await wrapper.get('[data-close-tab="auth-service"]').trigger('click')
    await nextTick()

    expect(workspaceStore.openFiles.map((file) => file.id)).not.toContain('auth-service')
    expect(workspaceStore.currentFile?.id).toBe('auth-index')
  })
})
