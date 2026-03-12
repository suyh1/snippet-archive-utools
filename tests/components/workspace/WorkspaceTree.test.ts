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

    expect(workspaceStore.currentFile?.name).toBe('untitled-1.ts')
    expect(wrapper.text()).toContain('untitled-1.ts')

    await wrapper.get('[data-action="delete-current-file"]').trigger('click')
    await nextTick()

    expect(wrapper.text()).not.toContain('untitled-3.ts')
  })

  it('renders folders from workspace paths and allows creating a folder', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(WorkspaceTree, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.find('[data-folder-path="/src"]').exists()).toBe(true)

    await wrapper.get('[data-action="create-folder"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-folder-path="/src/new-folder-1"]').exists()).toBe(true)
  })

  it('moves a file into a folder through drag and drop', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(WorkspaceTree, {
      global: {
        plugins: [pinia],
      },
    })

    const workspaceStore = useWorkspaceStore()
    workspaceStore.createFolder()
    await nextTick()

    await wrapper.get('[data-file-id="auth-index"]').trigger('dragstart')
    await wrapper.get('[data-folder-path="/src"]').trigger('drop')
    await nextTick()

    expect(workspaceStore.currentWorkspace?.files.find((file) => file.id === 'auth-index')?.path).toBe('/src/auth.ts')

    await wrapper.get('[data-file-id="auth-index"]').trigger('dragstart')
    await wrapper.get('[data-folder-path="/src/new-folder-1"]').trigger('drop')
    await nextTick()

    expect(workspaceStore.currentWorkspace?.files.find((file) => file.id === 'auth-index')?.path).toBe('/src/new-folder-1/auth.ts')
  })
})
