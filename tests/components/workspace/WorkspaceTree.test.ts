import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import WorkspaceTree from '@/components/workspace/WorkspaceTree.vue'
import { useAppStore } from '@/stores/appStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

describe('WorkspaceTree', () => {
  it('renders a semantic tree and changes the current file when selecting an item', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(WorkspaceTree, {
      global: {
        plugins: [pinia],
      },
    })

    const workspaceStore = useWorkspaceStore()

    expect(wrapper.find('[role="tree"]').exists()).toBe(true)

    await wrapper.get('[data-file-id="auth-service"]').trigger('click')
    await nextTick()

    expect(workspaceStore.currentFile?.name).toBe('refresh-token.ts')
  })

  it('creates and deletes files from tree actions', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(WorkspaceTree, {
      global: {
        plugins: [pinia],
      },
    })

    const workspaceStore = useWorkspaceStore()

    await wrapper.get('[data-action="create-file"]').trigger('click')
    await nextTick()

    expect(workspaceStore.currentFile?.name).toBe('untitled-3.ts')
    expect(wrapper.text()).toContain('untitled-3.ts')

    await wrapper.get('[data-action="delete-current-file"]').trigger('click')
    await nextTick()

    expect(wrapper.text()).not.toContain('untitled-3.ts')
  })
})
