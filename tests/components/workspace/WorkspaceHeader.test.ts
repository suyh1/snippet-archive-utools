import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import WorkspaceHeader from '@/components/workspace/WorkspaceHeader.vue'
import { useAppStore } from '@/stores/appStore'
import { useEditorStore } from '@/stores/editorStore'
import { useWorkspaceDataStore } from '@/stores/workspaceDataStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const { exportWorkspaceToJSON } = vi.hoisted(() => ({
  exportWorkspaceToJSON: vi.fn(),
}))

vi.mock('@/utils/export', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/export')>()
  return {
    ...actual,
    exportWorkspaceToJSON,
  }
})

describe('WorkspaceHeader', () => {
  it('creates a new file from the header action', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    const workspaceDataStore = useWorkspaceDataStore(pinia)
    workspaceDataStore.init()
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(WorkspaceHeader, {
      global: {
        plugins: [pinia],
      },
    })

    const workspaceStore = useWorkspaceStore()

    await wrapper.get('[data-action="header-create-file"]').trigger('click')
    await nextTick()

    expect(workspaceStore.currentFile?.name).toBe('untitled-1.ts')
  })

  it('marks current file saved from the header save action', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    const workspaceDataStore = useWorkspaceDataStore(pinia)
    workspaceDataStore.init()
    appStore.openWorkspace('workspace-auth')

    const editorStore = useEditorStore(pinia)
    editorStore.markDirty('auth-index')

    const wrapper = mount(WorkspaceHeader, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('[data-action="header-save"]').trigger('click')

    expect(editorStore.currentSaveState).toBe('saved')
  })

  it('exports the current workspace from the header action', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    const workspaceDataStore = useWorkspaceDataStore(pinia)
    workspaceDataStore.init()
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(WorkspaceHeader, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('[data-action="header-export"]').trigger('click')

    expect(exportWorkspaceToJSON).toHaveBeenCalledTimes(1)
  })
})
