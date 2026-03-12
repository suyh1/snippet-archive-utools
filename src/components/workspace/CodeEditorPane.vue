<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  Compartment,
  EditorState,
  EditorView,
  getEditorExtensions,
  loadLanguageExtension,
} from '@/utils/codemirror'
import { loadThemeExtension } from '@/utils/themes'
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
const isLoadingEditor = ref(false)

async function createEditorState() {
  const file = workspaceStore.currentFile
  if (!file) return null

  const [languageExtension, themeExtension] = await Promise.all([
    loadLanguageExtension(file.language),
    loadThemeExtension(settingsStore.settings.theme),
  ])

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
      langExtension: languageExtension,
      themeExtension,
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

async function mountEditor() {
  if (!editorHost.value) return
  isLoadingEditor.value = true
  const state = await createEditorState()
  if (!state) return

  if (editorView) {
    editorView.destroy()
  }

  editorView = new EditorView({
    state,
    parent: editorHost.value,
  })
  isLoadingEditor.value = false
}

watch(() => workspaceStore.currentFile?.id, async () => {
  await nextTick()
  await mountEditor()
})

watch(() => settingsStore.settings.theme, async () => {
  await nextTick()
  await mountEditor()
})

onMounted(() => {
  void mountEditor()
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
    <div ref="editorHost" class="editor-host">
      <div v-if="isLoadingEditor" class="editor-loading">Loading editor…</div>
    </div>
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
  position: relative;
  min-height: 360px;
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg-glass-strong) 88%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.editor-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--bg-glass-strong) 90%, transparent);
  z-index: 1;
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
