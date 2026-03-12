import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import LibraryLayout from '@/components/library/LibraryLayout.vue'
import { useLibraryStore } from '@/stores/libraryStore'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'

describe('LibraryLayout', () => {
  it('renders the three-column library shell and updates preview when selection changes', async () => {
    const pinia = createPinia()
    const wrapper = mount(LibraryLayout, {
      global: {
        plugins: [pinia],
      },
    })

    const libraryStore = useLibraryStore()

    expect(wrapper.find('[data-section="library-nav"]').exists()).toBe(true)
    expect(wrapper.find('[data-section="library-content"]').exists()).toBe(true)
    expect(wrapper.find('[data-section="library-preview"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Auth Toolkit')

    libraryStore.selectWorkspace('workspace-snippets')
    await nextTick()

    expect(wrapper.text()).toContain('Snippet Recipes')
    expect(wrapper.text()).not.toContain('Auth Toolkit · 一个用于登录流程与 Token 刷新的工作区')
  })

  it('shows a polished empty state when there are no workspaces', async () => {
    const pinia = createPinia()
    const wrapper = mount(LibraryLayout, {
      global: {
        plugins: [pinia],
      },
    })

    const workspaceDataStore = useWorkspaceDataStore()
    workspaceDataStore.workspaceDocs = new Map()
    await nextTick()

    expect(wrapper.text()).toContain('还没有工作区')
    expect(wrapper.find('[data-empty-action="create-workspace"]').exists()).toBe(true)
  })
})
