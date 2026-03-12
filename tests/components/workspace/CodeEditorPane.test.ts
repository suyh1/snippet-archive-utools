import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
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

    const workspaceStore = useWorkspaceStore()

    expect(wrapper.find('.cm-editor').exists()).toBe(true)
    expect(wrapper.text()).toContain('auth.ts')

    workspaceStore.selectFile('auth-service')
    await nextTick()

    expect(wrapper.text()).toContain('refresh-token.ts')
  })
})
