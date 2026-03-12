import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import WorkspaceLayout from '@/components/workspace/WorkspaceLayout.vue'
import { useAppStore } from '@/stores/appStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

describe('WorkspaceLayout', () => {
  it('renders the workspace shell and reacts to current file changes', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(WorkspaceLayout, {
      global: {
        plugins: [pinia],
      },
    })

    const workspaceStore = useWorkspaceStore()

    expect(wrapper.find('[data-section="workspace-tree"]').exists()).toBe(true)
    expect(wrapper.find('[data-section="workspace-tabs"]').exists()).toBe(true)
    expect(wrapper.find('[data-section="workspace-inspector"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('auth.ts')

    workspaceStore.selectFile('auth-service')
    await nextTick()

    expect(wrapper.text()).toContain('refresh-token.ts')
  })
})
