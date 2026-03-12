<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  Compartment,
  EditorState,
  EditorView,
  getEditorExtensions,
  getLanguageExtension,
} from '@/utils/codemirror'
import { getThemeExtension } from '@/utils/themes'
import { useSettingsStore } from '@/stores/settingsStore'
import { useEditorStore } from '@/stores/editorStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspaceStore = useWorkspaceStore()
const settingsStore = useSettingsStore()
const editorStore = useEditorStore()

const content = computed(() => workspaceStore.currentFile?.content ?? '')
const editorHost = ref<HTMLDivElement | null>(null)

let editorView: EditorView | null = null
const langCompartment = new Compartment()
const themeCompartment = new Compartment()
const fontSizeCompartment = new Compartment()
const wordWrapCompartment = new Compartment()
const minimapCompartment = new Compartment()
const lineNumbersCompartment = new Compartment()
const tabSizeCompartment = new Compartment()

const saveLabel = computed(() => (
  editorStore.currentSaveState === 'dirty' ? '未保存' : '已同步'
))

function createEditorState() {
  const file = workspaceStore.currentFile
  if (!file) return null

  return EditorState.create({
    doc: file.content,
    extensions: getEditorExtensions({
      langCompartment,
      themeCompartment,
      fontSizeCompartment,
      wordWrapCompartment,
      minimapCompartment,
      lineNumbersCompartment,
      tabSizeCompartment,
      langExtension: getLanguageExtension(file.language),
      themeExtension: getThemeExtension(settingsStore.settings.theme),
      settings: {
        ...settingsStore.settings,
        showMinimap: false,
      },
      onContentChange: (nextContent) => {
        if (!workspaceStore.currentFile) return
        workspaceStore.updateFileContent(workspaceStore.currentFile.id, nextContent)
        editorStore.markDirty(workspaceStore.currentFile.id)
      },
    }),
  })
}

function mountEditor() {
  if (!editorHost.value) return
  const state = createEditorState()
  if (!state) return

  if (editorView) {
    editorView.destroy()
  }

  editorView = new EditorView({
    state,
    parent: editorHost.value,
  })
}

watch(() => workspaceStore.currentFile?.id, async () => {
  await nextTick()
  mountEditor()
})

watch(() => settingsStore.settings.theme, async () => {
  await nextTick()
  mountEditor()
})

onMounted(() => {
  mountEditor()
})

onUnmounted(() => {
  editorView?.destroy()
  editorView = null
})
</script>

<template>
  <section class="editor-pane glass-panel-strong">
    <span class="section-kicker">Editor</span>
    <div class="editor-pane__header">
      <h3>{{ workspaceStore.currentFile?.name }}</h3>
      <span class="status-pill">{{ saveLabel }}</span>
    </div>
    <div ref="editorHost" class="editor-host" />
    <p class="editor-path">{{ workspaceStore.currentFile?.path }}</p>
  </section>
</template>

<style scoped>
.editor-pane {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border-radius: 30px;
  min-height: 420px;
  box-shadow: var(--shadow-floating);
}

.section-kicker {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.editor-pane h3 {
  color: var(--text-primary);
  font-size: 20px;
}

.editor-pane__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.editor-host {
  min-height: 360px;
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg-glass-strong) 88%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.editor-path {
  color: var(--text-secondary);
}

.status-pill {
  border-radius: 999px;
  padding: 6px 10px;
  background: color-mix(in srgb, var(--bg-glass) 88%, transparent);
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
