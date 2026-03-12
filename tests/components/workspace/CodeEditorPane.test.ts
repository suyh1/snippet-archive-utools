import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import CodeEditorPane from '@/components/workspace/CodeEditorPane.vue'
import { useAppStore } from '@/stores/appStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

describe('CodeEditorPane', () => {
  it('mounts a CodeMirror instance and updates when the current file changes', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(CodeEditorPane, {
      attachTo: document.body,
      global: {
        plugins: [pinia],
      },
    })
    await flushPromises()
    await nextTick()

    const workspaceStore = useWorkspaceStore()

    await vi.waitFor(() => {
      expect(wrapper.find('.cm-editor').exists()).toBe(true)
    })
    expect(wrapper.text()).toContain('auth.ts')

    workspaceStore.selectFile('auth-service')
    await nextTick()
    await flushPromises()

    expect(wrapper.text()).toContain('refresh-token.ts')
  })
})
