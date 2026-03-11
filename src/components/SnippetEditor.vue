<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  CopyOutlined,
  DeleteOutlined,
  BgColorsOutlined,
  CheckOutlined,
  PlusOutlined,
  CloseOutlined,
  StarOutlined,
  StarFilled,
  DownloadOutlined,
} from '@ant-design/icons-vue'
import {
  getLanguageExtension,
  getEditorExtensions,
  detectLanguage,
  Compartment,
  EditorState,
  EditorView,
} from '@/utils/codemirror'
import { getThemeExtension, EDITOR_THEMES } from '@/utils/themes'
import { exportFragmentToFile } from '@/utils/export'
import { useSnippetStore } from '@/stores/snippetStore'
import { useFolderStore } from '@/stores/folderStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { SUPPORTED_LANGUAGES } from '@/types'

const snippetStore = useSnippetStore()
const folderStore = useFolderStore()
const settingsStore = useSettingsStore()

const snippet = computed(() => {
  if (folderStore.selectedType === 'snippet' && folderStore.selectedKey) {
    return snippetStore.getSnippet(folderStore.selectedKey) ?? null
  }
  return null
})

const activeFragment = computed(() => {
  if (!snippet.value) return null
  return snippet.value.fragments.find((fragment) => fragment.id === snippet.value!.activeFragmentId)
    ?? snippet.value.fragments[0] ?? null
})

const editorContainer = ref<HTMLDivElement | null>(null)
let editorView: EditorView | null = null
const langCompartment = new Compartment()
const themeCompartment = new Compartment()
const fontSizeCompartment = new Compartment()
const wordWrapCompartment = new Compartment()
const minimapCompartment = new Compartment()
const lineNumbersCompartment = new Compartment()
const tabSizeCompartment = new Compartment()

const localTitle = ref('')
const localTags = ref<string[]>([])
const localDescription = ref('')
const showDescription = ref(false)

const cursorLine = ref(1)
const cursorCol = ref(1)
const saveStatus = ref<'saved' | 'saving'>('saved')

const renamingFragId = ref<string | null>(null)
const fragRenameValue = ref('')
const fragRenameRef = ref<HTMLInputElement | null>(null)

let snippetSaveTimer: ReturnType<typeof setTimeout> | null = null
let contentSaveTimer: ReturnType<typeof setTimeout> | null = null
let suppressUpdate = false
let pendingSnippetSave: { snippetId: string; changes: Record<string, unknown> } | null = null
let pendingContentSave: { snippetId: string; fragmentId: string; code: string } | null = null

const darkThemes = computed(() => EDITOR_THEMES.filter((theme) => theme.dark))
const lightThemes = computed(() => EDITOR_THEMES.filter((theme) => !theme.dark))

function markSaving() {
  saveStatus.value = 'saving'
}

function markSaved() {
  saveStatus.value = 'saved'
}

function getCurrentEditorCode(): string {
  if (editorView) {
    return editorView.state.doc.toString()
  }
  return activeFragment.value?.code ?? ''
}

function flushPendingSnippetSave() {
  if (snippetSaveTimer) {
    clearTimeout(snippetSaveTimer)
    snippetSaveTimer = null
  }
  if (!pendingSnippetSave) return

  const { snippetId, changes } = pendingSnippetSave
  pendingSnippetSave = null
  snippetStore.updateSnippet(snippetId, changes)
  markSaved()
}

function flushPendingContentSave() {
  if (contentSaveTimer) {
    clearTimeout(contentSaveTimer)
    contentSaveTimer = null
  }
  if (!pendingContentSave) return

  const { snippetId, fragmentId, code } = pendingContentSave
  pendingContentSave = null
  snippetStore.updateFragment(snippetId, fragmentId, { code })
  markSaved()
}

function flushPendingSaves() {
  flushPendingSnippetSave()
  flushPendingContentSave()
}

function scheduleSnippetSave(snippetId: string, changes: Record<string, unknown>) {
  markSaving()
  pendingSnippetSave = pendingSnippetSave?.snippetId === snippetId
    ? { snippetId, changes: { ...pendingSnippetSave.changes, ...changes } }
    : { snippetId, changes }

  if (snippetSaveTimer) clearTimeout(snippetSaveTimer)
  snippetSaveTimer = setTimeout(() => {
    flushPendingSnippetSave()
  }, 300)
}

function scheduleContentSave(snippetId: string, fragmentId: string, code: string) {
  markSaving()
  pendingContentSave = { snippetId, fragmentId, code }
  if (contentSaveTimer) clearTimeout(contentSaveTimer)
  contentSaveTimer = setTimeout(() => {
    flushPendingContentSave()
  }, 300)
}

function persistCurrentEditorContent() {
  if (!snippet.value || !activeFragment.value) return
  pendingContentSave = {
    snippetId: snippet.value.id,
    fragmentId: activeFragment.value.id,
    code: getCurrentEditorCode(),
  }
  flushPendingContentSave()
}

function handleTitleChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  localTitle.value = value
  if (!snippet.value) return
  scheduleSnippetSave(snippet.value.id, { title: value })
}

function handleLanguageChange(value: string) {
  if (!snippet.value || !activeFragment.value) return
  snippetStore.updateFragment(snippet.value.id, activeFragment.value.id, { language: value })
  updateEditorLanguage(value)
}

function handleTagsChange(value: string[]) {
  localTags.value = value
  if (!snippet.value) return
  snippetStore.updateSnippet(snippet.value.id, { tags: value })
}

function handleDescriptionChange(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  localDescription.value = value
  if (!snippet.value) return
  scheduleSnippetSave(snippet.value.id, { description: value })
}

function handleThemeChange({ key }: { key: string }) {
  settingsStore.updateSettings({ theme: key })
  updateEditorTheme(key)
}

function handleAutoDetect() {
  if (!snippet.value || !activeFragment.value) return
  const code = getCurrentEditorCode()
  const detected = detectLanguage(code, activeFragment.value.title)
  if (detected && detected !== activeFragment.value.language) {
    handleLanguageChange(detected)
    const label = SUPPORTED_LANGUAGES.find((language) => language.value === detected)?.label ?? detected
    message.success(`已识别为 ${label}`)
  } else if (!detected) {
    message.info('无法自动识别代码类型')
  } else {
    message.info('当前类型已正确')
  }
}

function handleToggleStar() {
  if (!snippet.value) return
  snippetStore.toggleStar(snippet.value.id)
}

function handleCopyCode() {
  if (!activeFragment.value) return
  const code = getCurrentEditorCode()
  if (snippet.value) {
    scheduleContentSave(snippet.value.id, activeFragment.value.id, code)
  }
  if (window.utools) {
    window.utools.copyText(code)
  } else {
    navigator.clipboard.writeText(code)
  }
  message.success('代码已复制')
}

function handleExportFragment() {
  if (!snippet.value || !activeFragment.value) return
  const fragment = {
    ...activeFragment.value,
    code: getCurrentEditorCode(),
  }
  scheduleContentSave(snippet.value.id, activeFragment.value.id, fragment.code)
  exportFragmentToFile(snippet.value, fragment)
}

function handleDelete() {
  if (!snippet.value) return
  const id = snippet.value.id
  const title = snippet.value.title
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除「${title}」吗？此操作不可恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      snippetStore.deleteSnippet(id)
      folderStore.selectNode(null, null)
    },
  })
}

function switchFragment(fragmentId: string) {
  if (!snippet.value || fragmentId === snippet.value.activeFragmentId) return
  persistCurrentEditorContent()
  snippetStore.setActiveFragment(snippet.value.id, fragmentId)
}

function addFragment() {
  if (!snippet.value) return
  persistCurrentEditorContent()
  snippetStore.addFragment(snippet.value.id)
}

function removeFragment(fragmentId: string) {
  if (!snippet.value || snippet.value.fragments.length <= 1) return
  persistCurrentEditorContent()
  snippetStore.removeFragment(snippet.value.id, fragmentId)
}

function startFragRename(fragmentId: string, title: string) {
  renamingFragId.value = fragmentId
  fragRenameValue.value = title
  nextTick(() => {
    fragRenameRef.value?.focus()
    fragRenameRef.value?.select()
  })
}

function confirmFragRename() {
  if (!renamingFragId.value || !snippet.value || !fragRenameValue.value.trim()) {
    renamingFragId.value = null
    return
  }
  snippetStore.updateFragment(snippet.value.id, renamingFragId.value, { title: fragRenameValue.value.trim() })
  renamingFragId.value = null
}

function updateEditorLanguage(language: string) {
  if (!editorView) return
  const languageExtension = getLanguageExtension(language)
  editorView.dispatch({ effects: langCompartment.reconfigure(languageExtension ? [languageExtension] : []) })
}

function updateEditorTheme(themeId: string) {
  if (!editorView) return
  editorView.dispatch({ effects: themeCompartment.reconfigure([getThemeExtension(themeId)]) })
}

function createEditorState(doc: string, language: string): EditorState {
  const languageExtension = getLanguageExtension(language)
  const themeExtension = getThemeExtension(settingsStore.settings.theme)
  return EditorState.create({
    doc,
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
      settings: settingsStore.settings,
      onContentChange: (code) => {
        if (!suppressUpdate && snippet.value && activeFragment.value) {
          scheduleContentSave(snippet.value.id, activeFragment.value.id, code)
        }
      },
      onCursorChange: (line, column) => {
        cursorLine.value = line
        cursorCol.value = column
      },
    }),
  })
}

function initEditor(doc = activeFragment.value?.code ?? '', language = activeFragment.value?.language ?? 'plaintext') {
  if (!editorContainer.value || !activeFragment.value) return
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
  const state = createEditorState(doc, language)
  editorView = new EditorView({ state, parent: editorContainer.value })
}

function syncLocalState() {
  if (!snippet.value) return
  localTitle.value = snippet.value.title
  localTags.value = [...snippet.value.tags]
  localDescription.value = snippet.value.description
  showDescription.value = Boolean(snippet.value.description)
}

function loadFragmentIntoEditor() {
  if (!activeFragment.value || !editorView) return
  suppressUpdate = true
  editorView.dispatch({
    changes: { from: 0, to: editorView.state.doc.length, insert: activeFragment.value.code },
  })
  suppressUpdate = false
  updateEditorLanguage(activeFragment.value.language)
}

watch(() => snippet.value?.id, () => {
  flushPendingSaves()
  nextTick(() => {
    if (!snippet.value) return
    syncLocalState()
    if (editorView) {
      loadFragmentIntoEditor()
    } else {
      initEditor()
    }
    if (activeFragment.value?.language === 'plaintext' && activeFragment.value.code) {
      const detected = detectLanguage(activeFragment.value.code, activeFragment.value.title)
      if (detected) handleLanguageChange(detected)
    }
  })
})

watch(() => snippet.value?.activeFragmentId, () => {
  flushPendingContentSave()
  nextTick(() => {
    if (editorView && activeFragment.value) {
      loadFragmentIntoEditor()
    } else if (activeFragment.value) {
      initEditor()
    }
  })
})

watch(() => settingsStore.settings, () => {
  if (!editorView || !activeFragment.value) return
  const code = getCurrentEditorCode()
  initEditor(code, activeFragment.value.language)
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    syncLocalState()
    initEditor()
  })
})

onUnmounted(() => {
  if (snippet.value && activeFragment.value) {
    persistCurrentEditorContent()
  }
  flushPendingSaves()
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
})

function forceSave(silent = false) {
  flushPendingSnippetSave()
  if (snippet.value && activeFragment.value) {
    pendingContentSave = {
      snippetId: snippet.value.id,
      fragmentId: activeFragment.value.id,
      code: getCurrentEditorCode(),
    }
    flushPendingContentSave()
    if (!silent) {
      message.success('已保存')
    }
  }
}

defineExpose({ forceSave, handleExportFragment, handleDelete })
</script>

<template>
  <div v-if="snippet" class="snippet-editor">
    <div class="editor-header">
      <div class="header-top">
        <a-input
          :value="localTitle"
          :bordered="false"
          placeholder="片段标题"
          class="title-input"
          @input="handleTitleChange"
        />
        <a-button
          size="small"
          type="text"
          :class="{ 'star-active': snippet.starred }"
          @click="handleToggleStar"
        >
          <template #icon>
            <StarFilled v-if="snippet.starred" />
            <StarOutlined v-else />
          </template>
        </a-button>
        <a-button size="small" danger type="text" @click="handleDelete">
          <template #icon><DeleteOutlined /></template>
        </a-button>
      </div>
      <a-select
        :value="localTags"
        mode="tags"
        style="width: 100%"
        placeholder="添加标签..."
        size="small"
        @change="handleTagsChange"
      />
    </div>

    <div class="fragment-tabs">
      <div
        v-for="frag in snippet.fragments"
        :key="frag.id"
        class="frag-tab"
        :class="{ active: frag.id === snippet.activeFragmentId }"
        @click="switchFragment(frag.id)"
        @dblclick="startFragRename(frag.id, frag.title)"
      >
        <template v-if="renamingFragId === frag.id">
          <input
            ref="fragRenameRef"
            v-model="fragRenameValue"
            class="frag-rename-input"
            @keyup.enter="confirmFragRename"
            @blur="confirmFragRename"
            @keyup.esc="renamingFragId = null"
            @click.stop
          />
        </template>
        <template v-else>
          <span class="frag-tab-title">{{ frag.title }}</span>
          <CloseOutlined
            v-if="snippet.fragments.length > 1"
            class="frag-close"
            @click.stop="removeFragment(frag.id)"
          />
        </template>
      </div>
      <div class="frag-tab add-tab" @click="addFragment">
        <PlusOutlined />
      </div>
    </div>

    <div class="toolbar-row">
      <a-select
        :value="activeFragment?.language"
        :options="SUPPORTED_LANGUAGES"
        style="width: 150px"
        size="small"
        show-search
        :filter-option="(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())"
        @change="handleLanguageChange"
      />
      <a-button size="small" @click="handleAutoDetect">识别</a-button>
      <a-button size="small" @click="showDescription = !showDescription">
        {{ showDescription ? '隐藏描述' : '显示描述' }}
      </a-button>
      <a-dropdown :trigger="['click']">
        <a-button size="small">
          <template #icon><BgColorsOutlined /></template> 主题
        </a-button>
        <template #overlay>
          <a-menu @click="handleThemeChange" :selected-keys="[settingsStore.settings.theme]">
            <a-menu-item-group title="深色主题">
              <a-menu-item v-for="theme in darkThemes" :key="theme.value">
                {{ theme.label }}
                <CheckOutlined v-if="settingsStore.settings.theme === theme.value" class="theme-check" />
              </a-menu-item>
            </a-menu-item-group>
            <a-menu-item-group title="浅色主题">
              <a-menu-item v-for="theme in lightThemes" :key="theme.value">
                {{ theme.label }}
                <CheckOutlined v-if="settingsStore.settings.theme === theme.value" class="theme-check" />
              </a-menu-item>
            </a-menu-item-group>
          </a-menu>
        </template>
      </a-dropdown>
      <a-button size="small" @click="handleCopyCode">
        <template #icon><CopyOutlined /></template> 复制
      </a-button>
      <a-button size="small" @click="handleExportFragment">
        <template #icon><DownloadOutlined /></template> 导出
      </a-button>
    </div>

    <div v-if="showDescription" class="description-area">
      <a-textarea
        :value="localDescription"
        placeholder="添加描述..."
        :auto-size="{ minRows: 2, maxRows: 4 }"
        @input="handleDescriptionChange"
      />
    </div>

    <div ref="editorContainer" class="editor-container" />

    <div class="status-bar">
      <span>行 {{ cursorLine }}, 列 {{ cursorCol }}</span>
      <span>{{ activeFragment?.language === 'plaintext' ? '纯文本' : SUPPORTED_LANGUAGES.find((language) => language.value === activeFragment?.language)?.label ?? activeFragment?.language }}</span>
      <span>{{ settingsStore.settings.tabSize }} 空格</span>
      <span class="save-status">{{ saveStatus === 'saved' ? '已保存' : '保存中...' }}</span>
    </div>
  </div>
</template>

<style scoped>
.snippet-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--bg-primary);
}
.editor-header {
  flex-shrink: 0;
  padding: 8px 12px 4px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}
.header-top {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}
.title-input {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  padding-left: 0;
  background: transparent;
  color: var(--text-primary);
}
.star-active { color: var(--star-color); }
.fragment-tabs {
  display: flex;
  align-items: stretch;
  background: var(--tab-bg);
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
  flex-shrink: 0;
}
.fragment-tabs::-webkit-scrollbar { height: 0; }
.frag-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  border-right: 1px solid var(--border-color);
  white-space: nowrap;
  color: var(--text-secondary);
  transition: background 0.15s;
  min-height: 30px;
}
.frag-tab:hover { background: var(--bg-hover); }
.frag-tab.active {
  background: var(--tab-active-bg);
  color: var(--text-primary);
  font-weight: 500;
  border-bottom: 2px solid var(--accent-color);
}
.frag-tab-title { max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
.frag-close { font-size: 10px; opacity: 0.4; transition: opacity 0.15s; }
.frag-close:hover { opacity: 1; color: var(--danger-color); }
.frag-rename-input {
  width: 100px;
  border: 1px solid var(--accent-color);
  border-radius: 2px;
  padding: 0 4px;
  font-size: 12px;
  outline: none;
  background: var(--bg-primary);
  color: var(--text-primary);
}
.add-tab { color: var(--text-tertiary); padding: 4px 10px; }
.add-tab:hover { color: var(--accent-color); }
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}
.theme-check { margin-left: 8px; color: var(--accent-color); font-size: 12px; }
.description-area { padding: 4px 8px; background: var(--bg-secondary); }
.editor-container { flex: 1; overflow: hidden; }
.editor-container :deep(.cm-editor) { height: 100%; }
.status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 2px 12px;
  font-size: 11px;
  color: var(--text-tertiary);
  background: var(--status-bar-bg);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}
.save-status { margin-left: auto; }
</style>
