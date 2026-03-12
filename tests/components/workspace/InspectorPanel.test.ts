import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import InspectorPanel from '@/components/workspace/InspectorPanel.vue'
import { useAppStore } from '@/stores/appStore'
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

describe('InspectorPanel', () => {
  it('updates workspace title and description from the inspector form', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    const workspaceDataStore = useWorkspaceDataStore(pinia)
    workspaceDataStore.init()
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(InspectorPanel, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('[data-field="workspace-title"]').setValue('Auth Toolkit Pro')
    await wrapper.get('[data-field="workspace-description"]').setValue('updated description')
    await nextTick()

    expect(workspaceDataStore.getWorkspace('workspace-auth')?.title).toBe('Auth Toolkit Pro')
    expect(workspaceDataStore.getWorkspace('workspace-auth')?.description).toBe('updated description')
  })

  it('exports the current workspace from the inspector action', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    const workspaceDataStore = useWorkspaceDataStore(pinia)
    workspaceDataStore.init()
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(InspectorPanel, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('[data-action="export-workspace"]').trigger('click')

    expect(exportWorkspaceToJSON).toHaveBeenCalledTimes(1)
  })

  it('renames the current file from inspector controls', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    const workspaceDataStore = useWorkspaceDataStore(pinia)
    workspaceDataStore.init()
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(InspectorPanel, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('[data-field="file-name"]').setValue('session.ts')
    await nextTick()

    expect(workspaceDataStore.getWorkspace('workspace-auth')?.files[0]?.name).toBe('session.ts')
    expect(workspaceDataStore.getWorkspace('workspace-auth')?.files[0]?.path).toBe('/src/session.ts')
  })

  it('deletes the current workspace and returns to library view', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    const workspaceDataStore = useWorkspaceDataStore(pinia)
    workspaceDataStore.init()
    appStore.openWorkspace('workspace-auth')

    const wrapper = mount(InspectorPanel, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('[data-action="delete-workspace"]').trigger('click')

    expect(workspaceDataStore.getWorkspace('workspace-auth')).toBeUndefined()
    expect(appStore.currentView).toBe('library')
    expect(appStore.activeWorkspaceId).toBeNull()
  })

  it('renames the selected folder and updates its path', async () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)
    const workspaceDataStore = useWorkspaceDataStore(pinia)
    workspaceDataStore.init()
    appStore.openWorkspace('workspace-auth')

    const workspaceStore = useWorkspaceStore(pinia)
    workspaceStore.createFolder()
    workspaceStore.selectFolder('/src/new-folder-1')

    const wrapper = mount(InspectorPanel, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('[data-field="folder-name"]').setValue('services')
    await nextTick()

    expect(workspaceDataStore.getWorkspace('workspace-auth')?.files.some((file) => file.path === '/src/services')).toBe(true)
  })
})
